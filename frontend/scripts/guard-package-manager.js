// Este proyecto se instala solo con npm. pnpm reestructura node_modules a su
// propio formato (node_modules/.pnpm) y deja el proyecto en un estado mixto
// que rompe next dev — ya pasó varias veces por accidente.
const userAgent = process.env.npm_config_user_agent || "";

if (userAgent.startsWith("pnpm")) {
  console.error("\n✖ Este proyecto usa npm, no pnpm.\n  Corré: npm install / npm run dev\n");
  process.exit(1);
}

if (userAgent.startsWith("yarn")) {
  console.error("\n✖ Este proyecto usa npm, no yarn.\n  Corré: npm install / npm run dev\n");
  process.exit(1);
}
