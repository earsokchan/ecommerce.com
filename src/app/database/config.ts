import { Db, MongoClient, MongoClientOptions } from "mongodb";

const mongoUri =
	process.env.MONGODB_URI ??
	"mongodb+srv://sokchanear0:2NtjcG3hRPMTrYCz@cluster0.1nfjw.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0";

const databaseName = "chat_db";
const clientOptions: MongoClientOptions = {};

declare global {
	// eslint-disable-next-line no-var
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(mongoUri, clientOptions);

const clientPromise =
	globalThis._mongoClientPromise ??
	client.connect().then((connectedClient) => connectedClient);

if (process.env.NODE_ENV !== "production") {
	globalThis._mongoClientPromise = clientPromise;
}

export async function getDatabase(): Promise<Db> {
	const connectedClient = await clientPromise;
	return connectedClient.db(databaseName);
}

export { databaseName, mongoUri };
