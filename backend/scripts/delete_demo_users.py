"""Borra TODAS las cuentas de demostración (correos `demo.…@example.com`) con todo lo que tienen.

Uso (desde la carpeta backend, con el entorno virtual activado):
    python -m scripts.delete_demo_users          # solo muestra cuántas hay
    python -m scripts.delete_demo_users --yes    # las borra
"""
import argparse

from sqlalchemy.orm import Session

from app.core.database import engine
from app.services import auth_service
from app.services.supabase_client import supabase_auth

DOMAIN = "@example.com"
PREFIX = "demo."


def demo_users():
    found = []
    page = 1
    while True:
        users = supabase_auth.auth.admin.list_users(page=page, per_page=200)
        if not users:
            break
        found.extend(u for u in users if (u.email or "").lower().startswith(PREFIX) and (u.email or "").lower().endswith(DOMAIN))
        if len(users) < 200:
            break
        page += 1
    return found


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--yes", action="store_true", help="borrar de verdad")
    args = parser.parse_args()

    users = demo_users()
    print(f"Cuentas de demostración encontradas: {len(users)}")
    if not args.yes:
        print("No se borró nada. Para borrarlas: python -m scripts.delete_demo_users --yes")
        return

    with Session(engine) as db:
        for index, user in enumerate(users, start=1):
            result = auth_service.delete_account(db, str(user.id))
            print(f"  {index:>3}/{len(users)} {user.email}: {'ok' if not result.error else result.error}")


if __name__ == "__main__":
    main()
