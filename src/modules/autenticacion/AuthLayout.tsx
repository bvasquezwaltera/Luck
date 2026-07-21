import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br from-indigo-100 via-pink-100 to-purple-100 px-6 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <Link href="/" className="absolute left-8 top-8">
        <Image
          src="/Logo_principal_oscuro_luck.svg"
          alt="Luck"
          width={505}
          height={257}
          className="h-9 w-auto"
        />
      </Link>
      {children}
      <p className="flex items-center gap-1.5 text-xs text-gray-500">
        <ShieldCheck className="h-4 w-4" />
        Tu información está protegida con encriptación de extremo a extremo.
      </p>
    </div>
  );
}
