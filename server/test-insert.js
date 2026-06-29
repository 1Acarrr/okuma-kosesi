const { MongoClient } = require('mongodb');

async function run() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("okuma-kosesi");
        const testColl = db.collection("antigravity_test");

        console.log("Inserting a test document...");
        const result = await testColl.insertOne({
            message: "Testing connection from Antigravity",
            timestamp: new Date()
        });

        console.log(`Document inserted with _id: ${result.insertedId}`);

        const count = await testColl.countDocuments();
        console.log(`Current count in antigravity_test: ${count}`);

    } catch (err) {
        console.error("FAILED to insert:", err);
    } finally {
        await client.close();
    }
}

run();
