"""Validación y limpieza del perfil del freelancer antes de guardarlo.

Las mismas reglas que el formulario (frontend/src/validators/profileValidation.ts): allá se muestran por campo mientras se
edita, y aquí no se pueden saltar llamando a la API directamente. Las listas de categorías, países y zonas horarias son
copia de frontend/src/data (hay una prueba que comprueba que sigan iguales).
"""
import json
from datetime import datetime, timezone
from pathlib import Path

from app.schemas.client_profile import ClientProfileUpdate
from app.schemas.freelancer_profile import (
    EducationEntry,
    ExperienceEntry,
    FreelancerLanguage,
    FreelancerProfile,
    WorkMethodCategory,
)
from app.services import auth_validation

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load(name: str):
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


CATEGORIES: list[str] = _load("categories.json")
COUNTRIES: dict[str, str] = {country["code"]: country["name"] for country in _load("countries.json")}
TIMEZONES: list[str] = _load("timezones.json")

LANGUAGE_LEVELS = ["Básico", "Intermedio", "Avanzado", "Nativo"]
PRESENT = "Presente"
MIN_YEAR = 1950

SPECIALTY_MAX = 100
BIO_MAX = 1000
AVAILABILITY_MAX = 100
DESCRIPTION_MAX = 1000
TEXT_MAX = 100  # rol, empresa, título, institución

# lista -> (máximo de elementos, máximo de caracteres de cada uno)
DIFFERENTIATORS = (10, 150)
SKILLS = (30, 50)
TOOLS = (30, 50)
LANGUAGES_MAX = 10
LANGUAGE_NAME_MAX = 40
EXPERIENCE_MAX = 15
EDUCATION_MAX = 15
WORK_METHODS_MAX = 10
WORK_METHOD_LABEL_MAX = 50
WORK_METHOD_ITEMS = (20, 50)


class ProfileValidationError(ValueError):
    """El mensaje es para mostrarlo tal cual al usuario."""


def _text(value: str, label: str, max_length: int, required: bool = False) -> str:
    value = value.strip()
    if required and not value:
        raise ProfileValidationError(f"{label}: es obligatorio.")
    if len(value) > max_length:
        raise ProfileValidationError(f"{label}: no puede superar los {max_length} caracteres.")
    return value


def _string_list(values: list[str], label: str, limits: tuple[int, int]) -> list[str]:
    max_items, max_length = limits
    cleaned = [value.strip() for value in values if value.strip()]
    if len(cleaned) > max_items:
        raise ProfileValidationError(f"{label}: puedes agregar hasta {max_items}.")
    for value in cleaned:
        if len(value) > max_length:
            raise ProfileValidationError(f"{label}: «{value[:30]}…» supera los {max_length} caracteres.")
    return cleaned


def _year(value: str, label: str, current_year: int) -> int:
    if not value.isdigit() or not MIN_YEAR <= int(value) <= current_year:
        raise ProfileValidationError(f"{label}: el año debe estar entre {MIN_YEAR} y {current_year}.")
    return int(value)


def _period(period: str, label: str, current_year: int, allow_present: bool) -> str:
    parts = [part.strip() for part in period.split("–")]
    start, end = parts[0], (parts[1] if len(parts) > 1 else "")
    if len(parts) > 2:
        raise ProfileValidationError(f"{label}: el período no es válido.")
    if not start:
        raise ProfileValidationError(f"{label}: elige el año de inicio.")
    year_from = _year(start, f"{label} (desde)", current_year)
    if not end:
        # En experiencia, sin año de fin el formulario muestra "Presente": se guarda como tal.
        return f"{year_from} – {PRESENT}" if allow_present else str(year_from)
    if end == PRESENT:
        if not allow_present:
            raise ProfileValidationError(f"{label}: el año de fin no es válido.")
        return f"{year_from} – {PRESENT}"
    year_to = _year(end, f"{label} (hasta)", current_year)
    if year_to < year_from:
        raise ProfileValidationError(f"{label}: el año de fin no puede ser anterior al de inicio.")
    return f"{year_from} – {year_to}"


def clean_name(name: str) -> str:
    error = auth_validation.validate_full_name(name)
    if error:
        raise ProfileValidationError(error)
    return name.strip()


def clean_location(country_code: str, country: str, timezone_name: str) -> tuple[str, str, str]:
    """País y zona horaria deben ser de las listas; el nombre del país lo fija el código, no lo que mande el cliente."""
    if country_code not in COUNTRIES:
        raise ProfileValidationError("País: elige uno de la lista.")
    if timezone_name not in TIMEZONES:
        raise ProfileValidationError("Zona horaria: elige una de la lista.")
    return country_code, COUNTRIES[country_code], timezone_name


