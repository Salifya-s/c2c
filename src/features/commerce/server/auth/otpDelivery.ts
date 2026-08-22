import type {AuthContactType, AuthOtpPurpose} from './types';

type SendOtpInput = {
  contact: string;
  contactType: AuthContactType;
  otp: string;
  purpose: AuthOtpPurpose;
};

/**
 * Sends an OTP to a user.
 *
 * Production swap:
 * replace this development adapter with SMS/email providers such as Twilio,
 * Africa's Talking, SendGrid, Resend, or SES. Keep the same function signature
 * so auth route handlers do not need to change.
 */
export const sendOtp = async ({contact, contactType, otp, purpose}: SendOtpInput) => {
  console.info(`[auth:${purpose}] OTP ${otp} would be sent by ${contactType} to ${contact}`);
  return {ok: true};
};
