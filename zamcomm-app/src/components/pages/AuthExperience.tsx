'use client';

import type {ChangeEvent, FormEvent} from 'react';
import {useMemo, useState} from 'react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';

import {AuthFormFields, type AuthFieldConfig} from '@/src/components/auth/AuthFormFields';
import {Card} from '@/src/components/ui/Card';
import {uiIcons} from '@/lib/iconography';

type AuthRole = 'customer' | 'vendor';
type AuthMode = 'login' | 'signup';
type FormState = Record<string, string>;

const authFields: Record<AuthRole, Record<AuthMode, AuthFieldConfig[]>> = {
  customer: {
    login: [
      {name: 'phoneOrEmail', labelKey: 'phoneOrEmail', placeholderKey: 'phoneOrEmail', type: 'text'},
      {name: 'password', labelKey: 'password', placeholderKey: 'password', type: 'password'}
    ],
    signup: [
      {name: 'fullName', labelKey: 'fullName', placeholderKey: 'fullName', type: 'text'},
      {name: 'phoneOrEmail', labelKey: 'phoneOrEmail', placeholderKey: 'phoneOrEmail', type: 'text'},
      {name: 'password', labelKey: 'password', placeholderKey: 'password', type: 'password'}
    ]
  },
  vendor: {
    login: [
      {name: 'phoneOrEmail', labelKey: 'phoneOrEmail', placeholderKey: 'phoneOrEmail', type: 'text'},
      {name: 'password', labelKey: 'password', placeholderKey: 'password', type: 'password'}
    ],
    signup: [
      {name: 'businessName', labelKey: 'businessName', placeholderKey: 'businessName', type: 'text'},
      {name: 'ownerName', labelKey: 'ownerName', placeholderKey: 'ownerName', type: 'text'},
      {name: 'phoneOrEmail', labelKey: 'phoneOrEmail', placeholderKey: 'phoneOrEmail', type: 'text'},
      {name: 'businessCategory', labelKey: 'businessCategory', placeholderKey: 'businessCategory', type: 'text'},
      {name: 'password', labelKey: 'password', placeholderKey: 'password', type: 'password'}
    ]
  }
};

const roleHighlightKeys: Record<AuthRole, string[]> = {
  customer: ['savedAddresses', 'fastCheckout', 'escrowOrders'],
  vendor: ['storefront', 'quickReplies', 'checkout']
};

const roleOptions: AuthRole[] = ['customer', 'vendor'];
const modeOptions: AuthMode[] = ['login', 'signup'];

const CustomerIcon = uiIcons.customer;
const VendorIcon = uiIcons.seller;
const ShieldIcon = uiIcons.shield;
const BackIcon = uiIcons.back;

const createInitialState = (fields: AuthFieldConfig[]): FormState =>
  fields.reduce<FormState>((state, field) => {
    state[field.name] = '';
    return state;
  }, {});

const resolveSubmitKey = (role: AuthRole, mode: AuthMode) => {
  if (role === 'customer' && mode === 'login') return 'loginCustomer';
  if (role === 'customer' && mode === 'signup') return 'signupCustomer';
  if (role === 'vendor' && mode === 'login') return 'loginVendor';
  return 'signupVendor';
};

const resolveSuccessKey = (role: AuthRole, mode: AuthMode) => {
  if (role === 'customer' && mode === 'login') return 'customerLogin';
  if (role === 'customer' && mode === 'signup') return 'customerSignup';
  if (role === 'vendor' && mode === 'login') return 'vendorLogin';
  return 'vendorSignup';
};

type AuthExperienceProps = {
  initialRole?: AuthRole;
};

