import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function UserSection() {
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cuenta</h3>

        <Input label="Email" type="email" defaultValue="maria.c@example.com" />

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Contraseña actual" type="password" />
          <Input label="Nueva contraseña" type="password" />
        </div>

        <Button variant="outline-neutral" className="!min-w-0 !px-4">
          Cambiar contraseña
        </Button>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Zona de peligro</h3>
        <p className="text-sm text-gray-600">
          Eliminar tu cuenta es una acción permanente y no se puede deshacer.
        </p>
        <Button
          variant="outline-neutral"
          className="!min-w-0 !px-4 hover:!border-red-300 hover:!text-red-600"
        >
          Eliminar cuenta
        </Button>
      </Card>
    </div>
  );
}
