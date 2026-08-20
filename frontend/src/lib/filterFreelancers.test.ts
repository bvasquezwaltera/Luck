import { describe, expect, it } from "vitest";
import { filterFreelancers, defaultFilters } from "@/lib/filterFreelancers";
import type { Freelancer } from "@/types/freelancer";

const freelancers: Freelancer[] = [
  {
    id: "1", name: "Diego B.", initials: "DB", rating: 5.0, reviewCount: 54,
    specialty: "Full Stack Developer", category: "Desarrollo Web", country: "Brasil",
    countryCode: "BR", skills: ["JavaScript", "TypeScript", "React"],
    projectCount: 54, monthlyPriceFrom: 300,
  },
  {
    id: "2", name: "Camila R.", initials: "CR", rating: 5.0, reviewCount: 38,
    specialty: "Diseñadora UI/UX", category: "Diseño UI/UX", country: "Argentina",
    countryCode: "AR", skills: ["Figma", "UI Design", "Prototyping"],
    projectCount: 38, monthlyPriceFrom: 250,
  },
  {
    id: "3", name: "Juliana T.", initials: "JT", rating: 5.0, reviewCount: 33,
    specialty: "Redactora SEO", category: "Redacción", country: "Brasil",
    countryCode: "BR", skills: ["SEO Writing", "Copywriting", "WordPress"],
    projectCount: 33, monthlyPriceFrom: 180,
  },
];

describe("filterFreelancers", () => {
  it("returns all freelancers when filters are default", () => {
    expect(filterFreelancers(freelancers, defaultFilters)).toHaveLength(3);
  });

  it("filters by text query against name", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, query: "diego" });
    expect(result.map((f) => f.id)).toEqual(["1"]);
  });

  it("filters by text query against specialty", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, query: "ux" });
    expect(result.map((f) => f.id)).toEqual(["2"]);
  });

  it("filters by text query against skills", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, query: "figma" });
    expect(result.map((f) => f.id)).toEqual(["2"]);
  });

  it("filters by category", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, category: "Diseño UI/UX" });
    expect(result.map((f) => f.id)).toEqual(["2"]);
  });

  it("filters by country", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, country: "Brasil" });
    expect(result.map((f) => f.id)).toEqual(["1", "3"]);
  });

  it("filters by price range under200", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, priceRange: "under200" });
    expect(result.map((f) => f.id)).toEqual(["3"]);
  });

  it("filters by price range 200to300", () => {
    const result = filterFreelancers(freelancers, { ...defaultFilters, priceRange: "200to300" });
    expect(result.map((f) => f.id)).toEqual(["1", "2"]);
  });

  it("combines multiple filters with AND", () => {
    const result = filterFreelancers(freelancers, {
      ...defaultFilters,
      country: "Brasil",
      priceRange: "under200",
    });
    expect(result.map((f) => f.id)).toEqual(["3"]);
  });
});
