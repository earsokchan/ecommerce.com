import type { Category, CategoryDocument } from "./actions";

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

export function serializeCategory(document: CategoryDocument): Category {
  return {
    _id: toStringId(document._id),
    category: document.category,
  };
}
