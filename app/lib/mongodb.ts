import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loans';
if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('✅ MongoDB already connected.');
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully.');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
