import categories from "@/data/categories.json";
import countries from "@/data/countries.json";
import timezones from "@/data/timezones.json";
import { parsePeriod, PRESENT } from "@/lib/periodFormat";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { validateFullNameField } from "@/validators/validators";

// Las mismas reglas que el backend (backend/app/services/profile_validation.py): aquí se muestran por campo mientras se
// edita, y allá no se pueden saltar llamando a la API directamente. Si cambias un límite, cámbialo en los dos.
export const PROFILE_LIMITS = {
  specialty: 100,
  bio: 1000,
  text: 100, // rol, empresa, título, institución
  description: 1000,
  languageName: 40,
  languages: 10,
  experience: 15,
  education: 15,
  workMethods: 10,
  workMethodLabel: 50,
  differentiators: { items: 10, length: 150 },
  skills: { items: 30, length: 50 },
  tools: { items: 30, length: 50 },
  workMethodItems: { items: 20, length: 50 },
} as const;

export const LANGUAGE_LEVELS = ["Básico", "Intermedio", "Avanzado", "Nativo"];
const MIN_YEAR = 1950;

// Clave de cada error: "name", "skills.2", "experience.0.role"… (la pantalla la busca por el mismo nombre).
export type ProfileErrors = Record<string, string>;

function checkText(errors: ProfileErrors, key: string, value: string, max: number, required = false, requiredMessage = "Es obligatorio") {
  const text = value.trim();
  if (required && !text) errors[key] = requiredMessage;
  else if (text.length > max) errors[key] = `Máximo ${max} caracteres`;
}

function checkList(errors: ProfileErrors, key: string, values: string[], limit: { items: number; length: number }) {
  const filled = values.filter((value) => value.trim());
  if (filled.length > limit.items) errors[key] = `Puedes agregar hasta ${limit.items}`;
  values.forEach((value, index) => {
    if (value.trim().length > limit.length) errors[`${key}.${index}`] = `Máximo ${limit.length} caracteres`;
  });
}

function checkPeriod(errors: ProfileErrors, key: string, period: string, allowPresent: boolean) {
  const { from, to } = parsePeriod(period);
  const currentYear = new Date().getFullYear();
  const valid = (year: string) => /^\d{4}$/.test(year) && Number(year) >= MIN_YEAR && Number(year) <= currentYear;

  if (!from) errors[key] = "Elige el año de inicio";
  else if (!valid(from)) errors[key] = `El año debe estar entre ${MIN_YEAR} y ${currentYear}`;
  else if (to && to === PRESENT && !allowPresent) errors[key] = "El año de fin no es válido";
  else if (to && to !== PRESENT && (!valid(to) || Number(to) < Number(from))) {
    errors[key] = "El año de fin no puede ser anterior al de inicio";
  }
}

export function validateLocation(errors: ProfileErrors, profile: Pick<FreelancerProfile, "countryCode" | "timezone">) {
  if (!countries.some((country) => country.code === profile.countryCode)) errors.countryCode = "Elige un país";
  if (!timezones.includes(profile.timezone)) errors.timezone = "Elige una zona horaria";
}

// Perfil del cliente: solo nombre, país y zona horaria.
export function validateClientProfile(profile: Pick<FreelancerProfile, "name" | "countryCode" | "timezone">): ProfileErrors {
  const errors: ProfileErrors = {};
  const nameError = validateFullNameField(profile.name);
  if (nameError) errors.name = nameError;
  validateLocation(errors, profile);
  return errors;
}

export function validateFreelancerProfile(profile: FreelancerProfile): ProfileErrors {
  const errors = validateClientProfile(profile);

  checkText(errors, "specialty", profile.specialty, PROFILE_LIMITS.specialty);
  if (profile.category.trim() && !categories.includes(profile.category)) errors.category = "Elige una categoría de la lista";
  checkText(errors, "bio", profile.bio, PROFILE_LIMITS.bio);

  checkList(errors, "differentiators", profile.differentiators, PROFILE_LIMITS.differentiators);
  checkList(errors, "skills", profile.skills, PROFILE_LIMITS.skills);
  checkList(errors, "tools", profile.tools, PROFILE_LIMITS.tools);

  // Las filas totalmente vacías no cuentan (el backend las descarta al guardar).
  let languageCount = 0;
  profile.languages.forEach((language, index) => {
    const name = language.name.trim();
    if (!name && !language.level) return;
    languageCount += 1;
    checkText(errors, `languages.${index}.name`, name, PROFILE_LIMITS.languageName, true, "Escribe el idioma");
    if (!LANGUAGE_LEVELS.includes(language.level)) errors[`languages.${index}.level`] = "Elige el nivel";
  });
  if (languageCount > PROFILE_LIMITS.languages) errors.languages = `Puedes agregar hasta ${PROFILE_LIMITS.languages}`;

  let experienceCount = 0;
  profile.experience.forEach((entry, index) => {
    if (![entry.period, entry.role, entry.company, entry.description].some((value) => value.trim())) return;
    experienceCount += 1;
    checkPeriod(errors, `experience.${index}.period`, entry.period, true);
    checkText(errors, `experience.${index}.role`, entry.role, PROFILE_LIMITS.text, true, "Escribe el rol");
    checkText(errors, `experience.${index}.company`, entry.company, PROFILE_LIMITS.text, true, "Escribe la empresa");
    checkText(errors, `experience.${index}.description`, entry.description, PROFILE_LIMITS.description);
  });
  if (experienceCount > PROFILE_LIMITS.experience) errors.experience = `Puedes agregar hasta ${PROFILE_LIMITS.experience}`;

  let educationCount = 0;
  profile.education.forEach((entry, index) => {
    if (![entry.period, entry.degree, entry.institution].some((value) => value.trim())) return;
    educationCount += 1;
    checkPeriod(errors, `education.${index}.period`, entry.period, false);
    checkText(errors, `education.${index}.degree`, entry.degree, PROFILE_LIMITS.text, true, "Escribe el título");
    checkText(errors, `education.${index}.institution`, entry.institution, PROFILE_LIMITS.text, true, "Escribe la institución");
  });
  if (educationCount > PROFILE_LIMITS.education) errors.education = `Puedes agregar hasta ${PROFILE_LIMITS.education}`;

  let categoryCount = 0;
  profile.workMethods.forEach((category, index) => {
    const items = category.items.filter((item) => item.trim());
    if (!category.label.trim() && items.length === 0) return;
    categoryCount += 1;
    checkText(errors, `workMethods.${index}.label`, category.label, PROFILE_LIMITS.workMethodLabel, true, "Escribe el nombre de la categoría");
    checkList(errors, `workMethods.${index}.items`, category.items, PROFILE_LIMITS.workMethodItems);
  });
  if (categoryCount > PROFILE_LIMITS.workMethods) errors.workMethods = `Puedes agregar hasta ${PROFILE_LIMITS.workMethods} categorías`;

  return errors;
}
