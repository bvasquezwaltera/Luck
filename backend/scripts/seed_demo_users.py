"""Crea perfiles de demostración peruanos (freelancers y clientes) con sus datos completos.

Uso (desde la carpeta backend, con el entorno virtual activado):
    python -m scripts.seed_demo_users --freelancers 20 --clients 5

- Los correos son `demo.<nombre>.<apellido>@example.com` (example.com es un dominio reservado: nadie puede recibir
  correo ahí ni apropiarse de las cuentas). Así se reconocen y se pueden borrar todos con `delete_demo_users`.
- Las contraseñas se generan al azar y se guardan en `demo_accounts.csv` (solo en este equipo; no se sube a GitHub).
- Cada freelancer queda con perfil, habilidades, idiomas, experiencia, estudios, planes con precio y proyectos de
  portafolio (sin imágenes). No se crean reseñas, solicitudes, contratos ni mensajes.
- Se puede repetir: sigue donde quedó, sin duplicar a nadie.
"""
import argparse
import csv
import random
import secrets
import unicodedata
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.database import engine
from app.models.perfil import Perfil
from app.models.perfil_freelancer import PerfilFreelancer
from app.schemas.freelancer_profile import FreelancerProfile
from app.schemas.portfolio_project import PortfolioProject
from app.schemas.subscription_plan import SubscriptionPlan, SubscriptionPlanFeature
from app.services import auth_validation, portfolio_projects_service, profile_service, subscription_plans_service
from app.services.supabase_client import supabase_auth
from app.services.utils import get_initials
from scripts import demo_data as D

DOMAIN = "example.com"
PREFIX = "demo."
CSV_PATH = Path(__file__).resolve().parent.parent / "demo_accounts.csv"
THIS_YEAR = date.today().year


def slug(text: str) -> str:
    plain = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return "".join(ch for ch in plain.lower() if ch.isalnum())


def new_password() -> str:
    # Los sufijos garantizan mayúscula, minúscula, número y carácter especial (las reglas de la plataforma).
    return secrets.token_urlsafe(9) + "Aa1!"


def existing_demo_emails() -> set[str]:
    emails: set[str] = set()
    page = 1
    while True:
        users = supabase_auth.auth.admin.list_users(page=page, per_page=200)
        if not users:
            break
        emails.update((u.email or "").lower() for u in users if (u.email or "").lower().startswith(PREFIX))
        if len(users) < 200:
            break
        page += 1
    return emails


def pick_person(rng: random.Random, used_emails: set[str]) -> tuple[str, str]:
    """Un nombre completo peruano y su correo de demostración, que no se repita."""
    for _ in range(200):
        first = rng.choice(D.FIRST_NAMES_F + D.FIRST_NAMES_M)
        s1, s2 = rng.sample(D.SURNAMES, 2)
        name = f"{first} {s1} {s2}"
        assert auth_validation.validate_full_name(name) is None, name
        email = f"{PREFIX}{slug(first)}.{slug(s1)}@{DOMAIN}"
        if email in used_emails:
            email = f"{PREFIX}{slug(first)}.{slug(s1)}.{slug(s2)}@{DOMAIN}"
        if email not in used_emails:
            return name, email
    raise RuntimeError("No se encontró un nombre libre")


def round5(value: float) -> int:
    return int(round(value / 5.0) * 5)


