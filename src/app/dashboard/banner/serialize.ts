import type { Banner, BannerDocument } from "./actions";

function toStringId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

export function serializeBanner(document: BannerDocument): Banner {
  return {
    _id: toStringId(document._id),
    slot: document.slot,
    imageUrl: document.imageUrl,
  };
}
