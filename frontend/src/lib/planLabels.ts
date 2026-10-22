// El freelancer escribe estos dos datos del plan como texto libre ("2", "Ilimitados"…). Solos, un "2" no dice qué es:
// con un número se arma la frase ("2 proyectos activos"); con cualquier otro texto se antepone el nombre del dato.
function describe(value: string, singular: string, plural: string, label: string): string | null {
  const text = value.trim();
  if (!text) return null;

  if (/^\d+$/.test(text)) {
    const amount = Number(text);
    return `${amount} ${amount === 1 ? singular : plural}`;
  }
  return `${label}: ${text}`;
}

export function activeProjectsLabel(value: string): string | null {
  return describe(value, "proyecto activo", "proyectos activos", "Proyectos activos");
}

export function revisionsLabel(value: string): string | null {
  return describe(value, "revisión", "revisiones", "Revisiones");
}

// Las líneas que describen un plan al cliente: los dos datos fijos, con nombre, y después las características propias.
export function planFeatureLines(plan: {
  activeProjects: string;
  revisions: string;
  features: Array<{ label: string; value: string }>;
}): string[] {
  return [
    activeProjectsLabel(plan.activeProjects),
    revisionsLabel(plan.revisions),
    ...plan.features.map((feature) => `${feature.label}: ${feature.value}`),
  ].filter((line): line is string => Boolean(line));
}
