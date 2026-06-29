import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const checkDb = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/okuma-kosesi';
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);
        if (!mongoose.connection.db) {
          throw new Error("Database connection failed");
        }
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Available Collections:', collections.map(c => c.name).join(', ') || 'None (Empty DB)');

        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`📊 Collection [${coll.name}]: ${count} documents`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkDb();
