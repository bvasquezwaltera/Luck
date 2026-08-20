from supabase import Client, create_client

from app.core.config import settings

# Cliente con la service role key: solo se usa para Supabase Auth (sign up,
# sign in, validar tokens). El acceso a datos va por SQLAlchemy, no por este
# cliente.
supabase_auth: Client = create_client(settings.supabase_url, settings.supabase_secret_key)
