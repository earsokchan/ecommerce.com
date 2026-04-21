"use server";

import { ObjectId } from "mongodb";
import { getProductDatabase } from "../../../../database/product";

export interface ProductDocument {
  _id: string | ObjectId;
  name: string;
  price?: number;
  brand?: string;
  category?: string;
  productItems?: { productimages?: string[] }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Product {
  _id: string;
  name: string;
  price?: number;
  brand?: string;
  category?: string;
  productItems?: { productimages?: string[] }[];
}

export interface TopProductDocument {
  _id: string | ObjectId;
  product: string | ObjectId;
  productId?: string | ObjectId;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TopProduct {
  _id: string;
  productId: string;
  product?: Product;
}

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function resolveIdFilter(id: string): { _id: string | ObjectId } {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

function resolveProductRefFilter(id: string): { product: string | ObjectId } {
  return ObjectId.isValid(id) ? { product: new ObjectId(id) } : { product: id };
}

function resolveEmbeddedProductId(id: string): string | ObjectId {
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

export async function createTopProduct(productId: string): Promise<TopProductDocument> {
  const db = await getProductDatabase();
  const now = new Date();
  const filter = resolveProductRefFilter(productId);
  const existingTopProduct = await db.collection<TopProductDocument>("topproducts").findOne(filter);

  if (existingTopProduct) {
    return existingTopProduct;
  }

  const result = await db.collection<Omit<TopProductDocument, "_id">>("topproducts").insertOne({
    product: resolveEmbeddedProductId(productId),
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: result.insertedId,
    product: resolveEmbeddedProductId(productId),
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateProductName(productId: string, name: string): Promise<Product> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(productId);
  const existingProduct = await db.collection<ProductDocument>("products").findOne(filter);

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  await db.collection<ProductDocument>("products").updateOne(filter, {
    $set: {
      name,
      updatedAt: new Date(),
    },
  });

  return {
    _id: toStringId(existingProduct._id),
    name,
    price: existingProduct.price,
    brand: existingProduct.brand,
    category: existingProduct.category,
    productItems: existingProduct.productItems,
  };
}

export async function deleteTopProduct(id: string): Promise<void> {
  const db = await getProductDatabase();
  const filter = resolveIdFilter(id);
  const result = await db.collection<TopProductDocument>("topproducts").deleteOne(filter);

  if (!result.deletedCount) {
    throw new Error("Top product not found");
  }
}
