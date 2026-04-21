"use server";

import { ObjectId } from "mongodb";
import { getDatabase } from "../../database/config";

export interface InvoiceItem {
  name: string;
  price: number;
  size: string;
  quantity: number;
  productImage: string;
  color: string;
}

export interface InvoiceDocument {
  _id: string | ObjectId;
  name: string;
  province: string;
  address: string;
  phoneNumber: string;
  note: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: InvoiceItem[];
  txnId: string;
  date: string | Date;
  status?: string;
  paymentStatus?: string;
}

export interface Invoice {
  _id: string;
  name: string;
  province: string;
  address: string;
  phoneNumber: string;
  note: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: InvoiceItem[];
  txnId: string;
  date: string;
  status?: string;
  paymentStatus?: string;
}

export interface InvoicePayload {
  name: string;
  province: string;
  address: string;
  phoneNumber: string;
  note: string;
  shipping: number;
}

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function resolveIdFilter(id: string): { _id: string | ObjectId } {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

function serializeInvoice(document: InvoiceDocument): Invoice {
  return {
    _id: toStringId(document._id),
    name: document.name,
    province: document.province,
    address: document.address,
    phoneNumber: document.phoneNumber,
    note: document.note,
    subtotal: Number(document.subtotal) || 0,
    shipping: Number(document.shipping) || 0,
    total: Number(document.total) || 0,
    items: Array.isArray(document.items) ? document.items : [],
    txnId: document.txnId,
    date: typeof document.date === "string" ? document.date : new Date(document.date).toISOString(),
    status: document.status,
    paymentStatus: document.paymentStatus,
  };
}

export async function listInvoices(): Promise<Invoice[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<InvoiceDocument>("invoices")
    .find({})
    .sort({ date: -1 })
    .toArray();

  return documents.map(serializeInvoice);
}

export async function listPendingInvoices(): Promise<Invoice[]> {
  const db = await getDatabase();
  const documents = await db
    .collection<InvoiceDocument>("invoices")
    .find({
      $or: [
        { status: { $in: ["pending", "PENDING"] } },
        { paymentStatus: { $in: ["pending", "PENDING"] } },
      ],
    })
    .sort({ date: -1 })
    .toArray();

  return documents.map(serializeInvoice);
}

export async function createInvoice(payload: InvoicePayload): Promise<Invoice> {
  const db = await getDatabase();
  const now = new Date();
  const txnId = `INV-${Date.now()}`;
  const subtotal = 0;
  const shipping = Number(payload.shipping) || 0;

  const document: Omit<InvoiceDocument, "_id"> = {
    name: payload.name,
    province: payload.province,
    address: payload.address,
    phoneNumber: payload.phoneNumber,
    note: payload.note,
    subtotal,
    shipping,
    total: subtotal + shipping,
    items: [],
    txnId,
    date: now.toISOString(),
    status: "pending",
  };

  const result = await db.collection<Omit<InvoiceDocument, "_id">>("invoices").insertOne(document);

  return serializeInvoice({ _id: result.insertedId, ...document });
}

export async function updateInvoice(id: string, payload: InvoicePayload): Promise<Invoice> {
  const db = await getDatabase();
  const filter = resolveIdFilter(id);
  const existing = await db.collection<InvoiceDocument>("invoices").findOne(filter);

  if (!existing) {
    throw new Error("Invoice not found");
  }

  const subtotal = Number(existing.subtotal) || 0;
  const shipping = Number(payload.shipping) || 0;

  const updatePayload: Partial<InvoiceDocument> = {
    name: payload.name,
    province: payload.province,
    address: payload.address,
    phoneNumber: payload.phoneNumber,
    note: payload.note,
    shipping,
    total: subtotal + shipping,
  };

  await db.collection<InvoiceDocument>("invoices").updateOne(filter, {
    $set: updatePayload,
  });

  return serializeInvoice({
    ...existing,
    ...updatePayload,
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDatabase();
  const filter = resolveIdFilter(id);
  const result = await db.collection<InvoiceDocument>("invoices").deleteOne(filter);

  if (!result.deletedCount) {
    throw new Error("Invoice not found");
  }
}
