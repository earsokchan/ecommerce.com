import { getProductDatabase } from "../../../../database/product";
import { MessageClient } from "./MessageClient";
import { serializeMessage } from "./serialize";
import type { MessageDocument } from "./actions";

export default async function MessagePage() {
  const db = await getProductDatabase();
  const messages = await db.collection<MessageDocument>("messages").find({}).sort({ createdAt: -1 }).toArray();

  return <MessageClient initialMessages={messages.map(serializeMessage)} />;
}
