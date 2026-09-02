'use client';

import type {Dispatch, FormEvent, ReactNode, SetStateAction} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiUser
} from 'react-icons/fi';

import {
  fulfilmentOptions,
  launchChecklist,
  merchantCategoryOptions,
  merchantToneOptions,
  paymentOptions,
  trustOptions
} from '../data/merchantOnboarding';
import type {CommerceSession, CommerceUserRole, MerchantOnboardingAnswers} from '../types/auth';

export type {CommerceSession, CommerceUserRole, MerchantOnboardingAnswers};

type AuthFlowProps = {
  initialRole: CommerceUserRole;
  title: string;
  description: string;
  onComplete: (session: CommerceSession) => void;
  alternateAction?: ReactNode;
  presentation?: 'full' | 'embedded';
};

type AuthMode = 'login' | 'register';
type PasswordFormState = {
  name: string;
  username: string;
  contact: string;
  password: string;
  businessName: string;
};

type AuthStartPayload = {
  role: CommerceUserRole;
  mode: AuthMode;
  name?: string;
  username?: string;
  contact: string;
  password: string;
  businessName?: string;
  merchantSetup?: MerchantOnboardingAnswers;
};

type RoleContent = {
  label: string;
  icon: typeof FiUser;
  defaultName: string;
  defaultUsername: string;
  defaultContact: string;
  defaultPassword: string;
  defaultBusiness?: string;
  bullets: string[];
};

const roleContent: Record<CommerceUserRole, RoleContent> = {
  customer: {
    label: 'Customer',
    icon: FiUser,
    defaultName: 'Naledi Mwansa',
    defaultUsername: '@naledi.m',
    defaultContact: 'naledi@example.com',
    defaultPassword: 'customer123',
    bullets: ['Protected checkout', 'Saved carts by merchant', 'Order tracking from one place']
  },
  merchant: {
    label: 'Merchant',
    icon: FiBriefcase,
    defaultName: 'Tasha Mwila',
    defaultUsername: '@tashabakes',
    defaultContact: '+260966000014',
    defaultPassword: 'merchant123',
    defaultBusiness: "Tasha's Cakes",
    bullets: ['Guided store setup', 'Order fulfilment dashboard', 'Customer support tools']
  }
};

