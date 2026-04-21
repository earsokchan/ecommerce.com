"use server";

import { ObjectId } from "mongodb";
import { getBannerDatabase } from "../../database/banner";

export interface BannerDocument {
  _id: string | ObjectId;
  slot: string;
  imageUrl: string;
  __v?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Banner {
  _id: string;
  slot: string;
  imageUrl: string;
}

interface BannerPayload {
  slot: string;
  imageUrl: string;
}

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function resolveIdFilter(id: string): { _id: string | ObjectId } {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function createBanner(payload: BannerPayload): Promise<Banner> {
  const db = await getBannerDatabase();
  const now = new Date();

  const result = await db.collection<Omit<BannerDocument, "_id">>("banners").insertOne({
    slot: payload.slot,
    imageUrl: payload.imageUrl,
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: toStringId(result.insertedId),
    slot: payload.slot,
    imageUrl: payload.imageUrl,
  };
}

export async function updateBanner(
  id: string,
  payload: Partial<BannerPayload>,
): Promise<Banner> {
  const db = await getBannerDatabase();
  const filter = resolveIdFilter(id);
  const existingBanner = await db.collection<BannerDocument>("banners").findOne(filter);

  if (!existingBanner) {
    throw new Error("Banner not found");
  }

  const nextBanner = {
    slot: payload.slot ?? existingBanner.slot,
    imageUrl: payload.imageUrl ?? existingBanner.imageUrl,
    updatedAt: new Date(),
  };

  await db.collection<BannerDocument>("banners").updateOne(filter, {
    $set: nextBanner,
  });

  return {
    _id: toStringId(existingBanner._id),
    slot: nextBanner.slot,
    imageUrl: nextBanner.imageUrl,
  };
}

export async function deleteBanner(id: string): Promise<void> {
  const db = await getBannerDatabase();
  const filter = resolveIdFilter(id);
  const result = await db.collection<BannerDocument>("banners").deleteOne(filter);

  if (!result.deletedCount) {
    throw new Error("Banner not found");
  }
}
