import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { ResetPasswordForm } from "@/modules/autenticacion/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
