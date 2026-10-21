from app.services.supabase_client import supabase_auth

# Bucket privado: los archivos solo se leen mediante enlaces temporales firmados.
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


def upload(path: str, content: bytes, content_type: str) -> None:
    supabase_auth.storage.from_(BUCKET).upload(path, content, {"content-type": content_type})


def create_signed_url(path: str, expires_in: int = SIGNED_URL_SECONDS) -> str:
    result = supabase_auth.storage.from_(BUCKET).create_signed_url(path, expires_in)
    return result["signedURL"]


def remove(paths: list[str]) -> None:
    """Borra archivos del bucket sin fallar: se usa al limpiar, y un archivo huérfano es menos grave que un error."""
    if not paths:
        return
    try:
        supabase_auth.storage.from_(BUCKET).remove(paths)
    except Exception:
        pass
