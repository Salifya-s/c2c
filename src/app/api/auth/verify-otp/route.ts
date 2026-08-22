import {NextResponse} from 'next/server';

import {signSession, verifyOtpHash} from '@/src/features/commerce/server/auth/crypto';
import {jsonError, setSessionCookie} from '@/src/features/commerce/server/auth/responses';
import {findUserByContact, publicUser, readAuthStore, writeAuthStore} from '@/src/features/commerce/server/auth/store';
import type {AuthOtpPurpose} from '@/src/features/commerce/server/auth/types';

export const runtime = 'nodejs';

type VerifyOtpBody = {
  contact?: string;
  otp?: string;
  purpose?: AuthOtpPurpose;
};

export async function POST(request: Request) {
  const body = (await request.json()) as VerifyOtpBody;
  const contact = body.contact?.trim().toLowerCase() ?? '';

  if (!contact || !body.otp || !body.purpose) return jsonError('Enter the verification code.');

  const store = await readAuthStore();
  const user = findUserByContact(store, contact);
  if (!user) return jsonError('No account found for this verification request.', 404);

  const challenge = store.otpChallenges.find((item) => item.userId === user.id && item.purpose === body.purpose);
  if (!challenge) return jsonError('Request a new verification code.', 404);
  if (Date.now() > new Date(challenge.expiresAt).getTime()) return jsonError('The code expired. Request a new one.', 410);
  if (challenge.attempts >= 5) return jsonError('Too many attempts. Request a new code.', 429);

  if (!verifyOtpHash(body.otp, challenge.otpHash)) {
    await writeAuthStore({
      ...store,
      otpChallenges: store.otpChallenges.map((item) =>
        item.id === challenge.id ? {...item, attempts: item.attempts + 1} : item
      )
    });
    return jsonError('That code is not correct.', 401);
  }

  await writeAuthStore({
    ...store,
    otpChallenges: store.otpChallenges.filter((item) => item.id !== challenge.id)
  });

  const response = NextResponse.json({ok: true, user: publicUser(user)});
  setSessionCookie(response, signSession({userId: user.id, issuedAt: Date.now()}));
  return response;
}
