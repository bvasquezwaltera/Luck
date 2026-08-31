from supabase import Client, create_client

from app.core.config import settings

# Cliente con la service role key, compartido entre requests: se usa SOLO
# para llamadas admin.* (get_user_by_id, update_user_by_id, delete_user) y
# auth.get_user(token) con un token explícito — ninguna de esas muta la
# sesión interna del cliente, así que es seguro reutilizarlo.
#
# NUNCA llames aquí a sign_up / sign_in_with_password: esos métodos
# sobrescriben la sesión guardada del cliente (incluida su cabecera de
# autorización), lo que contamina cualquier llamada admin de OTRO request
# que se ejecute mientras tanto. Para eso usa create_auth_client().
supabase_auth: Client = create_client(settings.supabase_url, settings.supabase_secret_key)


def create_auth_client() -> Client:
    """Cliente nuevo (con la clave pública) para operaciones que autentican a
    un usuario normal: sign up, sign in, verificar la contraseña actual.
    Crear uno por operación — nunca compartirlo entre requests."""
    return create_client(settings.supabase_url, settings.supabase_publishable_key)
