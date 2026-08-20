import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { ForgotPasswordForm } from "@/modules/autenticacion/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
