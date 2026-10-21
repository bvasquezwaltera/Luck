from app.services.supabase_client import supabase_auth

# Buckets privados: los archivos solo se leen mediante enlaces temporales firmados.
BUCKET = "solicitud-adjuntos"
MAX_FILE_BYTES = 5 * 1024 * 1024
MAX_FILES = 5
SIGNED_URL_SECONDS = 60

# extensión -> (tipo MIME, firma inicial del archivo)
ALLOWED_TYPES: dict[str, tuple[str, tuple[bytes, ...]]] = {
    ".pdf": ("application/pdf", (b"%PDF",)),
    ".png": ("image/png", (b"\x89PNG\r\n\x1a\n",)),
    ".jpg": ("image/jpeg", (b"\xff\xd8\xff",)),
    ".jpeg": ("image/jpeg", (b"\xff\xd8\xff",)),
    ".webp": ("image/webp", (b"RIFF",)),
}
ALLOWED_MIME_TYPES = sorted({mime for mime, _ in ALLOWED_TYPES.values()})

# Entregas del freelancer y devoluciones del cliente: archivos de trabajo, más grandes y de más formatos.
# No se permiten ejecutables, HTML ni SVG (podrían llevar código).
DELIVERY_BUCKET = "entrega-adjuntos"
DELIVERY_MAX_FILE_BYTES = 25 * 1024 * 1024
DELIVERY_MAX_TOTAL_BYTES = 50 * 1024 * 1024
DELIVERY_MAX_FILES = 5
DELIVERY_MAX_LINKS = 5

_ZIP = (b"PK\x03\x04",)
# Los formatos de texto no tienen firma: se comprueba aparte que sean texto legible (ver deliveries_service).
DELIVERY_TEXT_EXTENSIONS = {".txt", ".csv", ".md"}
DELIVERY_ALLOWED_TYPES: dict[str, tuple[str, tuple[bytes, ...]]] = {
    **ALLOWED_TYPES,
    ".gif": ("image/gif", (b"GIF87a", b"GIF89a")),
    ".zip": ("application/zip", _ZIP),
    ".docx": ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", _ZIP),
    ".xlsx": ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", _ZIP),
    ".pptx": ("application/vnd.openxmlformats-officedocument.presentationml.presentation", _ZIP),
    ".txt": ("text/plain", ()),
    ".csv": ("text/csv", ()),
    ".md": ("text/markdown", ()),
}
DELIVERY_ALLOWED_MIME_TYPES = sorted({mime for mime, _ in DELIVERY_ALLOWED_TYPES.values()})


def upload(path: str, content: bytes, content_type: str, bucket: str = BUCKET) -> None:
    supabase_auth.storage.from_(bucket).upload(path, content, {"content-type": content_type})


def create_signed_url(path: str, expires_in: int = SIGNED_URL_SECONDS, bucket: str = BUCKET) -> str:
    result = supabase_auth.storage.from_(bucket).create_signed_url(path, expires_in)
    return result["signedURL"]


def remove(paths: list[str], bucket: str = BUCKET) -> None:
    """Borra archivos del bucket sin fallar: se usa al limpiar, y un archivo huérfano es menos grave que un error."""
    if not paths:
        return
    try:
        supabase_auth.storage.from_(bucket).remove(paths)
    except Exception:
        pass
