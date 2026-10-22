import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { RegisterForm } from "@/modules/autenticacion/RegisterForm";
import { getSafeNext } from "@/lib/safeNext";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = getSafeNext((await searchParams).next);

  return (
    <AuthLayout>
      <RegisterForm next={next} />
    </AuthLayout>
  );
}
