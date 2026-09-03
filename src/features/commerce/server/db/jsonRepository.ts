import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AuthContactType } from '../auth/types';
import type { CommerceUserRole, MerchantOnboardingAnswers } from '../../types/auth';

export type CustomerRecord = {
  id: string;
  role: 'customer';
  name: string;
  username: string;
  contact: string;
  contactType: AuthContactType;
  mobile?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MerchantRecord = {
  id: string;
  role: 'merchant';
  name: string;
  username: string;
  contact: string;
  contactType: AuthContactType;
  mobile?: string | null;
  email?: string | null;
  businessName?: string;
  merchantSetup?: MerchantOnboardingAnswers;
  createdAt: string;
  updatedAt: string;
};

/**
 * Two-tier store, split so that runtime writes never dirty the working tree.
 *
 * - `data/json/` is committed demo seed data, read only. `readAuthStore` syncs
 *   these records into the auth store and gives each the shared demo password,
 *   so a fresh clone has working accounts.
 * - `.data/` is gitignored and holds everything created at runtime. Accounts
 *   registered while developing land here.
 *
 * Reads merge both, with runtime records winning on id. Production swap: replace
 * this whole module with a database adapter; the `db` shape below already
 * mirrors the query surface an ORM would expose.
 */
const SEED_DIR = path.join(process.cwd(), 'data', 'json');
const RUNTIME_DIR = path.join(process.cwd(), '.data');

const CUSTOMERS_FILE = 'customers.json';
const MERCHANTS_FILE = 'merchants.json';

const readJsonArray = async <Record>(filePath: string): Promise<Record[]> => {
  try {
    const data = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as Record[]) : [];
  } catch {
    return [];
  }
};

/** Runtime records first, then any seed record not overridden by one. */
const readMerged = async <Record extends { id: string }>(fileName: string): Promise<Record[]> => {
  const [runtime, seed] = await Promise.all([
    readJsonArray<Record>(path.join(RUNTIME_DIR, fileName)),
    readJsonArray<Record>(path.join(SEED_DIR, fileName))
  ]);

  const seenIds = new Set(runtime.map((item) => item.id));
  return [...runtime, ...seed.filter((item) => !seenIds.has(item.id))];
};

const writeRuntime = async <Record>(fileName: string, records: Record[]): Promise<void> => {
  const filePath = path.join(RUNTIME_DIR, fileName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(records, null, 2), 'utf8');
};

/** Upsert into the runtime file only, leaving the committed seed untouched. */
const insertRuntime = async <Record extends { id: string }>(
  fileName: string,
  record: Record
): Promise<Record> => {
  const runtime = await readJsonArray<Record>(path.join(RUNTIME_DIR, fileName));
  const existingIndex = runtime.findIndex((item) => item.id === record.id);

  const updated = existingIndex >= 0 ? [...runtime] : [record, ...runtime];
  if (existingIndex >= 0) updated[existingIndex] = record;

  await writeRuntime(fileName, updated);
  return record;
};

export const readCustomerDb = async (): Promise<CustomerRecord[]> => readMerged<CustomerRecord>(CUSTOMERS_FILE);

export const readMerchantDb = async (): Promise<MerchantRecord[]> => readMerged<MerchantRecord>(MERCHANTS_FILE);

const findByContact = <Record extends { contact: string }>(records: Record[], contact: string) => {
  const target = contact.trim().toLowerCase();
  return records.find((item) => item.contact.trim().toLowerCase() === target);
};

/**
 * High-level Database Repository mirroring ORM/Database access pattern
 */
export const db = {
  customers: {
    async findAll(): Promise<CustomerRecord[]> {
      return readCustomerDb();
    },
    async findById(id: string): Promise<CustomerRecord | undefined> {
      return (await readCustomerDb()).find((item) => item.id === id);
    },
    async findByContact(contact: string): Promise<CustomerRecord | undefined> {
      return findByContact(await readCustomerDb(), contact);
    },
    async insert(record: Omit<CustomerRecord, 'role'>): Promise<CustomerRecord> {
      return insertRuntime<CustomerRecord>(CUSTOMERS_FILE, { ...record, role: 'customer' });
    }
  },
  merchants: {
    async findAll(): Promise<MerchantRecord[]> {
      return readMerchantDb();
    },
    async findById(id: string): Promise<MerchantRecord | undefined> {
      return (await readMerchantDb()).find((item) => item.id === id);
    },
    async findByContact(contact: string): Promise<MerchantRecord | undefined> {
      return findByContact(await readMerchantDb(), contact);
    },
    async insert(record: Omit<MerchantRecord, 'role'>): Promise<MerchantRecord> {
      return insertRuntime<MerchantRecord>(MERCHANTS_FILE, { ...record, role: 'merchant' });
    }
  }
};
