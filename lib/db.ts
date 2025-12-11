import fs from 'fs';
import path from 'path';
import { createClient } from '@vercel/kv';
import Redis from 'ioredis';

// INTERFACES
export interface User {
  email: string;
  app_password?: string;
  api_key?: string;
  refresh_token?: string;
  access_token?: string;
  expiry_date?: number;
}

interface Schema {
  users: User[];
}

const DB_PATH = path.join(process.cwd(), 'database.json');

// DETECTION
const HAS_KV_REST = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const HAS_REDIS_URL = !!process.env.REDIS_URL;
const IS_CLOUD = HAS_KV_REST || HAS_REDIS_URL;

// INITIALIZE CLIENTS
let kvClient: any = null;
let redisClient: any = null;

if (HAS_KV_REST) {
  try {
    kvClient = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!
    });
  } catch (e) { console.error("KV Init Error", e); }
} else if (HAS_REDIS_URL) {
  try {
    // 'family: 0' forces IPv4/IPv6 duality which helps in some cloud envs
    redisClient = new Redis(process.env.REDIS_URL!, { family: 0 });
  } catch (e) { console.error("Redis Init Error", e); }
}

// LOCAL HELPERS
function readLocalDb(): Schema {
  try {
    if (IS_CLOUD) return { users: [] };
    if (!fs.existsSync(DB_PATH)) return { users: [] };
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
}

function writeLocalDb(data: Schema) {
  if (IS_CLOUD) return;
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// HYBRID INTERFACE
export const db = {

  getUser: async (email?: string): Promise<User | undefined> => {
    // 0. Safety Check
    if (process.env.VERCEL && !IS_CLOUD) {
      console.error("CRITICAL: Running on Vercel but no Redis/KV found.");
      return undefined;
    }

    // 1. CLOUD MODE
    if (IS_CLOUD) {
      try {
        let users: User[] = [];

        // Strategy A: Vercel KV (Rest) -> Returns Object
        if (kvClient) {
          users = await kvClient.get('users') || [];
        }
        // Strategy B: Generic Redis (TCP) -> Returns String
        else if (redisClient) {
          const raw = await redisClient.get('users');
          users = raw ? JSON.parse(raw) : [];
        }

        if (email) return users.find(u => u.email === email);
        return users[0];
      } catch (err) {
        console.error("Cloud DB Get Error:", err);
        return undefined;
      }
    }

    // 2. LOCAL MODE
    const data = readLocalDb();
    if (email) return data.users.find(u => u.email === email);
    return data.users[0];
  },

  saveUser: async (user: User) => {
    // 0. Safety Check
    if (process.env.VERCEL && !IS_CLOUD) {
      const debugInfo = [`KV_REST:${HAS_KV_REST}`, `REDIS_URL:${HAS_REDIS_URL}`].join('|');
      throw new Error(`Cloud DB Connect Failed. Debug: ${debugInfo}`);
    }

    // 1. CLOUD MODE
    if (IS_CLOUD) {
      try {
        let users: User[] = [];

        // Fetch current state
        if (kvClient) {
          users = await kvClient.get('users') || [];
        } else if (redisClient) {
          const raw = await redisClient.get('users');
          users = raw ? JSON.parse(raw) : [];
        }

        // Update logic
        const index = users.findIndex(u => u.email === user.email);
        if (index >= 0) {
          users[index] = { ...users[index], ...user };
        } else {
          users.push(user);
        }

        // Save state
        if (kvClient) {
          await kvClient.set('users', users);
        } else if (redisClient) {
          await redisClient.set('users', JSON.stringify(users));
        }
        return;

      } catch (err: any) {
        console.error("Cloud Save Error:", err);
        throw new Error(`DB Write Failed: ${err.message}`);
      }
    }

    // 2. LOCAL MODE
    const data = readLocalDb();
    const index = data.users.findIndex(u => u.email === user.email);
    if (index >= 0) {
      data.users[index] = { ...data.users[index], ...user };
    } else {
      data.users.push(user);
    }
    writeLocalDb(data);
  }
};

export default db;
