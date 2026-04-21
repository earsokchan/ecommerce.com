import { Db, MongoClient, MongoClientOptions } from "mongodb";

const mongoUri =
	"mongodb+srv://taget-clothe-api-v3:gOLnob3ViyD60xPT@cluster0.iswyjxz.mongodb.net/taget-clothe-api-v3?appName=Cluster0";

const databaseName = "taget-clothe-api-v3";
const clientOptions: MongoClientOptions = {};

declare global {
	// eslint-disable-next-line no-var
	var _productMongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(mongoUri, clientOptions);

const clientPromise =
	globalThis._productMongoClientPromise ??
	client.connect().then((connectedClient) => connectedClient);

if (process.env.NODE_ENV !== "production") {
	globalThis._productMongoClientPromise = clientPromise;
}

export async function getProductDatabase(): Promise<Db> {
	const connectedClient = await clientPromise;
	return connectedClient.db(databaseName);
}

export { databaseName, mongoUri };
