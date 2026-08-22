import {NextResponse} from 'next/server';

import {createId, createOtp, hashOtp, hashPassword, normaliseContact, resolveContactType} from '@/src/features/commerce/server/auth/crypto';
import {sendOtp} from '@/src/features/commerce/server/auth/otpDelivery';
import {jsonError} from '@/src/features/commerce/server/auth/responses';
import {findUserByContact, readAuthStore, upsertUser, writeAuthStore} from '@/src/features/commerce/server/auth/store';
import type {AuthUserRecord} from '@/src/features/commerce/server/auth/types';
import type {CommerceUserRole, MerchantOnboardingAnswers} from '@/src/features/commerce/types/auth';

export const runtime = 'nodejs';

type RegisterStartBody = {
  role?: CommerceUserRole;
  name?: string;
  contact?: string;
  password?: string;
  username?: string;
  businessName?: string;
  merchantSetup?: MerchantOnboardingAnswers;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterStartBody;
  const role = body.role;
  const contact = normaliseContact(body.contact ?? '');

  if (role !== 'customer' && role !== 'merchant') return jsonError('Choose customer or merchant.');
  if (!body.name?.trim()) return jsonError('Enter your name.');
  if (!contact) return jsonError('Enter your mobile number or email.');
  if (!body.password || body.password.length < 8) return jsonError('Use a password with at least 8 characters.');
  if (role === 'merchant' && !body.businessName?.trim()) return jsonError('Enter your store or service name.');

  const store = await readAuthStore();
  if (findUserByContact(store, contact)) return jsonError('An account with this mobile number or email already exists.', 409);

  const now = new Date().toISOString();
  const {hash, salt} = hashPassword(body.password);
  const user: AuthUserRecord = {
    id: createId('user'),
    role,
    name: body.name.trim(),
    username: body.username?.trim() || `@${contact.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
    contact,
    contactType: resolveContactType(contact),
    mobile: resolveContactType(contact) === 'mobile' ? contact : undefined,
    email: resolveContactType(contact) === 'email' ? contact : undefined,
    businessName: body.businessName?.trim(),
    merchantSetup: body.merchantSetup,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: now,
    updatedAt: now
  };

  const otp = createOtp();
  await sendOtp({contact, contactType: user.contactType, otp, purpose: 'register'});

  await writeAuthStore({
    ...upsertUser(store, user),
    otpChallenges: [
      {
        id: createId('otp'),
        userId: user.id,
        purpose: 'register',
        contact,
        contactType: user.contactType,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        attempts: 0,
        createdAt: now
      },
      ...store.otpChallenges.filter((challenge) => challenge.userId !== user.id)
    ]
  });

  return NextResponse.json({
    ok: true,
    challenge: {contact, contactType: user.contactType, purpose: 'register'},
    devOtp: process.env.NODE_ENV === 'production' ? undefined : otp
  });
}
