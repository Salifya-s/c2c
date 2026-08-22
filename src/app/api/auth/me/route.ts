import {NextRequest} from 'next/server';

import {verifySessionToken} from '@/src/features/commerce/server/auth/crypto';
import {AUTH_COOKIE_NAME, jsonError} from '@/src/features/commerce/server/auth/responses';
import {findUserById, publicUser, readAuthStore} from '@/src/features/commerce/server/auth/store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (!session) return jsonError('Not signed in.', 401);

  const store = await readAuthStore();
  const user = findUserById(store, session.userId);
  if (!user) return jsonError('Not signed in.', 401);

  return Response.json({ok: true, user: publicUser(user)});
}
