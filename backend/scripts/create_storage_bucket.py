"""Crea (una sola vez) el bucket privado de Supabase Storage para los adjuntos de solicitudes.

Uso, desde la carpeta backend y con el entorno virtual activado:
    python -m scripts.create_storage_bucket

Es seguro repetirlo: si el bucket ya existe, no hace nada.
"""
from app.services.storage_service import ALLOWED_MIME_TYPES, BUCKET, MAX_FILE_BYTES
from app.services.supabase_client import supabase_auth


def main() -> None:
    existing = {bucket.name for bucket in supabase_auth.storage.list_buckets()}
    if BUCKET in existing:
        print(f"El bucket «{BUCKET}» ya existe. No se hizo ningún cambio.")
        return

    supabase_auth.storage.create_bucket(
        BUCKET,
        options={
            "public": False,
            "file_size_limit": MAX_FILE_BYTES,
            "allowed_mime_types": ALLOWED_MIME_TYPES,
        },
    )
    print(f"Bucket privado «{BUCKET}» creado (máx. {MAX_FILE_BYTES // (1024 * 1024)} MB por archivo).")


if __name__ == "__main__":
    main()
