import {createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual} from 'node:crypto';

const PASSWORD_KEY_LENGTH = 64;
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? 'dev-only-change-before-production';

export const createId = (prefix: string) => `${prefix}_${randomBytes(12).toString('hex')}`;

export const normaliseContact = (contact: string) => contact.trim().toLowerCase();

export const resolveContactType = (contact: string) => (contact.includes('@') ? 'email' : 'mobile');

/**
 * Hashes user passwords with scrypt and a per-user salt.
 *
 * Production note:
 * scrypt is acceptable for this prototype backend. If adopting a managed auth
 * provider, this function will move behind that provider's password APIs.
 */
export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex');
  return {hash, salt};
};

export const verifyPassword = (password: string, hash: string, salt: string) => {
  const candidate = Buffer.from(scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex'), 'hex');
  const stored = Buffer.from(hash, 'hex');
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
};

export const createOtp = () => String(randomInt(100000, 999999));

export const hashOtp = (otp: string) =>
  createHmac('sha256', SESSION_SECRET).update(otp).digest('hex');

export const verifyOtpHash = (otp: string, hash: string) => {
  const candidate = Buffer.from(hashOtp(otp), 'hex');
  const stored = Buffer.from(hash, 'hex');
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
};

export const signSession = (payload: {userId: string; issuedAt: number}) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
};

export const verifySessionToken = (token?: string) => {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const candidate = Buffer.from(signature);
  const stored = Buffer.from(expected);
  if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) return null;

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {userId: string; issuedAt: number};
  } catch {
    return null;
  }
};
