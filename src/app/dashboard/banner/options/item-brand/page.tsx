import { getProductDatabase } from "../../../../database/product";
import ItemBrandClient from "./ItemBrandClient";
import { serializeItemBrand } from "./serialize";
import type { ItemBrandDocument } from "./actions";

export default async function ItemBrandPage() {
  const db = await getProductDatabase();
  const itemBrands = await db.collection<ItemBrandDocument>("item_brands").find({}).sort({ item_brand: 1 }).toArray();

  return <ItemBrandClient initialItemBrands={itemBrands.map(serializeItemBrand)} />;
}
