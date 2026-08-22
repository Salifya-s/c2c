import type {CommerceUserRole, MerchantOnboardingAnswers} from '../../types/auth';

export type AuthContactType = 'email' | 'mobile';
export type AuthOtpPurpose = 'register' | 'login';

export type AuthUserRecord = {
  id: string;
  role: CommerceUserRole;
  name: string;
  username: string;
  contact: string;
  contactType: AuthContactType;
  mobile?: string;
  email?: string;
  businessName?: string;
  merchantSetup?: MerchantOnboardingAnswers;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthOtpChallenge = {
  id: string;
  userId: string;
  purpose: AuthOtpPurpose;
  contact: string;
  contactType: AuthContactType;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
};

export type AuthStoreState = {
  users: AuthUserRecord[];
  otpChallenges: AuthOtpChallenge[];
};

export type PublicSession = {
  id: string;
  role: CommerceUserRole;
  name: string;
  username: string;
  contact: string;
  contactType: AuthContactType;
  mobile?: string;
  email?: string;
  businessName?: string;
  merchantSetup?: MerchantOnboardingAnswers;
  onboarded: boolean;
};
