import type { Message, MessageDocument } from "./actions";

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

export function serializeMessage(document: MessageDocument): Message {
  return {
    _id: toStringId(document._id),
    message: document.message,
  };
}
