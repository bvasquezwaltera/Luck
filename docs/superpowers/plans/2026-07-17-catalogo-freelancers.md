# Catálogo de Freelancers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public freelancer catalog page for Luck — a searchable/filterable
grid of freelancer cards, backed by static test data, per the approved design.

**Architecture:** Next.js (App Router) + TypeScript app scaffolded directly in
`c:\Luck`. Static JSON test data in `src/data/freelancers.json`. All search/filter
logic lives in a pure, unit-tested function (`src/lib/filterFreelancers.ts`).
Presentation is split in two layers: `src/ui/` holds generic, domain-agnostic
primitives (Button, Card, Avatar, Badge, Input, Select); `src/modules/inicio/` holds
domain-specific components for the catalog page (Header, FreelancerCard,
FreelancerGrid, SearchBar) that compose those primitives. `src/app/` is routing only.
No backend, no Supabase usage yet.

**Tech Stack:** Next.js (latest, App Router), TypeScript, Tailwind CSS, ESLint,
Vitest for unit tests, `lucide-react` for icons, `country-flag-icons` for SVG flag
icons (emoji flags don't render on Windows — they fall back to two-letter text).
Font: Inter (via `next/font/google`, wired in `src/app/layout.tsx` as
`--font-inter`, mapped to Tailwind's `--font-sans`).
Platform-wide background color: `#EEF2FF` (Tailwind `indigo-50`), set once via the
`--background` CSS variable in `src/app/globals.css` and applied to `<body>` — this
is the default background for every page. `Header` overrides it locally with an
explicit `bg-white` since the navbar must stay white on every page.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-17-catalogo-freelancers-design.md`
- Project root is `c:\Luck` itself — do not create a nested `luck/` folder.
- No git repository exists yet and the user declined `git init` for now — skip all
  "commit" steps. Use the "verify" step of each task as the review checkpoint
  instead.
- Folder convention (decided during implementation, supersedes anything the spec says
  about a flat `components/` folder):
  - `src/ui/` — generic, reusable, domain-agnostic primitives. Must not import
    anything from `src/modules/` or know about "freelancer"/"suscripción" concepts.
  - `src/modules/<modulo>/` — components specific to one section of the platform
    (e.g. `inicio` for the catalog page). These compose `src/ui/` primitives.
  - `src/app/` — routing only (`page.tsx`, `layout.tsx` per route). Pages import from
    `src/modules/`, never the other way around.
  - `src/hooks/`, `src/utils/`, `src/styles/` exist as empty placeholders for future
    work; do not populate them in this plan unless a task explicitly says to.
- Out of scope: freelancer profile page content, real auth, Supabase/persistent data,
  subscriptions/payments. Do not build these. (The route folders `app/login/`,
  `app/registro/`, `app/perfil/[id]/` already exist as empty placeholders — this plan
  does not add `page.tsx` files to them.)
- All UI copy is in Spanish, matching the mockup (e.g. "Buscar freelancers...",
  "Todas las categorías", "N freelancers encontrados", "Ver perfil").

---

### Task 1: Scaffold Next.js Project — COMPLETE

Already done: `create-next-app` scaffolded in `c:\Luck`, dev server verified,
starter content removed from `src/app/page.tsx`. No further action.

---

### Task 2: Freelancer and Filter Types — COMPLETE

**Files:**
- Create: `src/types/freelancer.ts`

**Interfaces:**
- Produces: `Freelancer` interface and `FreelancerFilters`/`PriceRange` types, used by
  every later task (data generation, filter logic, components).

- [ ] **Step 1: Write the type definitions**

```ts
// src/types/freelancer.ts
export interface Freelancer {
  id: string;
  name: string;
  initials: string;
  rating: number;
  reviewCount: number;
  specialty: string;
  category: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "BR" — used to render the flag icon
  skills: string[];
  projectCount: number;
  monthlyPriceFrom: number;
}

export type PriceRange = "any" | "under200" | "200to300" | "over300";

export interface FreelancerFilters {
  query: string;
  category: string; // "all" or an exact Freelancer["category"] value
  country: string; // "all" or an exact Freelancer["country"] value
  priceRange: PriceRange;
}
```

- [ ] **Step 2: Verify it compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors referencing `freelancer.ts`.

---

### Task 3: Seed Data Generation Script — COMPLETE

**Files:**
- Create: `scripts/generate-freelancer-data.mjs`
- Create (generated output): `src/data/freelancers.json`

**Interfaces:**
- Consumes: `Freelancer` shape from Task 2 (mirrored as plain JS object shape in the
  script — the script is plain Node, not TypeScript).
- Produces: `src/data/freelancers.json`, an array of 55 `Freelancer` objects, with
  `category` values drawn from `["Desarrollo Web", "Diseño UI/UX", "Marketing
  Digital", "Desarrollo Mobile", "DevOps", "Datos e IA", "Redacción", "Community
  Management"]`, `country` values drawn from 9 countries, and `monthlyPriceFrom`
  distributed across all three price-filter ranges (<200, 200-300, >300).

- [ ] **Step 1: Write the generation script**

```js
// scripts/generate-freelancer-data.mjs
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
```

- [ ] **Step 2: Run the script**

Run:

```bash
node scripts/generate-freelancer-data.mjs
```

Expected output: `Wrote 55 freelancers to .../src/data/freelancers.json`

- [ ] **Step 3: Verify the output**

Run:

```bash
node -e "const d=require('./src/data/freelancers.json'); console.log(d.length, new Set(d.map(f=>f.category)).size, new Set(d.map(f=>f.country)).size)"
```

Expected: `55 8 9` (55 records, all 8 categories, all 9 countries represented).

---

### Task 4: Filter Logic (TDD) — COMPLETE

**Files:**
- Create: `src/lib/filterFreelancers.ts`
- Test: `src/lib/filterFreelancers.test.ts`
- Modify: `package.json` (add `vitest` dependency and `test` script)
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: `Freelancer`, `FreelancerFilters`, `PriceRange` from
  `@/types/freelancer` (Task 2).
- Produces: `filterFreelancers(freelancers: Freelancer[], filters: FreelancerFilters): Freelancer[]`
  and `defaultFilters: FreelancerFilters`, both consumed by the catalog page (Task 10).

- [ ] **Step 1: Install vitest**

Run:

```bash
npm install -D vitest
```

- [ ] **Step 2: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Add vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Write the failing tests**

```ts
// src/lib/filterFreelancers.test.ts
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
```

- [ ] **Step 5: Run tests to verify they fail**

Run:

```bash
npx vitest run src/lib/filterFreelancers.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/filterFreelancers'` (module doesn't
exist yet).

- [ ] **Step 6: Implement filterFreelancers**

```ts
// src/lib/filterFreelancers.ts
import type { Freelancer, FreelancerFilters } from "@/types/freelancer";

export const defaultFilters: FreelancerFilters = {
  query: "",
  category: "all",
  country: "all",
  priceRange: "any",
};

function matchesPriceRange(price: number, range: FreelancerFilters["priceRange"]): boolean {
  switch (range) {
    case "under200":
      return price < 200;
    case "200to300":
      return price >= 200 && price <= 300;
    case "over300":
      return price > 300;
    case "any":
    default:
      return true;
  }
}

export function filterFreelancers(
  freelancers: Freelancer[],
  filters: FreelancerFilters,
): Freelancer[] {
  const query = filters.query.trim().toLowerCase();

  return freelancers.filter((freelancer) => {
    const matchesQuery =
      query === "" ||
      freelancer.name.toLowerCase().includes(query) ||
      freelancer.specialty.toLowerCase().includes(query) ||
      freelancer.skills.some((skill) => skill.toLowerCase().includes(query));

    const matchesCategory =
      filters.category === "all" || freelancer.category === filters.category;

    const matchesCountry =
      filters.country === "all" || freelancer.country === filters.country;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesCountry &&
      matchesPriceRange(freelancer.monthlyPriceFrom, filters.priceRange)
    );
  });
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run:

```bash
npx vitest run src/lib/filterFreelancers.test.ts
```

Expected: all 9 tests PASS.

---

### Task 5: UI Primitives (Button, Card, Avatar, Badge, Search, Select) — COMPLETE

Already built (visual iteration, ahead of the original task order): `src/ui/Button.tsx`
(with `outline-neutral` variant, `min-w-[110px]`, `text-xs`), `src/ui/Search.tsx`
(text input with a magnifying-glass icon, `text-xs`), `src/ui/Select.tsx`
(`text-xs`). `Card.tsx`, `Avatar.tsx`, `Badge.tsx` are not built yet — needed by
Task 6.

**Files:**
- Create: `src/ui/Card.tsx`
- Create: `src/ui/Avatar.tsx`
- Create: `src/ui/Badge.tsx`

**Interfaces:**
- Produces (consumed by Task 6-9's `modules/inicio/` components):
  - `Button({ variant?: "primary" | "outline" | "outline-neutral" | "ghost", ...ButtonHTMLAttributes })` — already exists.
  - `Card({ ...HTMLAttributes<HTMLDivElement> })`
  - `Avatar({ initials: string; name: string })`
  - `Badge({ children: ReactNode })`
  - `Search({ ...InputHTMLAttributes<HTMLInputElement> })` — already exists. Uses
    `lucide-react`'s `Search` icon (aliased `SearchIcon` on import to avoid a name
    clash with the component itself) positioned inside the input via `relative`/
    `absolute`.
  - `Select({ ...SelectHTMLAttributes<HTMLSelectElement> })` — already exists. Wraps
    the native `<select>` (with `appearance-none` to hide the browser's default
    arrow) in a `relative` div with a `lucide-react` `ChevronDown` icon positioned
    on top, so the dropdown arrow is consistent across browsers. `className` passed
    to `Select` sizes the wrapper div, not the `<select>` directly.
- These primitives must not import anything from `@/modules` or `@/types` — they know
  nothing about "freelancer" domain concepts.

- [ ] **Step 1: Write Card**

```tsx
// src/ui/Card.tsx
import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 ${className}`} {...props} />
  );
}
```

- [ ] **Step 3: Write Avatar**

```tsx
// src/ui/Avatar.tsx
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
];

function colorFor(seed: string): string {
  const index = seed.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function Avatar({ initials, name }: { initials: string; name: string }) {
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${colorFor(name)}`}
    >
      {initials}
    </div>
  );
}
```

- [ ] **Step 4: Write Badge**

```tsx
// src/ui/Badge.tsx
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Verify it compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors referencing any file under `src/ui/`.

