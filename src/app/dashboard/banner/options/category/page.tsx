import { getProductDatabase } from "../../../../database/product";
import CategoryClient from "./CategoryClient";
import { serializeCategory } from "./serialize";
import type { CategoryDocument } from "./actions";

export default async function CategoryPage() {
  const db = await getProductDatabase();
  const categories = await db.collection<CategoryDocument>("categories").find({}).sort({ category: 1 }).toArray();

  return <CategoryClient initialCategories={categories.map(serializeCategory)} />;
}
