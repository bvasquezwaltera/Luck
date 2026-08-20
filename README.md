# Luck

Plataforma freelancer por suscripción. Los freelancers publican planes de servicio
recurrente y los clientes se suscriben al plan de un freelancer específico.

## Estructura

Dos proyectos independientes, cada uno con su propio entorno y `.env`:

- **`frontend/`** — Next.js (App Router) + TypeScript + Tailwind. La UI y los paneles.
  Toda la data pasa por `frontend/src/lib/api/` llamando al backend.
- **`backend/`** — Python (FastAPI + SQLAlchemy + Alembic). Único lugar con la clave
  de servicio de Supabase y con acceso directo a la base de datos Postgres.

## Desarrollo

Se corren los dos proyectos en paralelo, cada uno en su propia terminal:

```bash
# backend — http://localhost:8000
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
# completa DATABASE_URL en backend/.env con la contraseña real de Postgres
alembic upgrade head          # crea las tablas que todavía faltan (resenas, proyectos_portafolio)
uvicorn app.main:app --reload --port 8000

# frontend — http://localhost:3000
cd frontend
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para ver la app.

## Documentación del proyecto

Los specs de diseño y planes de implementación de cada pieza están en
`docs/superpowers/`.
