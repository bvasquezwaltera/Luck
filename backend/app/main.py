from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, client_profile, deliveries, freelancers, payments, portfolio_projects, profile, reviews, solicitudes, subscription_plans

app = FastAPI(title="Luck API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(client_profile.router)
app.include_router(solicitudes.router)
app.include_router(payments.router)
app.include_router(deliveries.router)
app.include_router(reviews.router)
app.include_router(subscription_plans.router)
app.include_router(portfolio_projects.router)
app.include_router(freelancers.router)


@app.get("/")
def health():
    return {"status": "ok"}
