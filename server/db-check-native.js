const { MongoClient } = require('mongodb');

async function run() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        console.log("Databases:", dbs.databases.map(db => db.name));

        const db = client.db("okuma-kosesi");
        const collections = await db.listCollections().toArray();
        console.log("Collections in okuma-kosesi:", collections.map(c => c.name));

        for (let coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`- ${coll.name}: ${count} docs`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
