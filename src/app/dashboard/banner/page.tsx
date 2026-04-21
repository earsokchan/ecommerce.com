import BannerClient from "./BannerClient";
import { getBannerDatabase } from "../../database/banner";
import { serializeBanner } from "./serialize";
import type { BannerDocument } from "./actions";

export default async function BannerPage() {
  const db = await getBannerDatabase();
  const banners = await db.collection<BannerDocument>("banners").find({}).sort({ slot: 1 }).toArray();

  return <BannerClient initialBanners={banners.map(serializeBanner)} />;
}