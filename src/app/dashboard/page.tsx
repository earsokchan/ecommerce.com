import DashboardClient, { type Invoice } from './DashboardClient';
import { getDatabase } from '../database/config';

type MongoInvoice = Omit<Invoice, '_id' | 'date'> & {
  _id: unknown;
  date?: string | Date;
};

function serializeInvoice(invoice: MongoInvoice): Invoice {
  // Convert BSON-heavy MongoDB documents into plain JSON-safe data.
  const plainInvoice = JSON.parse(JSON.stringify(invoice)) as Omit<Invoice, '_id' | 'date'> & {
    _id: unknown;
    date?: string;
  };

  return {
    ...plainInvoice,
    _id: typeof plainInvoice._id === 'string' ? plainInvoice._id : String(plainInvoice._id),
    date: plainInvoice.date ? new Date(plainInvoice.date).toISOString() : new Date().toISOString(),
  };
}

export default async function DashboardPage() {
  const db = await getDatabase();
  const invoices = await db.collection<MongoInvoice>('invoices').find({}).sort({ date: -1 }).toArray();

  return <DashboardClient initialInvoices={invoices.map(serializeInvoice)} />;
}