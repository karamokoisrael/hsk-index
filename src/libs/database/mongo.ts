import { MongoClient } from 'mongodb';

import { Env } from '../../utils/env';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

// Module-level cache for production (one instance per serverless warm instance)
let _prodClient: MongoClient | undefined;

function getClient(): MongoClient {
  const uri = Env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const options = { serverSelectionTimeoutMS: 5000 };

  if (process.env.NODE_ENV === 'development') {
    // Use global to survive HMR reloads in dev
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, options);
    }
    return global._mongoClient;
  }

  if (!_prodClient) {
    _prodClient = new MongoClient(uri, options);
  }
  return _prodClient;
}

export async function getDb() {
  const client = getClient();
  await client.connect();
  return client.db('hsk-index');
}
