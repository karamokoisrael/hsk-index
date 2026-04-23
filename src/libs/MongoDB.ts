import { MongoClient } from 'mongodb';

import { Env } from './Env';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

function getClient(): MongoClient {
  const uri = Env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
    }
    return global._mongoClient;
  }

  return new MongoClient(uri);
}

export async function getDb() {
  const client = getClient();
  await client.connect();
  return client.db('hsk-index');
}
