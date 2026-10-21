"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deleteAccount } from "@/lib/api/client/auth";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function UserSection({ email }: { email: string }) {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleChangePassword() {
    if (!newPassword) return;
    setIsChangingPassword(true);
    setPasswordMessage(null);

    const result = await changePassword({ newPassword });

    setIsChangingPassword(false);
    if (result.error) {
      setPasswordMessage({ type: "error", text: result.error });
      return;
    }
    setPasswordMessage({ type: "success", text: "Contraseña actualizada." });
    setNewPassword("");
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError("");

    const result = await deleteAccount();

    setIsDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.push("/login");
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cuenta</h3>

        <Input label="Email" name="email" type="email" autoComplete="username" value={email} readOnly />

        <Input
          label="Nueva contraseña"
          name="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {passwordMessage && (
          <p className={`text-xs ${passwordMessage.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
            {passwordMessage.text}
          </p>
        )}

        <Button
          variant="outline-neutral"
          className="!min-w-0 !px-4"
          onClick={handleChangePassword}
          disabled={isChangingPassword || !newPassword}
        >
          {isChangingPassword ? "Cambiando..." : "Cambiar contraseña"}
        </Button>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Zona de peligro</h3>
        <p className="text-sm text-gray-600">
          Eliminar tu cuenta es una acción permanente y no se puede deshacer.
        </p>

        {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}

        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-red-600">¿Confirmas que quieres eliminar tu cuenta?</p>
            <Button
              variant="outline-neutral"
              className="!min-w-0 !px-4 !border-red-300 !text-red-600 hover:!bg-red-50"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
            </Button>
            <Button
              variant="outline-neutral"
              className="!min-w-0 !px-4"
              onClick={() => setConfirmingDelete(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="outline-neutral"
            className="!min-w-0 !px-4 hover:!border-red-300 hover:!text-red-600"
            onClick={() => setConfirmingDelete(true)}
          >
            Eliminar cuenta
          </Button>
        )}
      </Card>
    </div>
  );
}
