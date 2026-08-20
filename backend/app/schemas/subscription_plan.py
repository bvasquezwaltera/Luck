from pydantic import BaseModel


class SubscriptionPlanFeature(BaseModel):
    id: str
    label: str
    value: str


class SubscriptionPlan(BaseModel):
    id: str
    name: str
    tier: str
    description: str
    price: float
    activeProjects: str
    revisions: str
    features: list[SubscriptionPlanFeature]
    active: bool
