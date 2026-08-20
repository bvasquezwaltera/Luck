from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.categoria_metodo_trabajo import CategoriaMetodoTrabajo
from app.models.diferenciador import DiferenciadorFreelancer
from app.models.educacion import Educacion
from app.models.experiencia import Experiencia
from app.models.habilidad import HabilidadFreelancer
from app.models.herramienta import HerramientaFreelancer
from app.models.idioma import IdiomaFreelancer
from app.models.item_metodo_trabajo import ItemMetodoTrabajo
from app.models.perfil import Perfil
from app.models.perfil_freelancer import PerfilFreelancer
from app.schemas.freelancer_profile import FreelancerProfile
from app.services.supabase_client import supabase_auth
from app.services.utils import get_initials, is_recently_active, years_to_period, period_to_years


def get_freelancer_profile(db: Session, freelancer_id: str) -> FreelancerProfile | None:
    perfil = db.get(Perfil, freelancer_id)
    if not perfil or perfil.rol != "freelancer":
        return None

    perfil_freelancer = db.get(PerfilFreelancer, freelancer_id)

    diferenciadores = db.scalars(
        select(DiferenciadorFreelancer)
        .where(DiferenciadorFreelancer.freelancer_id == freelancer_id)
        .order_by(DiferenciadorFreelancer.posicion)
    ).all()
    habilidades = db.scalars(
        select(HabilidadFreelancer)
        .where(HabilidadFreelancer.freelancer_id == freelancer_id)
        .order_by(HabilidadFreelancer.posicion)
    ).all()
    herramientas = db.scalars(
        select(HerramientaFreelancer)
        .where(HerramientaFreelancer.freelancer_id == freelancer_id)
        .order_by(HerramientaFreelancer.posicion)
    ).all()
    idiomas = db.scalars(
        select(IdiomaFreelancer)
        .where(IdiomaFreelancer.freelancer_id == freelancer_id)
        .order_by(IdiomaFreelancer.posicion)
    ).all()
    categorias = db.scalars(
        select(CategoriaMetodoTrabajo)
        .where(CategoriaMetodoTrabajo.freelancer_id == freelancer_id)
        .order_by(CategoriaMetodoTrabajo.posicion)
    ).all()
    experiencia = db.scalars(
        select(Experiencia).where(Experiencia.freelancer_id == freelancer_id).order_by(Experiencia.anio_desde)
    ).all()
    educacion = db.scalars(
        select(Educacion).where(Educacion.freelancer_id == freelancer_id).order_by(Educacion.anio_desde)
    ).all()

    categoria_ids = [categoria.id for categoria in categorias]
    items: list[ItemMetodoTrabajo] = []
    if categoria_ids:
        items = list(
            db.scalars(
                select(ItemMetodoTrabajo)
                .where(ItemMetodoTrabajo.categoria_id.in_(categoria_ids))
                .order_by(ItemMetodoTrabajo.posicion)
            ).all()
        )

    try:
        auth_user = supabase_auth.auth.admin.get_user_by_id(str(freelancer_id))
        email = auth_user.user.email or "" if auth_user and auth_user.user else ""
    except Exception:
        email = ""

    return FreelancerProfile(
        id=str(perfil.id),
        name=perfil.nombre_completo,
        email=email,
        initials=get_initials(perfil.nombre_completo),
        rating=float(perfil_freelancer.calificacion) if perfil_freelancer else 0,
        reviewCount=perfil_freelancer.cantidad_resenas if perfil_freelancer else 0,
        specialty=(perfil_freelancer.especialidad if perfil_freelancer else "") or "",
        category=(perfil_freelancer.categoria if perfil_freelancer else "") or "",
        country=perfil.pais or "",
        countryCode=perfil.pais_codigo or "",
        timezone=perfil.zona_horaria or "",
        online=is_recently_active(perfil.last_active_at),
        languages=[{"name": idioma.nombre, "level": idioma.nivel} for idioma in idiomas],
        skills=[habilidad.nombre for habilidad in habilidades],
        # Badges y stats dependen de proyectos/reseñas reales que todavía no existen.
        badges={"successRate": 0, "topRated": False, "avgResponseTime": ""},
        stats={
            "completedProjects": 0,
            "hoursWorked": 0,
            "repeatClients": 0,
            "memberSince": "",
            "lastDelivery": "",
        },
        bio=(perfil_freelancer.biografia if perfil_freelancer else "") or "",
        differentiators=[d.contenido for d in diferenciadores],
        experience=[
            {
                "period": years_to_period(e.anio_desde, e.anio_hasta),
                "role": e.rol,
                "company": e.empresa,
                "description": e.descripcion,
            }
            for e in experiencia
        ],
        education=[
            {
                "period": years_to_period(e.anio_desde, e.anio_hasta),
                "degree": e.titulo,
                "institution": e.institucion,
            }
            for e in educacion
        ],
        tools=[herramienta.nombre for herramienta in herramientas],
        availabilityStatus=(perfil_freelancer.estado_disponibilidad if perfil_freelancer else "") or "",
        workMethods=[
            {
                "label": categoria.etiqueta,
                "items": [item.valor for item in items if item.categoria_id == categoria.id],
            }
            for categoria in categorias
        ],
    )


