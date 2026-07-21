import Image from "next/image";
import Link from "next/link";
import { Button } from "@/ui/Button";

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      <Link href="/">
        <Image
          src="/Logo_principal_oscuro_luck.svg"
          alt="Luck"
          width={505}
          height={257}
          className="h-9 w-auto"
          priority
        />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline-neutral"
          href="/login"
          className="!min-w-0 !px-4 sm:!min-w-[110px] sm:!px-6"
        >
          Ingresar
        </Button>
        <Button
          variant="primary"
          href="/registro"
          className="!min-w-0 !px-4 sm:!min-w-[110px] sm:!px-6"
        >
          Registrarse
        </Button>
      </div>
    </header>
  );
}
