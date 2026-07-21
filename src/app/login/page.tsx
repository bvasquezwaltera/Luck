import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { LoginForm } from "@/modules/autenticacion/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
