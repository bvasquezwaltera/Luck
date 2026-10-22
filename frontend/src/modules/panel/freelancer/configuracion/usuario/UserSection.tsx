"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { changePassword, deleteAccount } from "@/lib/api/client/auth";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";

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
  const [confirmText, setConfirmText] = useState("");

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

  function closeDeleteModal() {
    if (isDeleting) return;
    setConfirmingDelete(false);
    setConfirmText("");
    setDeleteError("");
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

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Email" name="email" type="email" autoComplete="username" value={email} readOnly />

          <Input
            label="Nueva contraseña"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

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

        <Button
          variant="outline-neutral"
          className="!min-w-0 !px-4 hover:!border-red-300 hover:!text-red-600"
          onClick={() => setConfirmingDelete(true)}
        >
          Eliminar cuenta
        </Button>
      </Card>
      <Modal open={confirmingDelete} onClose={closeDeleteModal} size="sm">
        <div className="p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-900">¿Eliminar tu cuenta?</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            Esta acción es permanente y no se puede deshacer. Se borrará todo lo asociado a tu cuenta:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Tu perfil y tus datos</li>
            <li>Solicitudes, contratos, pagos y entregas</li>
            <li>Los archivos adjuntos que subiste</li>
          </ul>

          <div className="mt-5">
            <Input
              label="Escribe ELIMINAR para confirmar"
              name="confirm-delete"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
            />
          </div>

          {deleteError && <p className="mt-3 text-xs text-red-500">{deleteError}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline-neutral" className="!min-w-0 !px-4" onClick={closeDeleteModal} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="outline-neutral"
              className="!min-w-0 !border-red-600 !bg-red-600 !px-4 !text-white hover:!bg-red-700 disabled:!border-red-200 disabled:!bg-red-200"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText.trim() !== "ELIMINAR"}
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
