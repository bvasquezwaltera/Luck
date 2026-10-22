import json
from pathlib import Path

import pytest

from app.schemas.client_profile import ClientProfileUpdate
from app.schemas.freelancer_profile import FreelancerProfile
from app.services import profile_validation as pv

BASE = {
    "id": "1",
    "name": "Ana Torres",
    "email": "ana@correo.com",
    "initials": "AT",
    "rating": 0,
    "reviewCount": 0,
    "specialty": "Full Stack developer",
    "category": "Desarrollo Web",
    "country": "Perú",
    "countryCode": "PE",
    "timezone": "GMT-5 (Lima)",
    "online": False,
    "languages": [{"name": "Español", "level": "Nativo"}],
    "skills": ["Python", "React"],
    "badges": {"successRate": 0, "topRated": False, "avgResponseTime": ""},
    "stats": {"completedProjects": 0, "hoursWorked": 0, "repeatClients": 0, "memberSince": "", "lastDelivery": ""},
    "bio": "Me gusta desarrollar código.",
    "differentiators": ["Entrego a tiempo"],
    "experience": [{"period": "2020 – Presente", "role": "Dev", "company": "Acme", "description": "Backend"}],
    "education": [{"period": "2015 – 2019", "degree": "Ingeniería", "institution": "UNI"}],
    "tools": ["Git"],
    "availabilityStatus": "Disponible",
    "workMethods": [{"label": "Comunicación", "items": ["Slack"]}],
}


def profile(**changes) -> FreelancerProfile:
    return FreelancerProfile(**{**BASE, **changes})


def message_for(**changes) -> str:
    with pytest.raises(pv.ProfileValidationError) as error:
        pv.clean_freelancer_profile(profile(**changes))
    return str(error.value)


def test_valid_profile_passes_unchanged():
    cleaned = pv.clean_freelancer_profile(profile())
    assert cleaned.name == "Ana Torres"
    assert cleaned.experience[0].period == "2020 – Presente"
    assert cleaned.education[0].period == "2015 – 2019"


def test_trims_and_drops_empty_rows():
    cleaned = pv.clean_freelancer_profile(
        profile(
            name="  Ana Torres  ",
            specialty="  Dev  ",
            skills=["  Python ", "", "   "],
            languages=[{"name": "", "level": ""}, {"name": " Inglés ", "level": "Avanzado"}],
            experience=[{"period": "", "role": "", "company": "", "description": ""}],
            education=[],
            workMethods=[{"label": "", "items": []}, {"label": "Diseño", "items": ["Figma", " "]}],
        )
    )
    assert cleaned.name == "Ana Torres" and cleaned.specialty == "Dev"
    assert cleaned.skills == ["Python"]
    assert [language.name for language in cleaned.languages] == ["Inglés"]
    assert cleaned.experience == []
    assert [(c.label, c.items) for c in cleaned.workMethods] == [("Diseño", ["Figma"])]


def test_experience_without_end_year_means_present():
    cleaned = pv.clean_freelancer_profile(
        profile(experience=[{"period": "2021", "role": "Dev", "company": "Acme", "description": ""}])
    )
    assert cleaned.experience[0].period == "2021 – Presente"


def test_country_is_fixed_by_code_and_must_be_in_the_list():
    cleaned = pv.clean_freelancer_profile(profile(country="Cualquier cosa", countryCode="CL"))
    assert (cleaned.countryCode, cleaned.country) == ("CL", "Chile")
    assert "País" in message_for(countryCode="XX")
    assert "País" in message_for(countryCode="")
    assert "Zona horaria" in message_for(timezone="GMT+99 (Marte)")
    assert "Categoría" in message_for(category="Inventada")
    assert pv.clean_freelancer_profile(profile(category="")).category == ""  # aún sin elegir


@pytest.mark.parametrize(
    "changes, expected",
    [
        ({"name": "Ana123"}, "números"),
        ({"name": "Al"}, "al menos 3"),
        ({"specialty": "x" * 101}, "Especialidad"),
        ({"bio": "x" * 2001}, "Sobre mí"),
        ({"skills": [f"h{i}" for i in range(31)]}, "hasta 30"),
        ({"skills": ["x" * 51]}, "supera"),
        ({"differentiators": ["d"] * 11}, "hasta 10"),
        ({"tools": ["x" * 51]}, "supera"),
        ({"languages": [{"name": "Inglés", "level": ""}]}, "elige el nivel"),
        ({"languages": [{"name": "", "level": "Nativo"}]}, "obligatorio"),
        ({"languages": [{"name": "Inglés", "level": "Experto"}]}, "elige el nivel"),
        ({"experience": [{"period": "2020", "role": "", "company": "Acme", "description": ""}]}, "rol"),
        ({"experience": [{"period": "2020", "role": "Dev", "company": "", "description": ""}]}, "empresa"),
        ({"experience": [{"period": "", "role": "Dev", "company": "Acme", "description": ""}]}, "año de inicio"),
        ({"experience": [{"period": "abcd", "role": "Dev", "company": "Acme", "description": ""}]}, "año"),
        ({"experience": [{"period": "2022 – 2020", "role": "Dev", "company": "Acme", "description": ""}]}, "anterior"),
        ({"experience": [{"period": "1800", "role": "Dev", "company": "Acme", "description": ""}]}, "entre 1950"),
        ({"experience": [{"period": "2020", "role": "x" * 101, "company": "Acme", "description": ""}]}, "100"),
        ({"experience": [{"period": "2020", "role": "Dev", "company": "A", "description": "x" * 1001}]}, "1000"),
        ({"education": [{"period": "2015", "degree": "", "institution": "UNI"}]}, "título"),
        ({"education": [{"period": "2015 – Presente", "degree": "Ing", "institution": "UNI"}]}, "fin no es válido"),
        ({"workMethods": [{"label": "", "items": ["Slack"]}]}, "nombre"),
        ({"workMethods": [{"label": "x" * 51, "items": []}]}, "50"),
        ({"workMethods": [{"label": f"c{i}", "items": []} for i in range(11)]}, "hasta 10"),
    ],
)
def test_rejects_invalid_profiles(changes, expected):
    assert expected in message_for(**changes)


def test_client_profile_rules():
    cleaned = pv.clean_client_update(ClientProfileUpdate(name="  Luis Pérez ", country="x", countryCode="PE", timezone="GMT-5 (Lima)"))
    assert (cleaned.name, cleaned.country) == ("Luis Pérez", "Perú")
    with pytest.raises(pv.ProfileValidationError, match="números"):
        pv.clean_client_update(ClientProfileUpdate(name="Luis2", country="Perú", countryCode="PE", timezone="GMT-5 (Lima)"))
    with pytest.raises(pv.ProfileValidationError, match="Zona horaria"):
        pv.clean_client_update(ClientProfileUpdate(name="Luis", country="Perú", countryCode="PE", timezone="otra"))


def test_data_copies_match_the_frontend():
    """El backend tiene copia de las listas del frontend; si alguien cambia una y no la otra, esta prueba avisa."""
    frontend = Path(__file__).resolve().parents[2] / "frontend" / "src" / "data"
    if not frontend.exists():  # p. ej. en un despliegue que solo trae el backend
        pytest.skip("no está la carpeta del frontend")
    backend = pv.DATA_DIR
    for name in ("categories.json", "countries.json", "timezones.json"):
        assert json.loads((frontend / name).read_text(encoding="utf-8")) == json.loads(
            (backend / name).read_text(encoding="utf-8")
        ), name
