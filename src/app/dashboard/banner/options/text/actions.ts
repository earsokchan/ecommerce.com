"use server";

import { ObjectId } from "mongodb";
import { getProductDatabase } from "../../../../database/product";

export interface MessageDocument {
  _id: string | ObjectId;
  message: string;
  __v?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Message {
  _id: string;
  message: string;
}

interface MessagePayload {
  message: string;
}

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function resolveIdFilter(id: string): { _id: string | ObjectId } {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function createMessage(payload: MessagePayload): Promise<Message> {
  const db = await getProductDatabase();
  const now = new Date();

  const result = await db.collection<Omit<MessageDocument, "_id">>("messages").insertOne({
    message: payload.message,
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: toStringId(result.insertedId),
    message: payload.message,
  };
}

export async function updateMessage(id: string, payload: MessagePayload): Promise<Message> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const existingMessage = await db.collection<MessageDocument>("messages").findOne(filter);

  if (!existingMessage) {
    throw new Error("Message not found");
  }

  await db.collection<MessageDocument>("messages").updateOne(filter, {
    $set: {
      message: payload.message,
      updatedAt: new Date(),
    },
  });

  return {
    _id: toStringId(existingMessage._id),
    message: payload.message,
  };
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const result = await db.collection<MessageDocument>("messages").deleteOne(filter);

  if (!result.deletedCount) {
    throw new Error("Message not found");
  }
}
