export type CommerceUserRole = 'customer' | 'merchant';

export type MerchantOnboardingAnswers = {
  ownerName: string;
  mobile: string;
  businessName: string;
  category: string;
  shortDescription: string;
  mainOffer: string;
  startingPrice: string;
  location: string;
  serviceArea: string;
  openHours: string;
  fulfilment: string[];
  payments: string[];
  trust: string[];
  tone: string;
};

export type CommerceSession = {
  id?: string;
  role: CommerceUserRole;
  name: string;
  username: string;
  contact?: string;
  contactType?: 'email' | 'mobile';
  mobile: string;
  email?: string;
  businessName?: string;
  onboarded: boolean;
  merchantSetup?: MerchantOnboardingAnswers;
};
