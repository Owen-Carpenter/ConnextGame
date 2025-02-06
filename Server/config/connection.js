import { MongoClient, ServerApiVersion} from "mongodb";
import "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI;
if(!URI){
    console.log("URI not defined");
}

const client = new MongoClient(URI, {
    serverApi:{
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await client.connect();

    await client.db("admin").command({ping: 1});
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
} catch (err) {
    console.error(err);
}

let db = client.db("players");

export default db;