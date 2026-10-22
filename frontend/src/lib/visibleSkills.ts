// En la tarjeta del listado solo caben unas pocas habilidades: las primeras se ven y el resto se resume en "+N".
export const CARD_SKILLS_VISIBLE = 2;

export function visibleSkills(skills: string[], max = CARD_SKILLS_VISIBLE): { shown: string[]; hidden: string[] } {
  const clean = skills.map((skill) => skill.trim()).filter(Boolean);
  return { shown: clean.slice(0, max), hidden: clean.slice(max) };
}
