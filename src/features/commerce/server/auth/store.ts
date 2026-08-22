import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

import { hashPassword } from './crypto';
import type { AuthStoreState, AuthUserRecord } from './types';
import { db } from '../db/jsonRepository';

const AUTH_STORE_PATH = path.join(process.cwd(), '.data', 'auth-store.json');

const DEFAULT_MOCK_PASSWORD = 'password123';
const mockPasswordCreds = hashPassword(DEFAULT_MOCK_PASSWORD);

export const readAuthStore = async (): Promise<AuthStoreState> => {
  let store: AuthStoreState = { users: [], otpChallenges: [] };
  try {
    const raw = await readFile(AUTH_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as AuthStoreState;
    store = {
      users: parsed.users ?? [],
      otpChallenges: parsed.otpChallenges ?? []
    };
  } catch {
    store = { users: [], otpChallenges: [] };
  }

  // Sync users from JSON database (customers.json & merchants.json)
  const customers = await db.customers.findAll();
  const merchants = await db.merchants.findAll();

  let modified = false;
  const existingUserMap = new Map(store.users.map((u) => [u.id, u]));

  for (const c of customers) {
    if (!existingUserMap.has(c.id)) {
      const userRecord: AuthUserRecord = {
        id: c.id,
        role: 'customer',
        name: c.name,
        username: c.username,
        contact: c.contact,
        contactType: c.contactType,
        mobile: c.mobile ?? undefined,
        email: c.email ?? undefined,
        passwordHash: mockPasswordCreds.hash,
        passwordSalt: mockPasswordCreds.salt,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      };
      existingUserMap.set(c.id, userRecord);
      modified = true;
    }
  }

  for (const m of merchants) {
    if (!existingUserMap.has(m.id)) {
      const userRecord: AuthUserRecord = {
        id: m.id,
        role: 'merchant',
        name: m.name,
        username: m.username,
        contact: m.contact,
        contactType: m.contactType,
        mobile: m.mobile ?? undefined,
        email: m.email ?? undefined,
        businessName: m.businessName,
        merchantSetup: m.merchantSetup,
        passwordHash: mockPasswordCreds.hash,
        passwordSalt: mockPasswordCreds.salt,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      };
      existingUserMap.set(m.id, userRecord);
      modified = true;
    }
  }

  if (modified) {
    store = { ...store, users: Array.from(existingUserMap.values()) };
    await writeAuthStore(store);
  }

  return store;
};

export const writeAuthStore = async (store: AuthStoreState) => {
  await mkdir(path.dirname(AUTH_STORE_PATH), {recursive: true});
  await writeFile(AUTH_STORE_PATH, JSON.stringify(store, null, 2));
};

export const findUserByContact = (store: AuthStoreState, contact: string) =>
  store.users.find((user) => user.contact.toLowerCase() === contact.toLowerCase());

export const findUserById = (store: AuthStoreState, userId: string) =>
  store.users.find((user) => user.id === userId);

export const upsertUser = (store: AuthStoreState, user: AuthUserRecord): AuthStoreState => ({
  ...store,
  users: [user, ...store.users.filter((item) => item.id !== user.id)]
});

export const publicUser = (user: AuthUserRecord) => ({
  id: user.id,
  role: user.role,
  name: user.name,
  username: user.username,
  contact: user.contact,
  contactType: user.contactType,
  mobile: user.mobile,
  email: user.email,
  businessName: user.businessName,
  merchantSetup: user.merchantSetup,
  onboarded: Boolean(user.merchantSetup || user.role === 'customer')
});
