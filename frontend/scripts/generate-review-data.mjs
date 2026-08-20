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
const rand = mulberry32(7);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const reviewers = [
  { name: "María Fernanda", country: "Brasil", code: "BR" },
  { name: "Carlos Méndez", country: "México", code: "MX" },
  { name: "Ana Lucía", country: "Colombia", code: "CO" },
  { name: "Javier Torres", country: "Argentina", code: "AR" },
  { name: "Sofía Ramírez", country: "Chile", code: "CL" },
  { name: "Pedro Almeida", country: "Portugal", code: "PT" },
  { name: "Valentina Cruz", country: "Perú", code: "PE" },
  { name: "Lucas Fernandes", country: "Brasil", code: "BR" },
  { name: "Camila Rojas", country: "Uruguay", code: "UY" },
  { name: "Diego Herrera", country: "España", code: "ES" },
];

const services = ["Desarrollo Web", "Aplicación Móvil", "API REST", "E-commerce", "Dashboard"];

const titlesByService = {
  "Desarrollo Web": ["Desarrollo de plataforma web", "Rediseño de sitio corporativo", "Landing page de alto impacto"],
  "Aplicación Móvil": ["Aplicación móvil con React Native", "App de finanzas personales", "Rediseño de app móvil"],
  "API REST": ["API REST y panel administrativo", "Integración de API de pagos", "API para app móvil"],
  "E-commerce": ["Tienda online completa", "Migración de e-commerce", "Checkout y pagos integrados"],
  Dashboard: ["Dashboard de analítica", "Panel de reportes en tiempo real", "Dashboard administrativo"],
};

const comments = [
  "Diego superó mis expectativas. Entregó el proyecto antes del plazo, con un código limpio y escalable. Comunicación excelente durante todo el proceso.",
  "Trabajar con Diego fue una gran experiencia. Entendió perfectamente los requerimientos y propuso mejoras que agregaron mucho valor al producto final.",
  "Muy profesional, atento a los detalles y siempre disponible para resolver dudas. Altamente recomendado.",
  "Excelente comunicación de principio a fin. El resultado final superó lo que teníamos en mente.",
  "Cumplió con todos los plazos acordados y el código quedó muy bien documentado. Sin dudas volvería a contratarlo.",
  "Gran capacidad para resolver problemas complejos. Siempre propuso la mejor solución técnica para cada caso.",
];

const tagPool = ["Calidad del trabajo", "Comunicación", "Cumplimiento de plazos", "Recomendado"];

const RELATIVE_LABELS = [
  "Hace 3 días",
  "Hace 1 semana",
  "Hace 2 semanas",
  "Hace 3 semanas",
  "Hace 1 mes",
  "Hace 2 meses",
  "Hace 3 meses",
  "Hace 4 meses",
  "Hace 6 meses",
];

function initialsFor(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function makeReview(i) {
  const reviewer = pick(reviewers);
  const service = services[i % services.length];
  const title = pick(titlesByService[service]);
  const comment = pick(comments);
  const tagCount = randInt(3, 4);
  const tags = [...tagPool].sort(() => rand() - 0.5).slice(0, tagCount);
  // Distribution weighted heavily toward 5 stars to match a 5.0 average with
  // a small number of 4-star reviews, matching the profile's reported rating.
  const rating = i % 27 === 0 ? 4 : 5;
  const year = 2024 - Math.floor(i / 18);
  const month = 12 - (i % 12);
  const dateValue = `${year}-${String(month).padStart(2, "0")}`;

  return {
    id: `r-${i + 1}`,
    reviewerName: reviewer.name,
    reviewerInitials: initialsFor(reviewer.name),
    countryCode: reviewer.code,
    country: reviewer.country,
    rating,
    title,
    comment,
    tags,
    service,
    dateValue,
    relativeDate: RELATIVE_LABELS[i % RELATIVE_LABELS.length],
  };
}

const reviews = Array.from({ length: 54 }, (_, i) => makeReview(i));

const outPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/reviews.json",
);
writeFileSync(outPath, JSON.stringify(reviews, null, 2) + "\n");
console.log(`Wrote ${reviews.length} reviews to ${outPath}`);
