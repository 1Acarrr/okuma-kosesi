import mongoose from 'mongoose';

export const initializeDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/okuma-kosesi';
    const dbName = 'okuma-kosesi';

    console.log(`🔍 Attempting to connect to MongoDB [DB: ${dbName}]...`);

    await mongoose.connect(mongoUri, {
      dbName: dbName
    });

    console.log('✅ MongoDB connected successfully');

    // List collections to verify we are in the right place
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available Collections:', collections.map(c => c.name).join(', ') || 'None (Empty DB)');

    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`📊 Collection [${coll.name}]: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getDatabase = () => mongoose.connection;
