import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { LoginForm } from "@/modules/autenticacion/LoginForm";
import { getSafeNext } from "@/lib/safeNext";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = getSafeNext((await searchParams).next);

  return (
    <AuthLayout>
      <LoginForm next={next} />
    </AuthLayout>
  );
}
