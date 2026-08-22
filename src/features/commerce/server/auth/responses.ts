import {NextResponse} from 'next/server';

export const AUTH_COOKIE_NAME = 'zamcomm_session';

export const jsonError = (message: string, status = 400) => NextResponse.json({ok: false, message}, {status});

export const setSessionCookie = (response: NextResponse, token: string) => {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
};