export const AuthExperience = ({ initialRole = 'customer' }: AuthExperienceProps) => {
  const t = useTranslations('auth');
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [mode, setMode] = useState<AuthMode>('login');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const fields = useMemo(() => authFields[role][mode], [role, mode]);
  const [formState, setFormState] = useState<FormState>(() => createInitialState(authFields[initialRole].login));
  const roleIconMap = {
    customer: CustomerIcon,
    vendor: VendorIcon
  } satisfies Record<AuthRole, typeof CustomerIcon>;
  const RoleIcon = roleIconMap[role];

  const handleRoleChange = (nextRole: AuthRole) => {
    setRole(nextRole);
    setMode('login');
    setFormState(createInitialState(authFields[nextRole].login));
    setSubmittedMessage('');
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormState(createInitialState(authFields[role][nextMode]));
    setSubmittedMessage('');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target;
    setFormState((previous: FormState) => ({...previous, [name]: value}));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedMessage(t(`success.${resolveSuccessKey(role, mode)}`));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f1e4_0%,#faf7f2_40%,#f0ebe0_100%)] px-4 py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-ink-5 bg-white shadow-[0_24px_80px_rgba(26,20,16,0.12)]">
        <div className="grid min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden bg-zam-green-900 px-6 py-8 text-white lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,186,114,0.28),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(232,156,31,0.24),transparent_40%)]" />
            <div className="relative z-[1]">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zam-green-100">
                <BackIcon size={14} />
                <span>{t('hero.backToApp')}</span>
              </Link>

              <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-zam-green-100">
                <ShieldIcon size={15} />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.02]">
                {t('hero.title')}
              </h1>
              <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-zam-green-100/90">
                {t('hero.description')}
              </p>

              <div className="mt-10 grid gap-4">
                {roleHighlightKeys[role].map((highlightKey) => (
                  <div
                    key={highlightKey}
                    className="rounded-3xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-zam-amber-200">
                        <RoleIcon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{t(`highlights.${role}.${highlightKey}`)}</div>
                        <div className="text-xs text-zam-green-100/75">{t('highlights.supportingCopy')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#fffdfa] px-6 py-8 lg:px-10 lg:py-10">
            <div className="max-w-md">
              <div className="font-display text-2xl font-bold text-ink">{t('title')}</div>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">{t('subtitle')}</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {roleOptions.map((option) => {
                  const Icon = option === 'customer' ? CustomerIcon : VendorIcon;
                  const isActive = role === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        isActive
                          ? 'border-zam-green-400 bg-zam-green-50'
                          : 'border-ink-5 bg-white hover:border-zam-green-200 hover:bg-zam-green-50'
                      }`}
                      onClick={() => handleRoleChange(option)}
                    >
                      <div className="flex items-center gap-2 text-zam-green-800">
                        <Icon size={16} />
                        <span className="text-sm font-bold text-ink">{t(`roles.${option}.label`)}</span>
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-ink-4">{t(`roles.${option}.helper`)}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 inline-flex rounded-full border border-ink-5 bg-white p-1">
                {modeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      mode === option ? 'bg-zam-green-800 text-white' : 'text-ink-3'
                    }`}
                    onClick={() => handleModeChange(option)}
                  >
                    {t(`modes.${option}`)}
                  </button>
                ))}
              </div>

              <form className="mt-6" onSubmit={handleSubmit}>
                <AuthFormFields fields={fields} formState={formState} onChange={handleInputChange} />

                <button
                  type="submit"
                  className="mt-6 w-full rounded-2xl bg-zam-green-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-zam-green-700"
                >
                  {t(`submit.${resolveSubmitKey(role, mode)}`)}
                </button>
              </form>

              {submittedMessage ? (
                <div className="mt-4 rounded-3xl border border-zam-green-200 bg-zam-green-50 p-4 text-sm leading-relaxed text-zam-green-800">
                  {submittedMessage}
                </div>
              ) : null}

              <Card className="mt-6 rounded-3xl p-4">
                <div className="text-[0.76rem] font-bold uppercase tracking-[0.08em] text-ink-4">
                  {t('notes.label')}
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-ink-3">
                  <li>{t('notes.frontendOnly')}</li>
                  <li>{t('notes.configDriven')}</li>
                  <li>{t('notes.visualSystem')}</li>
                </ul>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
