import type { ItemBrand, ItemBrandDocument } from "./actions";

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

export function serializeItemBrand(document: ItemBrandDocument): ItemBrand {
  return {
    _id: toStringId(document._id),
    item_brand: document.item_brand,
    image: document.image,
  };
}
