export type SolicitudStatus = "nueva" | "sin_responder" | "respondida" | "archivada";

export interface Solicitud {
  id: string;
  titulo: string;
  clienteName: string;
  clienteInitials: string;
  planName: string;
  description: string;
  status: SolicitudStatus;
  presupuesto: number;
  tiempoEntrega: number; // en días
  enviado: string; // "Hace X horas/días"
  propuestas: number;
  revisiones: number;
  entregatimeString: string; // "Entrega en hasta X días"
}
