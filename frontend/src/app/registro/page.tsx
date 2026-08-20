import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { RegisterForm } from "@/modules/autenticacion/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
