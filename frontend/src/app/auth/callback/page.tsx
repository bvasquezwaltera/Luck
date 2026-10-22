import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { OAuthCallback } from "@/modules/autenticacion/OAuthCallback";

export default function OAuthCallbackPage() {
  return (
    <AuthLayout>
      <OAuthCallback />
    </AuthLayout>
  );
}
