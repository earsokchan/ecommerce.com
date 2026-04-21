import type { Product, ProductDocument, TopProduct, TopProductDocument } from "./actions";

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

export function serializeProduct(document: ProductDocument): Product {
  return {
    _id: toStringId(document._id),
    name: document.name,
    price: document.price,
    brand: document.brand,
    category: document.category,
    productItems: document.productItems,
  };
}

export function serializeTopProduct(document: TopProductDocument, product: Product): TopProduct {
  const productRef = "product" in document ? document.product : undefined;
  return {
    _id: toStringId(document._id),
    productId: toStringId(productRef ?? ("productId" in document ? document.productId : "")),
    product,
  };
}
