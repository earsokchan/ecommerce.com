"use server";

import { ObjectId } from "mongodb";
import { getProductDatabase } from "../../../../database/product";

export interface ItemBrandDocument {
  _id: string | ObjectId;
  item_brand: string;
  image?: string;
  __v?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ItemBrand {
  _id: string;
  item_brand: string;
  image?: string;
}

interface ItemBrandPayload {
  item_brand: string;
  image?: string;
}

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function resolveIdFilter(id: string): { _id: string | ObjectId } {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function createItemBrand(payload: ItemBrandPayload): Promise<ItemBrand> {
  const db = await getProductDatabase();
  const now = new Date();

  const result = await db.collection<Omit<ItemBrandDocument, "_id">>("item_brands").insertOne({
    item_brand: payload.item_brand,
    image: payload.image,
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: toStringId(result.insertedId),
    item_brand: payload.item_brand,
    image: payload.image,
  };
}

export async function updateItemBrand(
  id: string,
  payload: ItemBrandPayload,
): Promise<ItemBrand> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const existingItemBrand = await db.collection<ItemBrandDocument>("item_brands").findOne(filter);

  if (!existingItemBrand) {
    throw new Error("Item brand not found");
  }

  const nextImage = payload.image ?? existingItemBrand.image;

  await db.collection<ItemBrandDocument>("item_brands").updateOne(filter, {
    $set: {
      item_brand: payload.item_brand,
      image: nextImage,
      updatedAt: new Date(),
    },
  });

  return {
    _id: toStringId(existingItemBrand._id),
    item_brand: payload.item_brand,
    image: nextImage,
  };
}

export async function deleteItemBrand(id: string): Promise<void> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const result = await db.collection<ItemBrandDocument>("item_brands").deleteOne(filter);

  if (!result.deletedCount) {
    throw new Error("Item brand not found");
  }
}
