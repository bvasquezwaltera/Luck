"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProfileErrors } from "@/validators/profileValidation";

// Los errores de validación del perfil llegan a cada campo sin pasarlos por todos los componentes intermedios.
const ProfileErrorsContext = createContext<ProfileErrors>({});

export function ProfileErrorsProvider({ errors, children }: { errors: ProfileErrors; children: ReactNode }) {
  return <ProfileErrorsContext.Provider value={errors}>{children}</ProfileErrorsContext.Provider>;
}

// El error de un campo ("name", "experience.0.role"…), o undefined si no tiene.
export function useProfileError(key: string): string | undefined {
  return useContext(ProfileErrorsContext)[key];
}

// Todos los errores a la vez, para los componentes que recorren listas.
export function useProfileErrors(): ProfileErrors {
  return useContext(ProfileErrorsContext);
}