def freelancer_content(rng: random.Random, category: str, name: str) -> dict:
    data = D.CATEGORY_DATA[category]
    first = name.split()[0]
    specialty = rng.choice(data["specialties"])
    city = rng.choice(D.CITIES)
    years = rng.randint(2, 9)
    services = rng.sample(data["services"], 3)

    intro = rng.choice(D.INTROS).format(name=first, specialty=specialty[0].lower() + specialty[1:])
    bio = "\n\n".join(
        [
            f"{intro} Tengo {years} años de experiencia en {category.lower()}.",
            f"Mis servicios incluyen {services[0]}, {services[1]} y {services[2]}. Trabajo con un brief claro, entregas por etapas y comunicación constante.",
            rng.choice(D.CLOSERS).format(city=city),
        ]
    )

    first_year = max(2012, THIS_YEAR - years - rng.randint(0, 2))
    experience = [
        {
            "period": f"{first_year} – Presente",
            "role": rng.choice(data["roles"]),
            "company": rng.choice(D.COMPANIES),
            "description": f"Desarrollo de {services[0]} y {services[1]} para clientes de distintos rubros en el Perú.",
        }
    ]
    if years > 4:
        end = first_year
        start = max(2010, end - rng.randint(2, 3))
        experience.append(
            {
                "period": f"{start} – {end}",
                "role": rng.choice(data["roles"]),
                "company": rng.choice(D.COMPANIES),
                "description": f"Apoyo en {services[2]} y atención directa a clientes.",
            }
        )
    study_end = min(THIS_YEAR - 1, first_year - rng.randint(0, 2))
    education = [
        {"period": f"{study_end - 5} – {study_end}", "degree": rng.choice(data["degrees"]), "institution": rng.choice(D.UNIVERSITIES)}
    ]
    languages = [{"name": "Español", "level": "Nativo"}, {"name": "Inglés", "level": rng.choice(D.LEVELS_EN)}]
    if rng.random() < 0.12:
        languages.append({"name": "Quechua", "level": rng.choice(["Básico", "Intermedio", "Nativo"])})

    return {
        "specialty": specialty,
        "bio": bio,
        "differentiators": rng.sample(D.DIFFERENTIATORS, rng.randint(2, 3)),
        "skills": rng.sample(data["skills"], rng.randint(5, 7)),
        "tools": rng.sample(data["tools"], rng.randint(3, 4)),
        "languages": languages,
        "experience": experience,
        "education": education,
        "workMethods": [
            {"label": "Comunicación", "items": rng.sample(["Reuniones semanales", "Slack", "WhatsApp Business", "Informe de avances", "Videollamadas"], 3)},
            {"label": "Proceso", "items": ["Brief inicial", "Entregas por etapas", "Ronda de revisiones"]},
        ],
        "availabilityStatus": "Disponible para nuevos proyectos",
    }


def plans_for(rng: random.Random, category: str) -> list[SubscriptionPlan]:
    base = D.CATEGORY_DATA[category]["price"] * rng.uniform(0.8, 1.25)
    include_premium = rng.random() < 0.6
    plans = []
    for tier, label in (("basico", "Básico"), ("estandar", "Estándar"), ("premium", "Premium")):
        active = tier != "premium" or include_premium
        description, projects, revisions, features = D.PLAN_TEXT[tier]
        plans.append(
            SubscriptionPlan(
                id=f"nuevo-{tier}",
                name=label,
                tier=tier,
                description=description if active else "",
                price=float(round5(base * D.TIER_MULTIPLIER[tier])) if active else 0.0,
                activeProjects=projects if active else "",
                revisions=revisions if active else "",
                features=[SubscriptionPlanFeature(id=f"f-{i}", label=l, value=v) for i, (l, v) in enumerate(features)] if active else [],
                active=active,
            )
        )
    return plans


def projects_for(rng: random.Random, category: str) -> list[PortfolioProject]:
    data = D.CATEGORY_DATA[category]
    chosen = rng.sample(data["projects"], rng.randint(1, 2))
    result = []
    for template, stack in chosen:
        biz = rng.choice(D.BUSINESSES)
        weeks = rng.randint(2, 10)
        name = template.format(biz=biz)
        result.append(
            PortfolioProject(
                id="nuevo",
                name=name[0].upper() + name[1:],
                category=category,
                description=f"{name[0].upper() + name[1:]}: levantamiento de requerimientos, desarrollo del trabajo y entrega con documentación para el cliente.",
                techStack=stack,
                date="",
                dateValue=f"{rng.randint(THIS_YEAR - 3, THIS_YEAR - 1)}-{rng.randint(1, 12):02d}",
                duration=f"{weeks} {data['unit']}",
                url=f"https://{DOMAIN}/proyectos/{slug(name)[:40]}",
                bannerClassName=rng.choice(D.BANNER_COLORS),
                imageUrl=None,
            )
        )
    return result


