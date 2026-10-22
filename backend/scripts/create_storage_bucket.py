"""Crea (una sola vez) los buckets privados de Supabase Storage: adjuntos de solicitudes y de entregas.

Uso, desde la carpeta backend y con el entorno virtual activado:
    python -m scripts.create_storage_bucket

Es seguro repetirlo: si un bucket ya existe, no hace nada con él.
"""
from app.services import storage_service as storage
from app.services.supabase_client import supabase_auth

BUCKETS = [
    (storage.BUCKET, storage.MAX_FILE_BYTES, storage.ALLOWED_MIME_TYPES),
    (storage.DELIVERY_BUCKET, storage.DELIVERY_MAX_FILE_BYTES, storage.DELIVERY_ALLOWED_MIME_TYPES),
]


def main() -> None:
    existing = {bucket.name for bucket in supabase_auth.storage.list_buckets()}
    for name, max_bytes, mime_types in BUCKETS:
        if name in existing:
            print(f"El bucket «{name}» ya existe. No se hizo ningún cambio.")
            continue
        supabase_auth.storage.create_bucket(
            name,
            options={"public": False, "file_size_limit": max_bytes, "allowed_mime_types": mime_types},
        )
        print(f"Bucket privado «{name}» creado (máx. {max_bytes // (1024 * 1024)} MB por archivo).")


if __name__ == "__main__":
    main()
