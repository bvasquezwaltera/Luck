import { AuthLayout } from "@/modules/autenticacion/AuthLayout";
import { SessionRenew } from "@/modules/autenticacion/SessionRenew";
import { getSafeNext } from "@/lib/safeNext";

export default async function SessionRenewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = getSafeNext((await searchParams).next);

  return (
    <AuthLayout>
      <SessionRenew next={next} />
    </AuthLayout>
  );
}
