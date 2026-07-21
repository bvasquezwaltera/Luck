import { Briefcase, Search } from "lucide-react";
import { Button } from "@/ui/Button";

export type Role = "freelancer" | "cliente";

const ROLES: { value: Role; label: string; icon: typeof Briefcase }[] = [
  { value: "freelancer", label: "Freelancer", icon: Briefcase },
  { value: "cliente", label: "Cliente", icon: Search },
];

export function RoleToggle({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="flex justify-center gap-2">
      {ROLES.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          pill
          variant={value === role ? "soft" : "outline-neutral"}
          onClick={() => onChange(value)}
          className="gap-1.5"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}