---

### Task 6: FreelancerCard Component — COMPLETE

**Files:**
- Create: `src/modules/inicio/FreelancerCard.tsx`

**Interfaces:**
- Consumes: `Freelancer` type from `@/types/freelancer` (Task 2); `Card`, `Avatar`,
  `Badge`, `Button` from `@/ui/*` (Task 5); `Star`, `Briefcase` icons from
  `lucide-react`; flag components from `country-flag-icons/react/3x2` (keyed by
  `freelancer.countryCode`, e.g. `Flags.BR`).
- Produces: `FreelancerCard` React component, `{ freelancer: Freelancer }` props,
  consumed by `FreelancerGrid` (Task 7).

- [ ] **Step 1: Write the component**

```tsx
// src/modules/inicio/FreelancerCard.tsx
import { Star, Briefcase } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import type { Freelancer } from "@/types/freelancer";
import { Card } from "@/ui/Card";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";

export function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  const Flag = Flags[freelancer.countryCode as keyof typeof Flags];

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar initials={freelancer.initials} name={freelancer.name} />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-gray-900">{freelancer.name}</p>
          <p className="flex items-center gap-1 text-xs text-gray-600">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {freelancer.rating.toFixed(1)}{" "}
            <span className="text-gray-400">({freelancer.reviewCount})</span>
          </p>
          <p className="text-xs text-gray-700">{freelancer.specialty}</p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            {Flag && <Flag className="h-3 w-4 rounded-[1px]" />}
            {freelancer.country}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {freelancer.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Briefcase className="h-3 w-3" />
            {freelancer.projectCount} proyectos
          </p>
          <p className="text-xs font-semibold text-gray-900">
            Desde ${freelancer.monthlyPriceFrom}/mes
          </p>
        </div>
        <Button variant="outline">Ver perfil</Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors referencing `FreelancerCard.tsx`.

---

### Task 7: FreelancerGrid Component — COMPLETE

**Files:**
- Create: `src/modules/inicio/FreelancerGrid.tsx`

**Interfaces:**
- Consumes: `Freelancer` type (Task 2), `FreelancerCard` (Task 6).
- Produces: `FreelancerGrid` component, `{ freelancers: Freelancer[] }` props,
  consumed by the catalog page (Task 10).

- [ ] **Step 1: Write the component**

```tsx
// src/modules/inicio/FreelancerGrid.tsx
import type { Freelancer } from "@/types/freelancer";
import { FreelancerCard } from "@/modules/inicio/FreelancerCard";

