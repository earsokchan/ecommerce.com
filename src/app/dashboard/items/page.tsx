import { getProductDatabase } from "../../database/product";
import ItemsClient, { type Product } from "./ItemsClient";

interface ProductDocument extends Omit<Product, "_id"> {
	_id: unknown;
}

interface CategoryDocument {
	_id: unknown;
	category: string;
}

interface BrandDocument {
	_id: unknown;
	item_brand: string;
}

function serializeProducts(documents: ProductDocument[]): Product[] {
	return JSON.parse(JSON.stringify(documents)) as Product[];
}

function serializeCategories(documents: CategoryDocument[]): Array<{ _id: string; category: string }> {
	return JSON.parse(JSON.stringify(documents)) as Array<{ _id: string; category: string }>;
}

function serializeBrands(documents: BrandDocument[]): Array<{ _id: string; item_brand: string }> {
	return JSON.parse(JSON.stringify(documents)) as Array<{ _id: string; item_brand: string }>;
}

export default async function ItemsPage() {
	const db = await getProductDatabase();

	const [products, categories, brands] = await Promise.all([
		db.collection<ProductDocument>("products").find({}).sort({ createdAt: -1 }).toArray(),
		db.collection<CategoryDocument>("categories").find({}).sort({ category: 1 }).toArray(),
		db.collection<BrandDocument>("item_brands").find({}).sort({ item_brand: 1 }).toArray(),
	]);

	return (
		<ItemsClient
			initialProducts={serializeProducts(products)}
			initialCategories={serializeCategories(categories)}
			initialBrands={serializeBrands(brands)}
		/>
	);
}