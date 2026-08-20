from datetime import datetime, timezone

PRESENT = "Presente"
ONLINE_THRESHOLD_SECONDS = 5 * 60


def get_initials(name: str) -> str:
    words = [word for word in name.strip().split() if word]
    return "".join(word[0].upper() for word in words[:2])


def is_recently_active(last_active_at: datetime | None) -> bool:
    if last_active_at is None:
        return False
    now = datetime.now(timezone.utc)
    return (now - last_active_at).total_seconds() < ONLINE_THRESHOLD_SECONDS


def years_to_period(year_from: int, year_to: int | None) -> str:
    to_label = PRESENT if year_to is None else str(year_to)
    return f"{year_from} – {to_label}"


def period_to_years(period: str) -> tuple[int, int | None]:
    parts = [part.strip() for part in period.split("–")]
    year_from = int(parts[0]) if parts and parts[0].isdigit() else 0
    year_to_raw = parts[1] if len(parts) > 1 else ""
    year_to = None if not year_to_raw or year_to_raw == PRESENT else int(year_to_raw)
    return year_from, year_to


def to_relative_date(date_value: datetime) -> str:
    now = datetime.now(timezone.utc)
    days = (now - date_value).days
    if days <= 0:
        return "Hoy"
    if days == 1:
        return "Hace 1 día"
    if days < 30:
        return f"Hace {days} días"
    months = days // 30
    if months == 1:
        return "Hace 1 mes"
    if months < 12:
        return f"Hace {months} meses"
    years = months // 12
    return "Hace 1 año" if years == 1 else f"Hace {years} años"
