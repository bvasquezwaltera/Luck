import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ category, name }: { category: string; name: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500">
      <Link href="/" className="hover:text-indigo-600">
        Inicio
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span>{category}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-gray-900">{name}</span>
    </nav>
  );
}
