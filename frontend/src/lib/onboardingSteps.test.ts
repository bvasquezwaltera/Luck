import { describe, expect, it } from "vitest";
import { freelancerSteps } from "@/lib/onboardingSteps";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";

const complete = {
  specialty: "Full Stack developer",
  category: "Desarrollo Web",
  bio: "Me gusta desarrollar código limpio.",
  skills: ["Python", "React", "SQL"],
};

const plan = (overrides: Partial<SubscriptionPlan> = {}): SubscriptionPlan => ({
  id: "1",
  name: "Básico",
  tier: "basico",
  description: "",
  price: 100,
  activeProjects: "1",
  revisions: "2",
  features: [],
  active: true,
  ...overrides,
});

const done = (steps: ReturnType<typeof freelancerSteps>) => steps.map((step) => step.done);

describe("freelancerSteps", () => {
  it("starts with nothing done for a brand new profile", () => {
    const steps = freelancerSteps({ specialty: "", category: "", bio: "", skills: [] }, []);
    expect(done(steps)).toEqual([false, false, false]);
    expect(steps.map((step) => step.tab)).toEqual(["perfil", "perfil", "suscripcion"]);
  });

  it("marks every step once the profile and a priced active plan are saved", () => {
    expect(done(freelancerSteps(complete, [plan()]))).toEqual([true, true, true]);
  });

  it("needs specialty, category AND a real bio for the first step", () => {
    expect(done(freelancerSteps({ ...complete, specialty: " " }, [plan()]))[0]).toBe(false);
    expect(done(freelancerSteps({ ...complete, category: "" }, [plan()]))[0]).toBe(false);
    expect(done(freelancerSteps({ ...complete, bio: "Hola" }, [plan()]))[0]).toBe(false);
  });

  it("needs at least 3 non-empty skills", () => {
    expect(done(freelancerSteps({ ...complete, skills: ["Python", "React"] }, [plan()]))[1]).toBe(false);
    expect(done(freelancerSteps({ ...complete, skills: ["Python", "React", "  ", ""] }, [plan()]))[1]).toBe(false);
  });

  it("the plan must be active and have a price", () => {
    expect(done(freelancerSteps(complete, [plan({ active: false })]))[2]).toBe(false);
    expect(done(freelancerSteps(complete, [plan({ price: 0 })]))[2]).toBe(false);
    expect(done(freelancerSteps(complete, [plan({ active: false }), plan({ tier: "premium" })]))[2]).toBe(true);
  });

  it("treats plans that are still loading as not done", () => {
    expect(done(freelancerSteps(complete, null))[2]).toBe(false);
  });
});