def create_account(name: str, email: str, role: str) -> tuple[str, str]:
    password = new_password()
    user = supabase_auth.auth.admin.create_user(
        {"email": email, "password": password, "email_confirm": True, "user_metadata": {"full_name": name, "demo": True}}
    )
    return str(user.user.id), password


def create_freelancer(rng: random.Random, category: str, name: str, email: str) -> str:
    uid, password = create_account(name, email, "freelancer")
    try:
        with Session(engine) as db:
            db.add(
                Perfil(
                    id=uid, rol="freelancer", nombre_completo=name, pais_codigo="PE", pais="Perú",
                    zona_horaria="GMT-5 (Lima)", onboarding="completado",
                )
            )
            db.commit()
            content = freelancer_content(rng, category, name)
            db.add(
                PerfilFreelancer(
                    perfil_id=uid, especialidad=content["specialty"], categoria=category, calificacion=0, cantidad_resenas=0,
                    biografia=content["bio"],
                )
            )
            db.commit()

            base = profile_service.get_freelancer_profile(db, uid)
            merged = {**(base if isinstance(base, dict) else base.model_dump()), "category": category, "initials": get_initials(name), **content}
            result = profile_service.save_freelancer_profile(db, uid, FreelancerProfile(**merged))
            if result.get("error"):
                raise RuntimeError(result["error"])

            subscription_plans_service.save_subscription_plans(db, uid, plans_for(rng, category))
            for project in projects_for(rng, category):
                portfolio_projects_service.add_portfolio_project(db, uid, project)
    except Exception:
        supabase_auth.auth.admin.delete_user(uid)  # no se deja una cuenta a medio crear (el perfil se borra en cascada)
        raise
    return password


def create_client(name: str, email: str) -> str:
    uid, password = create_account(name, email, "client")
    try:
        with Session(engine) as db:
            db.add(
                Perfil(
                    id=uid, rol="client", nombre_completo=name, pais_codigo="PE", pais="Perú",
                    zona_horaria="GMT-5 (Lima)", onboarding="completado",
                )
            )
            db.commit()
    except Exception:
        supabase_auth.auth.admin.delete_user(uid)
        raise
    return password


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--freelancers", type=int, default=0)
    parser.add_argument("--clients", type=int, default=0)
    args = parser.parse_args()

    used = existing_demo_emails()
    # La semilla depende de cuántos hay: cada tanda crea gente distinta, y repetir el comando no repite nombres.
    rng = random.Random(10_000 + len(used))
    categories = list(D.CATEGORY_DATA)
    rng.shuffle(categories)
    offset = len(used)  # para que cada tanda siga repartiendo las categorías

    new_file = not CSV_PATH.exists()
    created = {"freelancer": 0, "client": 0}
    with CSV_PATH.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        if new_file:
            writer.writerow(["rol", "nombre", "correo", "contraseña", "categoría"])

        for index in range(args.freelancers):
            category = categories[(index + offset) % len(categories)]
            name, email = pick_person(rng, used)
            password = create_freelancer(rng, category, name, email)
            used.add(email)
            writer.writerow(["freelancer", name, email, password, category])
            handle.flush()
            created["freelancer"] += 1
            print(f"  freelancer {created['freelancer']:>3}: {name} ({category})")

        for _ in range(args.clients):
            name, email = pick_person(rng, used)
            password = create_client(name, email)
            used.add(email)
            writer.writerow(["client", name, email, password, ""])
            handle.flush()
            created["client"] += 1
            print(f"  cliente    {created['client']:>3}: {name}")

    print(f"Listo: {created['freelancer']} freelancers y {created['client']} clientes. Contraseñas en {CSV_PATH}")


if __name__ == "__main__":
    main()
