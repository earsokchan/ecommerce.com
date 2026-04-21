import { getProductDatabase } from "../../../../database/product";
import { TopItemsClient } from "./TopItemsClient";
import { serializeProduct, serializeTopProduct } from "./serialize";
import type { ProductDocument, TopProductDocument } from "./actions";

export default async function TopItemsPage() {
  const db = await getProductDatabase();

  const [products, topProductsDocs] = await Promise.all([
    db.collection<ProductDocument>("products").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection<TopProductDocument>("topproducts").find({}).sort({ createdAt: -1 }).toArray(),
  ]);

  const serializedProducts = products.map(serializeProduct);
  const productsById = new Map(serializedProducts.map((product) => [product._id, product]));
  const initialTopProducts = topProductsDocs
    .map((document) => {
      const rawProductId = document.product ?? document.productId;
      const productId = typeof rawProductId === "string" ? rawProductId : rawProductId ? String(rawProductId) : "";
      const product = productsById.get(productId);
      return product ? serializeTopProduct(document, product) : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return <TopItemsClient initialProducts={serializedProducts} initialTopProducts={initialTopProducts} />;
}
