"use client";

import { useCallback, useRef, useState } from "react";
import { saveOnboardingState } from "@/lib/api/client/onboarding";
import type { OnboardingState } from "@/lib/onboardingSteps";

const ORDER: OnboardingState[] = ["pendiente", "bienvenida_vista", "completado"];

// La guía de bienvenida solo avanza. El cambio se ve al instante y se guarda en segundo plano.
export function useOnboarding(initial: OnboardingState) {
  const [state, setState] = useState<OnboardingState>(initial);
  const current = useRef<OnboardingState>(initial);

  const advance = useCallback((next: OnboardingState) => {
    if (ORDER.indexOf(next) <= ORDER.indexOf(current.current)) return;
    current.current = next;
    setState(next);
    void saveOnboardingState(next);
  }, []);

  return { state, advance };
}
