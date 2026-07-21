import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Deterministic PRNG so the generated data is stable across runs.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const firstNames = [
  "Diego", "Camila", "Lucas", "Mariana", "Felipe", "Valentina", "André",
  "Juliana", "Santiago", "Sofía", "Mateo", "Isabella", "Gabriel", "Renata",
  "Joaquín", "Antonella", "Emilio", "Fernanda", "Nicolás", "Daniela",
];
const lastInitials = ["B", "R", "M", "S", "A", "P", "L", "T", "C", "G", "D", "V"];

const categoryData = {
  "Desarrollo Web": {
    specialties: ["Full Stack Developer", "Backend Developer", "Frontend Developer"],
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
  },
  "Diseño UI/UX": {
    specialties: ["Diseñadora UI/UX", "Diseñador de Producto", "Diseñador Gráfico"],
    skills: ["Figma", "UI Design", "Prototyping", "Design Systems"],
  },
  "Marketing Digital": {
    specialties: ["Especialista en Marketing Digital", "Growth Marketer", "Social Media Manager"],
    skills: ["SEO", "Google Ads", "Analytics", "Email Marketing"],
  },
  "Desarrollo Mobile": {
    specialties: ["Desarrollador iOS", "Desarrollador Android", "Desarrollador Flutter"],
    skills: ["Swift", "Kotlin", "React Native", "Flutter"],
  },
  DevOps: {
    specialties: ["DevOps Engineer", "SRE"],
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
  },
  "Datos e IA": {
    specialties: ["Data Scientist", "ML Engineer", "Data Analyst"],
    skills: ["Python", "Machine Learning", "SQL", "Pandas"],
  },
  Redacción: {
    specialties: ["Redactora SEO", "Copywriter", "Editor de Contenido"],
    skills: ["SEO Writing", "Copywriting", "WordPress", "Content Strategy"],
  },
  "Community Management": {
    specialties: ["Community Manager", "Social Media Specialist"],
    skills: ["Social Media", "Content Calendar", "Community Engagement", "Canva"],
  },
};
const categories = Object.keys(categoryData);

const countries = [
  { name: "Brasil", code: "BR" },
  { name: "Argentina", code: "AR" },
  { name: "México", code: "MX" },
  { name: "España", code: "ES" },
  { name: "Colombia", code: "CO" },
  { name: "Chile", code: "CL" },
  { name: "Portugal", code: "PT" },
  { name: "Perú", code: "PE" },
  { name: "Uruguay", code: "UY" },
];

// Index-based cycling guarantees every price range is represented.
const priceRanges = [
  () => randInt(120, 199),
  () => randInt(200, 300),
  () => randInt(301, 400),
];

function makeFreelancer(i) {
  const firstName = firstNames[i % firstNames.length];
  const lastInitial = lastInitials[(i * 3) % lastInitials.length];
  const category = categories[i % categories.length];
  const { specialties, skills: skillPool } = categoryData[category];
  const specialty = pick(specialties);
  const country = countries[(i * 5) % countries.length];
  const skillCount = randInt(2, 3);
  const skills = [...skillPool].sort(() => rand() - 0.5).slice(0, skillCount);
  const monthlyPriceFrom = priceRanges[i % priceRanges.length]();

  return {
    id: `f-${i + 1}`,
    name: `${firstName} ${lastInitial}.`,
    initials: `${firstName[0]}${lastInitial}`,
    rating: Number((4.7 + rand() * 0.3).toFixed(1)),
    reviewCount: randInt(20, 70),
    specialty,
    category,
    country: country.name,
    countryCode: country.code,
    skills,
    projectCount: randInt(15, 70),
    monthlyPriceFrom,
  };
}

const freelancers = Array.from({ length: 55 }, (_, i) => makeFreelancer(i));

const outPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/freelancers.json",
);
writeFileSync(outPath, JSON.stringify(freelancers, null, 2) + "\n");
console.log(`Wrote ${freelancers.length} freelancers to ${outPath}`);
