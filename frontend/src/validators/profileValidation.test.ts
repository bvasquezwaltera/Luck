import { describe, expect, it } from "vitest";
import exampleProfile from "@/data/exampleFreelancerProfile.json";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { validateClientProfile, validateFreelancerProfile } from "@/validators/profileValidation";

const base: FreelancerProfile = {
  ...(exampleProfile as FreelancerProfile),
  name: "Ana Torres",
  specialty: "Full Stack developer",
  category: "Desarrollo Web",
  country: "Perú",
  countryCode: "PE",
  timezone: "GMT-5 (Lima)",
  bio: "Me gusta desarrollar código.",
  languages: [{ name: "Español", level: "Nativo" }],
  skills: ["Python"],
  tools: ["Git"],
  differentiators: ["Entrego a tiempo"],
  experience: [{ period: "2020 – Presente", role: "Dev", company: "Acme", description: "Backend" }],
  education: [{ period: "2015 – 2019", degree: "Ingeniería", institution: "UNI" }],
  workMethods: [{ label: "Comunicación", items: ["Slack"] }],
};

const errorsFor = (changes: Partial<FreelancerProfile>) => validateFreelancerProfile({ ...base, ...changes });

describe("validateFreelancerProfile", () => {
  it("accepts a complete valid profile", () => {
    expect(errorsFor({})).toEqual({});
  });

  it("ignores rows that are completely empty", () => {
    expect(
      errorsFor({
        languages: [{ name: "", level: "" }],
        experience: [{ period: "", role: "", company: "", description: "" }],
        education: [{ period: "", degree: "", institution: "" }],
        workMethods: [{ label: "", items: [] }],
        skills: ["", "  "],
      }),
    ).toEqual({});
  });

  it("applies the name rule", () => {
    expect(errorsFor({ name: "Ana123" }).name).toMatch(/números/);
    expect(errorsFor({ name: "Al" }).name).toMatch(/al menos 3/);
  });

  it("limits the length of specialty and bio", () => {
    expect(errorsFor({ specialty: "x".repeat(101) }).specialty).toMatch(/100/);
    expect(errorsFor({ bio: "x".repeat(1001) }).bio).toMatch(/1000/);
  });

  it("requires location and category to come from the lists", () => {
    expect(errorsFor({ countryCode: "XX" }).countryCode).toBeDefined();
    expect(errorsFor({ timezone: "GMT+99 (Marte)" }).timezone).toBeDefined();
    expect(errorsFor({ category: "Inventada" }).category).toBeDefined();
    expect(errorsFor({ category: "" }).category).toBeUndefined(); // aún sin elegir
  });

  it("limits the size of the simple lists, per list and per item", () => {
    expect(errorsFor({ skills: Array.from({ length: 31 }, (_, index) => `h${index}`) }).skills).toMatch(/30/);
    expect(errorsFor({ skills: ["ok", "x".repeat(51)] })["skills.1"]).toMatch(/50/);
    expect(errorsFor({ differentiators: Array(11).fill("d") }).differentiators).toMatch(/10/);
    expect(errorsFor({ tools: ["x".repeat(51)] })["tools.0"]).toBeDefined();
  });

  it("requires a language name and level once the row is started", () => {
    expect(errorsFor({ languages: [{ name: "Inglés", level: "" }] })["languages.0.level"]).toBeDefined();
    expect(errorsFor({ languages: [{ name: "", level: "Nativo" }] })["languages.0.name"]).toBeDefined();
  });

  it("validates experience rows", () => {
    const row = { period: "2020", role: "Dev", company: "Acme", description: "" };
    expect(errorsFor({ experience: [row] })).toEqual({});
    expect(errorsFor({ experience: [{ ...row, role: "" }] })["experience.0.role"]).toBeDefined();
    expect(errorsFor({ experience: [{ ...row, company: "" }] })["experience.0.company"]).toBeDefined();
    expect(errorsFor({ experience: [{ ...row, period: "" }] })["experience.0.period"]).toMatch(/inicio/);
    expect(errorsFor({ experience: [{ ...row, period: "2022 – 2020" }] })["experience.0.period"]).toMatch(/anterior/);
    expect(errorsFor({ experience: [{ ...row, description: "x".repeat(1001) }] })["experience.0.description"]).toBeDefined();
  });

  it("validates education rows (the end year is optional, 'Presente' is not allowed)", () => {
    const row = { period: "2015", degree: "Ing", institution: "UNI" };
    expect(errorsFor({ education: [row] })).toEqual({});
    expect(errorsFor({ education: [{ ...row, degree: "" }] })["education.0.degree"]).toBeDefined();
    expect(errorsFor({ education: [{ ...row, period: "2015 – Presente" }] })["education.0.period"]).toBeDefined();
  });

  it("validates work method categories", () => {
    expect(errorsFor({ workMethods: [{ label: "", items: ["Slack"] }] })["workMethods.0.label"]).toBeDefined();
    expect(errorsFor({ workMethods: [{ label: "x".repeat(51), items: [] }] })["workMethods.0.label"]).toBeDefined();
    expect(errorsFor({ workMethods: [{ label: "A", items: ["x".repeat(51)] }] })["workMethods.0.items.0"]).toBeDefined();
  });
});

describe("validateClientProfile", () => {
  it("checks name and location only", () => {
    expect(validateClientProfile(base)).toEqual({});
    expect(Object.keys(validateClientProfile({ name: "A1", countryCode: "", timezone: "" })).sort()).toEqual([
      "countryCode",
      "name",
      "timezone",
    ]);
  });
});