def save_freelancer_profile(db: Session, freelancer_id: str, profile: FreelancerProfile) -> dict[str, str]:
    perfil = db.get(Perfil, freelancer_id)
    if not perfil:
        return {"error": "No se encontró el perfil."}

    perfil.nombre_completo = profile.name
    perfil.pais = profile.country
    perfil.pais_codigo = profile.countryCode
    perfil.zona_horaria = profile.timezone

    perfil_freelancer = db.get(PerfilFreelancer, freelancer_id)
    if not perfil_freelancer:
        perfil_freelancer = PerfilFreelancer(perfil_id=freelancer_id, calificacion=0, cantidad_resenas=0)
        db.add(perfil_freelancer)
    perfil_freelancer.especialidad = profile.specialty
    perfil_freelancer.categoria = profile.category
    perfil_freelancer.biografia = profile.bio
    perfil_freelancer.estado_disponibilidad = profile.availabilityStatus

    db.query(DiferenciadorFreelancer).filter(
        DiferenciadorFreelancer.freelancer_id == freelancer_id
    ).delete()
    for index, contenido in enumerate(profile.differentiators):
        db.add(DiferenciadorFreelancer(freelancer_id=freelancer_id, contenido=contenido, posicion=index))

    db.query(HabilidadFreelancer).filter(HabilidadFreelancer.freelancer_id == freelancer_id).delete()
    for index, nombre in enumerate(profile.skills):
        db.add(HabilidadFreelancer(freelancer_id=freelancer_id, nombre=nombre, posicion=index))

    db.query(HerramientaFreelancer).filter(HerramientaFreelancer.freelancer_id == freelancer_id).delete()
    for index, nombre in enumerate(profile.tools):
        db.add(HerramientaFreelancer(freelancer_id=freelancer_id, nombre=nombre, posicion=index))

    db.query(IdiomaFreelancer).filter(IdiomaFreelancer.freelancer_id == freelancer_id).delete()
    for index, language in enumerate(profile.languages):
        db.add(
            IdiomaFreelancer(
                freelancer_id=freelancer_id, nombre=language.name, nivel=language.level, posicion=index
            )
        )

    db.query(Experiencia).filter(Experiencia.freelancer_id == freelancer_id).delete()
    for entry in profile.experience:
        year_from, year_to = period_to_years(entry.period)
        db.add(
            Experiencia(
                freelancer_id=freelancer_id,
                anio_desde=year_from,
                anio_hasta=year_to,
                rol=entry.role,
                empresa=entry.company,
                descripcion=entry.description,
            )
        )

    db.query(Educacion).filter(Educacion.freelancer_id == freelancer_id).delete()
    for entry in profile.education:
        year_from, year_to = period_to_years(entry.period)
        db.add(
            Educacion(
                freelancer_id=freelancer_id,
                anio_desde=year_from,
                anio_hasta=year_to if year_to is not None else year_from,
                titulo=entry.degree,
                institucion=entry.institution,
            )
        )

    # categorias_metodos_trabajo se borra en cascada junto con sus items.
    db.query(CategoriaMetodoTrabajo).filter(CategoriaMetodoTrabajo.freelancer_id == freelancer_id).delete()
    db.flush()
    for index, category in enumerate(profile.workMethods):
        categoria = CategoriaMetodoTrabajo(freelancer_id=freelancer_id, etiqueta=category.label, posicion=index)
        db.add(categoria)
        db.flush()
        for item_index, valor in enumerate(category.items):
            db.add(ItemMetodoTrabajo(categoria_id=categoria.id, valor=valor, posicion=item_index))

    db.commit()
    return {}
