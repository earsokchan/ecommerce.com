"use server";

import { ObjectId } from "mongodb";
import { getProductDatabase } from "../../../../database/product";

export interface CategoryDocument {
  _id: string | ObjectId;
  category: string;
  __v?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  _id: string;
  category: string;
}

interface CategoryPayload {
  category: string;
}

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function resolveIdFilter(id: string): { _id: string | ObjectId } {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const db = await getProductDatabase();
  const now = new Date();

  const result = await db.collection<Omit<CategoryDocument, "_id">>("categories").insertOne({
    category: payload.category,
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: toStringId(result.insertedId),
    category: payload.category,
  };
}

export async function updateCategory(id: string, payload: CategoryPayload): Promise<Category> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const existingCategory = await db.collection<CategoryDocument>("categories").findOne(filter);

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  await db.collection<CategoryDocument>("categories").updateOne(filter, {
    $set: {
      category: payload.category,
      updatedAt: new Date(),
    },
  });

  return {
    _id: toStringId(existingCategory._id),
    category: payload.category,
  };
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const result = await db.collection<CategoryDocument>("categories").deleteOne(filter);

  if (!result.deletedCount) {
    throw new Error("Category not found");
  }
}
