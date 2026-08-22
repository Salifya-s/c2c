import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

import type {AuthStoreState, AuthUserRecord} from './types';

const AUTH_STORE_PATH = path.join(process.cwd(), '.data', 'auth-store.json');

const emptyStore: AuthStoreState = {
  users: [],
  otpChallenges: []
};

/**
 * Reads the local development auth store.
 *
 * Production swap:
 * replace this file with repository functions backed by PostgreSQL/Prisma,
 * Supabase, Firebase Auth, or another durable user database. Route handlers
 * should keep calling these functions instead of reading storage directly.
 */
export const readAuthStore = async (): Promise<AuthStoreState> => {
  try {
    const raw = await readFile(AUTH_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as AuthStoreState;
    return {
      users: parsed.users ?? [],
      otpChallenges: parsed.otpChallenges ?? []
    };
  } catch {
    return emptyStore;
  }
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
