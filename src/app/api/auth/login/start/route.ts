import {NextResponse} from 'next/server';

import {createId, createOtp, hashOtp, normaliseContact, verifyPassword} from '@/src/features/commerce/server/auth/crypto';
import {sendOtp} from '@/src/features/commerce/server/auth/otpDelivery';
import {jsonError} from '@/src/features/commerce/server/auth/responses';
import {findUserByContact, readAuthStore, writeAuthStore} from '@/src/features/commerce/server/auth/store';

export const runtime = 'nodejs';

type LoginStartBody = {
  contact?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginStartBody;
  const contact = normaliseContact(body.contact ?? '');

  if (!contact) return jsonError('Enter your mobile number or email.');
  if (!body.password) return jsonError('Enter your password.');

  const store = await readAuthStore();
  const user = findUserByContact(store, contact);
  if (!user || !verifyPassword(body.password, user.passwordHash, user.passwordSalt)) {
    return jsonError('The login details do not match an account.', 401);
  }

  const otp = createOtp();
  await sendOtp({contact: user.contact, contactType: user.contactType, otp, purpose: 'login'});

  await writeAuthStore({
    ...store,
    otpChallenges: [
      {
        id: createId('otp'),
        userId: user.id,
        purpose: 'login',
        contact: user.contact,
        contactType: user.contactType,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        attempts: 0,
        createdAt: new Date().toISOString()
      },
      ...store.otpChallenges.filter((challenge) => challenge.userId !== user.id)
    ]
  });

  return NextResponse.json({
    ok: true,
    challenge: {contact: user.contact, contactType: user.contactType, purpose: 'login'},
    devOtp: process.env.NODE_ENV === 'production' ? undefined : otp
  });
}