def clean_client_update(update: ClientProfileUpdate) -> ClientProfileUpdate:
    code, country, tz = clean_location(update.countryCode, update.country, update.timezone)
    return ClientProfileUpdate(name=clean_name(update.name), country=country, countryCode=code, timezone=tz)


def clean_freelancer_profile(profile: FreelancerProfile) -> FreelancerProfile:
    """Devuelve una copia limpia (sin espacios sobrantes ni filas vacías) o lanza ProfileValidationError."""
    current_year = datetime.now(timezone.utc).year
    code, country, tz = clean_location(profile.countryCode, profile.country, profile.timezone)

    category = profile.category.strip()
    if category and category not in CATEGORIES:
        raise ProfileValidationError("Categoría: elige una de la lista.")

    languages: list[FreelancerLanguage] = []
    for index, language in enumerate(profile.languages, start=1):
        name, level = language.name.strip(), language.level.strip()
        if not name and not level:
            continue  # fila vacía
        label = f"Idioma {index}"
        name = _text(name, label, LANGUAGE_NAME_MAX, required=True)
        if level not in LANGUAGE_LEVELS:
            raise ProfileValidationError(f"{label}: elige el nivel.")
        languages.append(FreelancerLanguage(name=name, level=level))
    if len(languages) > LANGUAGES_MAX:
        raise ProfileValidationError(f"Idiomas: puedes agregar hasta {LANGUAGES_MAX}.")

    experience: list[ExperienceEntry] = []
    for index, entry in enumerate(profile.experience, start=1):
        if not any(value.strip() for value in (entry.period, entry.role, entry.company, entry.description)):
            continue
        label = f"Experiencia {index}"
        experience.append(
            ExperienceEntry(
                period=_period(entry.period, label, current_year, allow_present=True),
                role=_text(entry.role, f"{label} (rol)", TEXT_MAX, required=True),
                company=_text(entry.company, f"{label} (empresa)", TEXT_MAX, required=True),
                description=_text(entry.description, f"{label} (descripción)", DESCRIPTION_MAX),
            )
        )
    if len(experience) > EXPERIENCE_MAX:
        raise ProfileValidationError(f"Experiencia: puedes agregar hasta {EXPERIENCE_MAX}.")

    education: list[EducationEntry] = []
    for index, entry in enumerate(profile.education, start=1):
        if not any(value.strip() for value in (entry.period, entry.degree, entry.institution)):
            continue
        label = f"Educación {index}"
        education.append(
            EducationEntry(
                period=_period(entry.period, label, current_year, allow_present=False),
                degree=_text(entry.degree, f"{label} (título)", TEXT_MAX, required=True),
                institution=_text(entry.institution, f"{label} (institución)", TEXT_MAX, required=True),
            )
        )
    if len(education) > EDUCATION_MAX:
        raise ProfileValidationError(f"Educación: puedes agregar hasta {EDUCATION_MAX}.")

    work_methods: list[WorkMethodCategory] = []
    for index, category_entry in enumerate(profile.workMethods, start=1):
        label = f"Categoría de métodos {index}"
        items = _string_list(category_entry.items, f"{label} (herramientas)", WORK_METHOD_ITEMS)
        name = category_entry.label.strip()
        if not name and not items:
            continue
        work_methods.append(
            WorkMethodCategory(label=_text(name, f"{label} (nombre)", WORK_METHOD_LABEL_MAX, required=True), items=items)
        )
    if len(work_methods) > WORK_METHODS_MAX:
        raise ProfileValidationError(f"Métodos de trabajo: puedes agregar hasta {WORK_METHODS_MAX} categorías.")

    return profile.model_copy(
        update={
            "name": clean_name(profile.name),
            "specialty": _text(profile.specialty, "Especialidad", SPECIALTY_MAX),
            "category": category,
            "country": country,
            "countryCode": code,
            "timezone": tz,
            "bio": _text(profile.bio, "Sobre mí", BIO_MAX),
            "availabilityStatus": _text(profile.availabilityStatus, "Disponibilidad", AVAILABILITY_MAX),
            "differentiators": _string_list(profile.differentiators, "Diferenciadores", DIFFERENTIATORS),
            "skills": _string_list(profile.skills, "Habilidades", SKILLS),
            "tools": _string_list(profile.tools, "Herramientas", TOOLS),
            "languages": languages,
            "experience": experience,
            "education": education,
            "workMethods": work_methods,
        }
    )
