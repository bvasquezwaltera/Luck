import re

# Las mismas reglas que el formulario del frontend (src/validators/validators.ts): el frontend avisa mientras se
# escribe, y esto es lo que no se puede saltar llamando a la API directamente.
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
SPECIAL_CHAR_REGEX = re.compile(r"""[!@#$%^&*(),.?":{}|<>_\-+=\[\]/\\;'`~]""")

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 72  # límite de bcrypt, el algoritmo con el que se guardan las contraseñas
EMAIL_MAX_LENGTH = 254
NAME_MAX_LENGTH = 120


def validate_password(password: str) -> str | None:
    """Devuelve el mensaje de error, o None si la contraseña es válida."""
    if not password:
        return "La contraseña es obligatoria."
    if len(password) < PASSWORD_MIN_LENGTH:
        return f"La contraseña debe tener al menos {PASSWORD_MIN_LENGTH} caracteres."
    if len(password) > PASSWORD_MAX_LENGTH:
        return f"La contraseña no puede superar los {PASSWORD_MAX_LENGTH} caracteres."
    if not re.search(r"[A-Z]", password):
        return "La contraseña debe incluir al menos una letra mayúscula."
    if not re.search(r"[0-9]", password):
        return "La contraseña debe incluir al menos un número."
    if not SPECIAL_CHAR_REGEX.search(password):
        return "La contraseña debe incluir al menos un carácter especial."
    return None


def validate_email(email: str) -> str | None:
    email = email.strip()
    if not email:
        return "El correo electrónico es obligatorio."
    if len(email) > EMAIL_MAX_LENGTH or not EMAIL_REGEX.match(email):
        return "Ingresa un correo electrónico válido."
    return None


def validate_full_name(name: str) -> str | None:
    name = name.strip()
    if not name:
        return "El nombre completo es obligatorio."
    if len(name) > NAME_MAX_LENGTH:
        return f"El nombre no puede superar los {NAME_MAX_LENGTH} caracteres."
    return None
