export interface MessageAttachment {
  name: string;
  type: "pdf" | "image" | "file";
  size: string;
}

export interface ChatMessage {
  id: string;
  mine: boolean;
  text: string;
  createdAt: string;
  // La otra persona ya lo leyó (en los mensajes recibidos: yo ya los leí).
  read: boolean;
  attachment: MessageAttachment | null;
}

export interface Conversation {
  contractId: string;
  title: string;
  counterpart: { id: string; name: string; initials: string };
  lastMessage: { text: string; mine: boolean; createdAt: string } | null;
  unread: number;
}