export function FreelancerGrid({ freelancers }: { freelancers: Freelancer[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        {freelancers.length} freelancers encontrados
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {freelancers.map((freelancer) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors referencing `FreelancerGrid.tsx`.

---

### Task 8: SearchBar Component — COMPLETE

Already built as a static visual (ahead of the original task order): the current
`src/modules/inicio/SearchBar.tsx` renders `Search` + three `Select`s with
hardcoded example options (categories/countries/price labels matching the user's
mockup) and no props — it doesn't filter anything yet. This task is the rewire step:
turn it into a controlled component driven by `FreelancerFilters`, once Task 2
(types) and Task 3 (seed data) exist.

**Files:**
- Modify: `src/modules/inicio/SearchBar.tsx`

**Interfaces:**
- Consumes: `FreelancerFilters`, `PriceRange` types (Task 2); `Search`, `Select` from
  `@/ui/*` (Task 5, already built).
- Produces: `SearchBar` component with props
  `{ filters: FreelancerFilters; onChange: (filters: FreelancerFilters) => void; categories: string[]; countries: string[] }`,
  consumed by the catalog page (Task 10).

- [ ] **Step 1: Rewrite the component as controlled**

```tsx
// src/modules/inicio/SearchBar.tsx
import type { FreelancerFilters, PriceRange } from "@/types/freelancer";
import { Search } from "@/ui/Search";
import { Select } from "@/ui/Select";

const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  any: "Cualquier precio",
  under200: "Hasta $200/mes",
  "200to300": "$200 - $300/mes",
  over300: "Más de $300/mes",
};

export function SearchBar({
  filters,
  onChange,
  categories,
  countries,
}: {
  filters: FreelancerFilters;
  onChange: (filters: FreelancerFilters) => void;
  categories: string[];
  countries: string[];
}) {
  return (
    <div className="inline-flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
      <Search
        placeholder="Buscar freelancers..."
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        className="w-[600px]"
      />

      <Select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
      >
        <option value="all">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <Select
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
      >
        <option value="all">Todos los países</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </Select>

      <Select
        value={filters.priceRange}
        onChange={(e) =>
          onChange({ ...filters, priceRange: e.target.value as PriceRange })
        }
      >
        {(Object.keys(PRICE_RANGE_LABELS) as PriceRange[]).map((range) => (
          <option key={range} value={range}>
            {PRICE_RANGE_LABELS[range]}
          </option>
        ))}
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors referencing `SearchBar.tsx`.

---

### Task 9: Header Component — COMPLETE

Already done: `src/modules/inicio/Header.tsx` renders the Luck logo + `Button`
variants `outline-neutral` (Ingresar) and `primary` (Registrarse), `bg-white`,
`border-b border-gray-200`. No further action.

Addition after this task was first marked complete: the plain text "Luck" was
replaced with the real logo asset, `public/Logo_principal_oscuro_luck.svg`
(dark-on-transparent version, chosen because the header background is white),
rendered via `next/image` at `h-9 w-auto` (source is 505×257, so width/height props
are `505`/`257` to preserve aspect ratio; `priority` set since it's above the fold).

---

### Pagination Component — COMPLETE (addition, not in original spec)

Not part of the original design doc — added mid-implementation when the grid grew to
55 cards and needed to be split across pages. Already built:
`src/ui/Pagination.tsx`, a reusable primitive with props
`{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }`.
Renders a `ChevronLeft`/`ChevronRight` (lucide-react) prev/next pair and one button
per page number (active page: `bg-indigo-600 text-white`; inactive: bordered gray).
`src/app/page.tsx` currently uses it directly with `PAGE_SIZE = 16` (55 freelancers →
4 pages), slicing the unfiltered `freelancers` array by `currentPage`. This will need
to combine with filtering in Task 10 below: filtering should reset `currentPage` to
`1`, and pagination should slice the *filtered* list, not the raw one.

---

### Task 10: Catalog Page Wiring — COMPLETE

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Header` (Task 9), `SearchBar` (Task 8), `FreelancerGrid` (Task 7),
  `Pagination` (already built, see above), `filterFreelancers`/`defaultFilters`
  (Task 4), `freelancers.json` (Task 3), `Freelancer` type (Task 2) — via
  `@/modules/inicio/*`, `@/ui/Pagination`, `@/lib/*`, `@/data/*`, `@/types/*`.
- Produces: the working `/` catalog route, filtering and pagination combined —
  changing any filter resets to page 1.

- [ ] **Step 1: Mark the page as a Client Component and wire state**

```tsx
// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Header } from "@/modules/inicio/Header";
import { SearchBar } from "@/modules/inicio/SearchBar";
import { FreelancerGrid } from "@/modules/inicio/FreelancerGrid";
import { Pagination } from "@/ui/Pagination";
import { filterFreelancers, defaultFilters } from "@/lib/filterFreelancers";
import type { Freelancer, FreelancerFilters } from "@/types/freelancer";
import freelancersData from "@/data/freelancers.json";

const freelancers = freelancersData as Freelancer[];
const categories = Array.from(new Set(freelancers.map((f) => f.category))).sort();
const countries = Array.from(new Set(freelancers.map((f) => f.country))).sort();
const PAGE_SIZE = 16;

export default function Home() {
  const [filters, setFilters] = useState<FreelancerFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () => filterFreelancers(freelancers, filters),
    [filters],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageFreelancers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleFiltersChange(next: FreelancerFilters) {
    setFilters(next);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <SearchBar
              filters={filters}
              onChange={handleFiltersChange}
              categories={categories}
              countries={countries}
            />
          </div>
          <FreelancerGrid freelancers={pageFreelancers} />
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Enable JSON imports if needed**

Check `tsconfig.json` includes `"resolveJsonModule": true` (create-next-app sets this
by default). If missing, add it under `compilerOptions`.

- [ ] **Step 3: Verify it compiles**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 11: Manual Verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test
```

Expected: all tests pass (9 tests from Task 4).

- [ ] **Step 2: Run the dev server and check the page in a browser**

Run:

```bash
npm run dev
```

Open `http://localhost:3000` and confirm:
- Header shows "Luck" plus "Ingresar"/"Registrarse" buttons.
- Search bar + 3 selects render above a grid of freelancer cards (16 per page).
- Result counter reads "55 freelancers encontrados" initially.
- Typing in the search box narrows results (e.g. "figma" shows only
  designer(s) with that skill).
- Selecting a category, country, or price range narrows results and the counter
  updates; combining filters narrows further (AND behavior).
- Clearing all filters back to defaults restores all 55 cards across 4 pages.
- Pagination shows the correct number of pages for the current filtered result set
  (4 pages unfiltered; fewer once filtered enough to fit one page), clicking a page
  number or the prev/next chevrons changes the visible cards, and changing any
  filter resets back to page 1.

Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: no errors (warnings acceptable only if pre-existing from
`create-next-app`'s own template).
