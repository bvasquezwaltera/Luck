import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { LoginForm } from "@/modules/autenticacion/LoginForm";
import { getSafeNext } from "@/lib/safeNext";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = getSafeNext(params.next);

  return (
    <AuthLayout>
      <LoginForm next={next} expired={params.expired === "1"} />
    </AuthLayout>
  );
}
