from datetime import datetime

from pydantic import BaseModel


class MessageAttachment(BaseModel):
    name: str
    type: str  # "pdf" | "image" | "file"
    size: str


class MessageOut(BaseModel):
    id: str
    mine: bool
    text: str
    createdAt: datetime
    read: bool  # la otra persona ya lo leyó
    attachment: MessageAttachment | None


class ConversationCounterpart(BaseModel):
    id: str
    name: str
    initials: str


class ConversationLastMessage(BaseModel):
    text: str  # si solo trae archivo, el nombre del archivo
    mine: bool
    createdAt: datetime


class Conversation(BaseModel):
    contractId: str
    title: str  # el proyecto del contrato
    counterpart: ConversationCounterpart
    lastMessage: ConversationLastMessage | None
    unread: int  # mensajes de la otra persona que aún no leí


class MessageAttachmentUrl(BaseModel):
    url: str


class UnreadCount(BaseModel):
    count: int
