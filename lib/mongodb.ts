// lib/mongodb.ts
import { MongoClient, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mahjong_game?retryWrites=true&w=majority';
let client: MongoClient;

export async function connectToDatabase() {
  
  try {
    client = new MongoClient(uri);
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export type { Collection };