export const AuthFlow = ({
  initialRole,
  title,
  description,
  onComplete,
  alternateAction,
  presentation = 'full'
}: AuthFlowProps) => {
  const [role, setRole] = useState<CommerceUserRole>(initialRole);
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState(() => buildDefaultForm(initialRole));
  const [merchantAnswers, setMerchantAnswers] = useState<MerchantOnboardingAnswers>(() => buildDefaultMerchantAnswers());
  const [merchantPassword, setMerchantPassword] = useState(roleContent.merchant.defaultPassword);
  const [pendingChallenge, setPendingChallenge] = useState<{contact: string; purpose: AuthMode} | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const content = roleContent[role];
  const RoleIcon = content.icon;

  const actionLabel = useMemo(() => {
    if (mode === 'login') return role === 'customer' ? 'Send customer login code' : 'Send merchant login code';
    return role === 'customer' ? 'Create customer account' : 'Create merchant account';
  }, [mode, role]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.user) onComplete(toCommerceSession(payload.user));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  const resetMessages = () => {
    setPendingChallenge(null);
    setOtpCode('');
    setStatusMessage('');
    setDevOtp('');
  };

  const updateRole = (nextRole: CommerceUserRole) => {
    setRole(nextRole);
    setForm(buildDefaultForm(nextRole));
    setMerchantAnswers(buildDefaultMerchantAnswers());
    setMerchantPassword(roleContent.merchant.defaultPassword);
    setMode('login');
    resetMessages();
  };

  const startAuth = async (payload: AuthStartPayload) => {
    setSubmitting(true);
    setStatusMessage('');
    setDevOtp('');
    try {
      const response = await fetch(`/api/auth/${payload.mode}/start`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        setStatusMessage(result.message ?? 'Something went wrong.');
        return;
      }
      setPendingChallenge({contact: result.challenge.contact, purpose: result.challenge.purpose});
      setDevOtp(result.devOtp ?? '');
      setStatusMessage(`We sent a 6-digit code to ${result.challenge.contact}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await startAuth({
      role,
      mode,
      name: form.name,
      username: form.username,
      contact: form.contact,
      password: form.password,
      businessName: form.businessName
    });
  };

  const verifyOtp = async () => {
    if (!pendingChallenge) return;
    setSubmitting(true);
    setStatusMessage('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...pendingChallenge, otp: otpCode})
      });
      const result = await response.json();
      if (!response.ok) {
        setStatusMessage(result.message ?? 'The verification code did not work.');
        return;
      }
      onComplete(toCommerceSession(result.user));
    } finally {
      setSubmitting(false);
    }
  };

  const authPanel = (
      <section
        className={`mx-auto grid w-full overflow-hidden bg-white shadow-sm lg:grid-cols-[0.92fr_1.08fr] ${
          presentation === 'embedded'
            ? 'rounded-[28px] border border-ink-5'
            : 'min-h-[calc(100vh-2rem)] max-w-6xl rounded-[32px]'
        }`}
      >
        <aside className="relative overflow-hidden bg-neutral-950 p-6 text-white lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.32),transparent_34%),radial-gradient(circle_at_90%_85%,rgba(245,158,11,0.25),transparent_36%)]" />
          <div className="relative z-[1] flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-black text-emerald-100">
              <FiShield />
              Password + OTP security
            </div>
            <div className="mt-10">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-200">ZamComm</p>
              <h1 className="mt-2 text-4xl font-black leading-tight lg:text-6xl">{title}</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-neutral-300">{description}</p>
            </div>
            <div className="mt-10 grid gap-3">
              {content.bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <FiCheckCircle className="shrink-0 text-emerald-200" />
                  <span className="text-sm font-bold">{bullet}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-10">{alternateAction}</div>
          </div>
        </aside>

        <section className="p-5 lg:p-10">
          <div className="flex flex-wrap gap-2">
            {(['customer', 'merchant'] as CommerceUserRole[]).map((option) => {
              const OptionIcon = roleContent[option].icon;
              const isActive = role === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateRole(option)}
                  className={`flex min-h-12 items-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
                    isActive ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <OptionIcon />
                  {roleContent[option].label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 inline-flex rounded-full bg-neutral-100 p-1">
            {(['login', 'register'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  resetMessages();
                }}
                className={`rounded-full px-4 py-2 text-sm font-black capitalize transition ${
                  mode === option ? 'bg-white shadow-sm' : 'text-neutral-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {pendingChallenge ? (
            <OtpStep
              contact={pendingChallenge.contact}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              statusMessage={statusMessage}
              devOtp={devOtp}
              submitting={submitting}
              onBack={() => setPendingChallenge(null)}
              onVerify={verifyOtp}
            />
          ) : role === 'merchant' && mode === 'register' ? (
            <MerchantOnboardingWizard
              answers={merchantAnswers}
              setAnswers={setMerchantAnswers}
              password={merchantPassword}
              setPassword={setMerchantPassword}
              statusMessage={statusMessage}
              submitting={submitting}
              onComplete={() =>
                startAuth({
                  role: 'merchant',
                  mode: 'register',
                  name: merchantAnswers.ownerName,
                  username: `@${slugify(merchantAnswers.businessName)}`,
                  contact: merchantAnswers.mobile,
                  password: merchantPassword,
                  businessName: merchantAnswers.businessName,
                  merchantSetup: merchantAnswers
                })
              }
            />
          ) : (
            <PasswordStep
              role={role}
              mode={mode}
              form={form}
              setForm={setForm}
              statusMessage={statusMessage}
              submitting={submitting}
              RoleIcon={RoleIcon}
              title={`${content.label} ${mode}`}
              actionLabel={actionLabel}
              onSubmit={handlePasswordSubmit}
            />
          )}
        </section>
      </section>
  );

  if (presentation === 'embedded') return authPanel;

  return <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950">{authPanel}</main>;
};

const PasswordStep = ({
  role,
  mode,
  form,
  setForm,
  statusMessage,
  submitting,
  RoleIcon,
  title,
  actionLabel,
  onSubmit
}: {
  role: CommerceUserRole;
  mode: AuthMode;
  form: PasswordFormState;
  setForm: Dispatch<SetStateAction<PasswordFormState>>;
  statusMessage: string;
  submitting: boolean;
  RoleIcon: typeof FiUser;
  title: string;
  actionLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <form className="mt-8 space-y-4" onSubmit={onSubmit}>
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
        <RoleIcon size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-black capitalize">{title}</h2>
        <p className="text-sm text-neutral-500">Enter your password, then confirm the one-time code sent to you.</p>
      </div>
    </div>

    {mode === 'register' ? (
      <>
        <TextInput label="Full name" value={form.name} onChange={(value) => setForm((current) => ({...current, name: value}))} />
        <TextInput label="Username" value={form.username} onChange={(value) => setForm((current) => ({...current, username: value}))} />
      </>
    ) : null}
    <TextInput label="Mobile number or email" value={form.contact} onChange={(value) => setForm((current) => ({...current, contact: value}))} />
    <TextInput label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({...current, password: value}))} />
    {role === 'merchant' && mode === 'register' ? (
      <TextInput label="Business name" value={form.businessName} onChange={(value) => setForm((current) => ({...current, businessName: value}))} />
    ) : null}
    {statusMessage ? <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{statusMessage}</div> : null}
    <button type="submit" disabled={submitting} className="min-h-13 w-full rounded-2xl bg-amber-500 px-5 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70">
      {submitting ? 'Working...' : actionLabel}
    </button>
  </form>
);

const OtpStep = ({
  contact,
  otpCode,
  setOtpCode,
  statusMessage,
  devOtp,
  submitting,
  onBack,
  onVerify
}: {
  contact: string;
  otpCode: string;
  setOtpCode: (value: string) => void;
  statusMessage: string;
  devOtp: string;
  submitting: boolean;
  onBack: () => void;
  onVerify: () => void;
}) => (
  <section className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
        <FiKey size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-black">Enter verification code</h2>
        <p className="text-sm text-neutral-500">We sent a 6-digit code to {contact}.</p>
      </div>
    </div>
    <TextInput label="One-time code" inputMode="numeric" value={otpCode} onChange={setOtpCode} />
    {devOtp ? (
      <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
        Development OTP: {devOtp}
      </div>
    ) : null}
    {statusMessage ? <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{statusMessage}</div> : null}
    <div className="mt-5 grid grid-cols-2 gap-2">
      <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 font-black">
        <FiArrowLeft />
        Back
      </button>
      <button type="button" onClick={onVerify} disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 font-black text-white disabled:cursor-wait disabled:opacity-70">
        Verify
        <FiArrowRight />
      </button>
    </div>
  </section>
);

const buildDefaultForm = (role: CommerceUserRole): PasswordFormState => ({
  name: roleContent[role].defaultName,
  username: roleContent[role].defaultUsername,
  contact: roleContent[role].defaultContact,
  password: roleContent[role].defaultPassword,
  businessName: roleContent[role].defaultBusiness ?? ''
});

const buildDefaultMerchantAnswers = (): MerchantOnboardingAnswers => ({
  ownerName: 'Tasha Mwila',
  mobile: '+260966000014',
  businessName: "Tasha's Cakes",
  category: 'Bakery and cakes',
  shortDescription: 'Fresh cakes, cupcakes, and party bakes made to order in Lusaka.',
  mainOffer: 'Chocolate birthday cake',
  startingPrice: '450',
  location: 'Roma, Lusaka',
  serviceArea: 'Roma, Manda Hill, Kabulonga, Arcades',
  openHours: 'Monday to Saturday, 07:00 - 17:00',
  fulfilment: ['Delivery', 'Pickup', 'Custom orders'],
  payments: ['Mobile money', 'Deposit first'],
  trust: ['Show verified badge', 'Use protected payments', 'Show customer reviews'],
  tone: 'Warm and friendly'
});

const MerchantOnboardingWizard = ({
  answers,
  setAnswers,
  password,
  setPassword,
  statusMessage,
  submitting,
  onComplete
}: {
  answers: MerchantOnboardingAnswers;
  setAnswers: Dispatch<SetStateAction<MerchantOnboardingAnswers>>;
  password: string;
  setPassword: (value: string) => void;
  statusMessage: string;
  submitting: boolean;
  onComplete: () => void;
}) => {
  const [step, setStep] = useState(0);
  const steps = [
    {title: 'Who is setting up?', helper: 'Start with account details and a password.'},
    {title: 'What do you sell?', helper: 'Tell ZamComm what to recommend when customers search.'},
    {title: 'Where can customers find you?', helper: 'Neighbourhoods are enough for a quick setup.'},
    {title: 'How should orders work?', helper: 'Pick the ways you can fulfil orders today.'},
    {title: 'How should customers trust you?', helper: 'These settings shape payment protection and store confidence.'},
    {title: 'Ready to launch', helper: 'Review the store card generated from your answers.'}
  ];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const update = <Key extends keyof MerchantOnboardingAnswers>(key: Key, value: MerchantOnboardingAnswers[Key]) => {
    setAnswers((current) => ({...current, [key]: value}));
  };

  const toggleListValue = (key: 'fulfilment' | 'payments' | 'trust', value: string) => {
    setAnswers((current) => {
      const nextValues = current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value];
      return {...current, [key]: nextValues};
    });
  };

  return (
    <section className="mt-8">
      <div className="rounded-3xl bg-neutral-100 p-3">
        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{progress}% ready</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{width: `${progress}%`}} />
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-emerald-700">{steps[step].helper}</p>
        <h2 className="mt-1 text-3xl font-black">{steps[step].title}</h2>

        {step === 0 ? (
          <div className="mt-5 grid gap-4">
            <TextInput label="Your name" value={answers.ownerName} onChange={(value) => update('ownerName', value)} />
            <TextInput label="Mobile number or email for login" value={answers.mobile} onChange={(value) => update('mobile', value)} />
            <TextInput label="Password" type="password" value={password} onChange={setPassword} />
            <TextInput label="Store or service name" value={answers.businessName} onChange={(value) => update('businessName', value)} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-5 grid gap-4">
            <ChoiceGrid options={merchantCategoryOptions} value={answers.category} onSelect={(value) => update('category', value)} />
            <TextInput label="What is the first thing you want to sell?" value={answers.mainOffer} onChange={(value) => update('mainOffer', value)} />
            <TextInput label="Starting price in Kwacha" value={answers.startingPrice} onChange={(value) => update('startingPrice', value)} />
            <TextArea label="Describe your store in one simple sentence" value={answers.shortDescription} onChange={(value) => update('shortDescription', value)} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-5 grid gap-4">
            <TextInput label="Main location" value={answers.location} onChange={(value) => update('location', value)} />
            <TextArea label="Areas you serve" value={answers.serviceArea} onChange={(value) => update('serviceArea', value)} />
            <TextInput label="Usual opening hours" value={answers.openHours} onChange={(value) => update('openHours', value)} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-5 grid gap-5">
            <MultiChoice title="How can customers receive orders?" options={fulfilmentOptions} values={answers.fulfilment} onToggle={(value) => toggleListValue('fulfilment', value)} />
            <MultiChoice title="How can customers pay?" options={paymentOptions} values={answers.payments} onToggle={(value) => toggleListValue('payments', value)} />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-5 grid gap-5">
            <MultiChoice title="Trust settings" options={trustOptions} values={answers.trust} onToggle={(value) => toggleListValue('trust', value)} />
            <div>
              <p className="text-sm font-black text-neutral-700">How should your store sound?</p>
              <ChoiceGrid options={merchantToneOptions} value={answers.tone} onSelect={(value) => update('tone', value)} />
            </div>
          </div>
        ) : null}

        {step === 5 ? <MerchantLaunchSummary answers={answers} /> : null}
        {statusMessage ? <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{statusMessage}</div> : null}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 font-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiArrowLeft />
            Back
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep((current) => current + 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-4 font-black text-white">
              Next
              <FiArrowRight />
            </button>
          ) : (
            <button type="button" disabled={submitting} onClick={onComplete} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 font-black text-neutral-950 disabled:cursor-wait disabled:opacity-70">
              {submitting ? 'Creating...' : 'Create account'}
              <FiCheckCircle />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

const ChoiceGrid = ({options, value, onSelect}: {options: string[]; value: string; onSelect: (value: string) => void}) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onSelect(option)}
        className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
          value === option ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const MultiChoice = ({title, options, values, onToggle}: {title: string; options: string[]; values: string[]; onToggle: (value: string) => void}) => (
  <div>
    <p className="text-sm font-black text-neutral-700">{title}</p>
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
              selected ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {selected ? 'Selected: ' : ''}{option}
          </button>
        );
      })}
    </div>
  </div>
);

const MerchantLaunchSummary = ({answers}: {answers: MerchantOnboardingAnswers}) => (
  <div className="mt-5 grid gap-4">
    <div className="rounded-3xl bg-neutral-950 p-5 text-white">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-amber-200">
          <FiShoppingBag />
        </div>
        <div>
          <p className="text-sm font-black text-emerald-200">{answers.category}</p>
          <h3 className="text-3xl font-black">{answers.businessName}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-300">{answers.shortDescription}</p>
        </div>
      </div>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      <SummaryTile icon={<FiPackage />} label="First offer" value={`${answers.mainOffer} from K${answers.startingPrice}`} />
      <SummaryTile icon={<FiMapPin />} label="Where" value={`${answers.location}; serves ${answers.serviceArea}`} />
      <SummaryTile icon={<FiPhone />} label="Contact" value={answers.mobile} />
    </div>
    <div className="rounded-3xl bg-emerald-50 p-4">
      <p className="font-black text-emerald-950">ZamComm launch checklist</p>
      <div className="mt-3 grid gap-2">
        {launchChecklist.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <FiCheckCircle />
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SummaryTile = ({icon, label, value}: {icon: ReactNode; label: string; value: string}) => (
  <div className="rounded-3xl bg-neutral-100 p-4">
    <div className="text-emerald-700">{icon}</div>
    <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    <p className="mt-1 text-sm font-black leading-5">{value}</p>
  </div>
);

const toCommerceSession = (user: CommerceSession): CommerceSession => ({
  id: user.id,
  role: user.role,
  name: user.name,
  username: user.username,
  contact: user.contact,
  contactType: user.contactType,
  mobile: user.mobile ?? user.contact ?? '',
  email: user.email,
  businessName: user.businessName,
  onboarded: user.onboarded,
  merchantSetup: user.merchantSetup
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) || 'merchant';

const TextInput = ({
  label,
  value,
  onChange,
  type = 'text',
  inputMode
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'numeric';
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className="block">
      <span className="text-sm font-black text-neutral-700">{label}</span>
      <div className="relative mt-2 flex items-center">
        <input
          type={effectiveType}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`min-h-13 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
            isPassword ? 'pr-11' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
            className="absolute right-3.5 flex items-center justify-center text-neutral-500 transition hover:text-neutral-900 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </label>
  );
};

const TextArea = ({label, value, onChange}: {label: string; value: string; onChange: (value: string) => void}) => (
  <label className="block">
    <span className="text-sm font-black text-neutral-700">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
    />
  </label>
);
