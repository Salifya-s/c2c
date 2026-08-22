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

const CUSTOMERS_JSON_PATH = path.join(process.cwd(), 'data', 'json', 'customers.json');
const MERCHANTS_JSON_PATH = path.join(process.cwd(), 'data', 'json', 'merchants.json');

const ensureDirectoryExists = async (filePath: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

// Customer Database Operations
export const readCustomerDb = async (): Promise<CustomerRecord[]> => {
  try {
    const data = await readFile(CUSTOMERS_JSON_PATH, 'utf8');
    return JSON.parse(data) as CustomerRecord[];
  } catch {
    return [];
  }
};

export const writeCustomerDb = async (records: CustomerRecord[]): Promise<void> => {
  await ensureDirectoryExists(CUSTOMERS_JSON_PATH);
  await writeFile(CUSTOMERS_JSON_PATH, JSON.stringify(records, null, 2), 'utf8');
};

// Merchant Database Operations
export const readMerchantDb = async (): Promise<MerchantRecord[]> => {
  try {
    const data = await readFile(MERCHANTS_JSON_PATH, 'utf8');
    return JSON.parse(data) as MerchantRecord[];
  } catch {
    return [];
  }
};

export const writeMerchantDb = async (records: MerchantRecord[]): Promise<void> => {
  await ensureDirectoryExists(MERCHANTS_JSON_PATH);
  await writeFile(MERCHANTS_JSON_PATH, JSON.stringify(records, null, 2), 'utf8');
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
      const records = await readCustomerDb();
      return records.find((item) => item.id === id);
    },
    async findByContact(contact: string): Promise<CustomerRecord | undefined> {
      const records = await readCustomerDb();
      const target = contact.trim().toLowerCase();
      return records.find((item) => item.contact.trim().toLowerCase() === target);
    },
    async insert(record: Omit<CustomerRecord, 'role'>): Promise<CustomerRecord> {
      const records = await readCustomerDb();
      const newRecord: CustomerRecord = {
        ...record,
        role: 'customer'
      };
      // Prevent duplicate insert if ID exists, update instead
      const existingIndex = records.findIndex((item) => item.id === record.id);
      let updatedRecords: CustomerRecord[];
      if (existingIndex >= 0) {
        updatedRecords = [...records];
        updatedRecords[existingIndex] = newRecord;
      } else {
        updatedRecords = [newRecord, ...records];
      }
      await writeCustomerDb(updatedRecords);
      return newRecord;
    }
  },
  merchants: {
    async findAll(): Promise<MerchantRecord[]> {
      return readMerchantDb();
    },
    async findById(id: string): Promise<MerchantRecord | undefined> {
      const records = await readMerchantDb();
      return records.find((item) => item.id === id);
    },
    async findByContact(contact: string): Promise<MerchantRecord | undefined> {
      const records = await readMerchantDb();
      const target = contact.trim().toLowerCase();
      return records.find((item) => item.contact.trim().toLowerCase() === target);
    },
    async insert(record: Omit<MerchantRecord, 'role'>): Promise<MerchantRecord> {
      const records = await readMerchantDb();
      const newRecord: MerchantRecord = {
        ...record,
        role: 'merchant'
      };
      const existingIndex = records.findIndex((item) => item.id === record.id);
      let updatedRecords: MerchantRecord[];
      if (existingIndex >= 0) {
        updatedRecords = [...records];
        updatedRecords[existingIndex] = newRecord;
      } else {
        updatedRecords = [newRecord, ...records];
      }
      await writeMerchantDb(updatedRecords);
      return newRecord;
    }
  }
};
