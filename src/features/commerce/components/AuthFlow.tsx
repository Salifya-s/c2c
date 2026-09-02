'use client';

import type {Dispatch, FormEvent, ReactNode, SetStateAction} from 'react';
import {useEffect, useId, useMemo, useState} from 'react';
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

import {Button} from '@/src/components/ui/button';
import {Input} from '@/src/components/ui/input';
import {Label} from '@/src/components/ui/label';
import {Textarea} from '@/src/components/ui/textarea';
import {cn} from '@/src/lib/cn';

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
      className={cn(
        'mx-auto grid w-full overflow-hidden rounded-lg border border-border/50 bg-card lg:grid-cols-[0.92fr_1.08fr]',
        presentation === 'full' && 'min-h-[calc(100vh-2rem)] max-w-6xl'
      )}
    >
      <aside className="flex flex-col bg-primary p-5 text-primary-foreground lg:p-8">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
          <FiShield aria-hidden />
          Password + OTP security
        </span>
        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary-foreground/60">ZamComm</p>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight lg:text-3xl">{title}</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/70">{description}</p>
        </div>
        <ul className="mt-8 grid gap-2">
          {content.bullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-3 rounded-md bg-primary-foreground/10 p-3">
              <FiCheckCircle aria-hidden className="shrink-0 text-primary-foreground/70" />
              <span className="text-sm">{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-8">{alternateAction}</div>
      </aside>

      <section className="p-5 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={(['customer', 'merchant'] as CommerceUserRole[]).map((option) => ({
              value: option,
              label: roleContent[option].label,
              Icon: roleContent[option].icon
            }))}
            value={role}
            onChange={updateRole}
            ariaLabel="Account type"
          />
          <SegmentedControl
            options={(['login', 'register'] as AuthMode[]).map((option) => ({value: option, label: option}))}
            value={mode}
            onChange={(next) => {
              setMode(next);
              resetMessages();
            }}
            ariaLabel="Login or register"
            className="capitalize"
          />
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

  return <main className="min-h-screen bg-background p-4 text-foreground">{authPanel}</main>;
};

/** Shared pill group for the role and login/register switches. */
const SegmentedControl = <Value extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className
}: {
  options: Array<{value: Value; label: string; Icon?: typeof FiUser}>;
  value: Value;
  onChange: (next: Value) => void;
  ariaLabel: string;
  className?: string;
}) => (
  <div role="group" aria-label={ariaLabel} className="inline-flex gap-1 rounded-md bg-muted p-1">
    {options.map(({value: optionValue, label, Icon}) => {
      const isActive = value === optionValue;
      return (
        <Button
          key={optionValue}
          type="button"
          size="sm"
          variant={isActive ? 'default' : 'ghost'}
          aria-pressed={isActive}
          onClick={() => onChange(optionValue)}
          className={cn(!isActive && 'text-muted-foreground', className)}
        >
          {Icon ? <Icon aria-hidden /> : null}
          {label}
        </Button>
      );
    })}
  </div>
);

/** Amber-toned inline notice used for API status and the development OTP. */
const Notice = ({tone = 'warning', children}: {tone?: 'warning' | 'success'; children: ReactNode}) => (
  <p
    className={cn(
      'mt-3 rounded-md p-3 text-xs',
      tone === 'success' ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
    )}
  >
    {children}
  </p>
);

const StepHeading = ({icon, title, helper}: {icon: ReactNode; title: string; helper: string}) => (
  <div className="flex items-center gap-3">
    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
    <div className="min-w-0">
      <h2 className="font-display text-lg font-semibold capitalize">{title}</h2>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  </div>
);

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
  <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
    <StepHeading
      icon={<RoleIcon size={18} />}
      title={title}
      helper="Enter your password, then confirm the one-time code sent to you."
    />

    {mode === 'register' ? (
      <>
        <Field label="Full name" value={form.name} onChange={(value) => setForm((current) => ({...current, name: value}))} />
        <Field label="Username" value={form.username} onChange={(value) => setForm((current) => ({...current, username: value}))} />
      </>
    ) : null}
    <Field label="Mobile number or email" value={form.contact} onChange={(value) => setForm((current) => ({...current, contact: value}))} />
    <Field label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({...current, password: value}))} />
    {role === 'merchant' && mode === 'register' ? (
      <Field label="Business name" value={form.businessName} onChange={(value) => setForm((current) => ({...current, businessName: value}))} />
    ) : null}
    {statusMessage ? <Notice>{statusMessage}</Notice> : null}
    <Button type="submit" size="lg" disabled={submitting} className="w-full">
      {submitting ? 'Working...' : actionLabel}
    </Button>
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
  <section className="mt-6 rounded-lg border border-border/50 p-4">
    <StepHeading icon={<FiKey size={18} />} title="Enter verification code" helper={`We sent a 6-digit code to ${contact}.`} />
    <div className="mt-4">
      <Label htmlFor="auth-otp">One-time code</Label>
      <Input
        id="auth-otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={otpCode}
        onChange={(event) => setOtpCode(event.target.value)}
        className="mt-1.5 h-11 text-center font-mono text-lg tracking-[0.4em]"
      />
    </div>
    {devOtp ? <Notice tone="success">Development OTP: {devOtp}</Notice> : null}
    {statusMessage ? <Notice>{statusMessage}</Notice> : null}
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={onBack}>
        <FiArrowLeft aria-hidden />
        Back
      </Button>
      <Button type="button" onClick={onVerify} disabled={submitting}>
        Verify
        <FiArrowRight aria-hidden />
      </Button>
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
    <section className="mt-6">
      <div className="rounded-md bg-muted p-3">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <span>{progress}% ready</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-card"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Width is data-driven, so it stays an inline style rather than a utility class. */}
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{width: `${progress}%`}} />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border/50 p-4">
        <p className="text-xs font-medium text-primary">{steps[step].helper}</p>
        <h2 className="mt-1 font-display text-xl font-semibold">{steps[step].title}</h2>

        {step === 0 ? (
          <div className="mt-4 grid gap-4">
            <Field label="Your name" value={answers.ownerName} onChange={(value) => update('ownerName', value)} />
            <Field label="Mobile number or email for login" value={answers.mobile} onChange={(value) => update('mobile', value)} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />
            <Field label="Store or service name" value={answers.businessName} onChange={(value) => update('businessName', value)} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-4 grid gap-4">
            <ChoiceGrid options={merchantCategoryOptions} value={answers.category} onSelect={(value) => update('category', value)} />
            <Field label="What is the first thing you want to sell?" value={answers.mainOffer} onChange={(value) => update('mainOffer', value)} />
            <Field label="Starting price in Kwacha" value={answers.startingPrice} onChange={(value) => update('startingPrice', value)} />
            <Field label="Describe your store in one simple sentence" multiline value={answers.shortDescription} onChange={(value) => update('shortDescription', value)} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 grid gap-4">
            <Field label="Main location" value={answers.location} onChange={(value) => update('location', value)} />
            <Field label="Areas you serve" multiline value={answers.serviceArea} onChange={(value) => update('serviceArea', value)} />
            <Field label="Usual opening hours" value={answers.openHours} onChange={(value) => update('openHours', value)} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 grid gap-5">
            <MultiChoice title="How can customers receive orders?" options={fulfilmentOptions} values={answers.fulfilment} onToggle={(value) => toggleListValue('fulfilment', value)} />
            <MultiChoice title="How can customers pay?" options={paymentOptions} values={answers.payments} onToggle={(value) => toggleListValue('payments', value)} />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-4 grid gap-5">
            <MultiChoice title="Trust settings" options={trustOptions} values={answers.trust} onToggle={(value) => toggleListValue('trust', value)} />
            <div>
              <p className="text-sm font-medium">How should your store sound?</p>
              <ChoiceGrid options={merchantToneOptions} value={answers.tone} onSelect={(value) => update('tone', value)} />
            </div>
          </div>
        ) : null}

        {step === 5 ? <MerchantLaunchSummary answers={answers} /> : null}
        {statusMessage ? <Notice>{statusMessage}</Notice> : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            <FiArrowLeft aria-hidden />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => current + 1)}>
              Next
              <FiArrowRight aria-hidden />
            </Button>
          ) : (
            <Button type="button" disabled={submitting} onClick={onComplete}>
              {submitting ? 'Creating...' : 'Create account'}
              <FiCheckCircle aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

const ChoiceGrid = ({options, value, onSelect}: {options: string[]; value: string; onSelect: (value: string) => void}) => (
  <div className="mt-2 grid gap-2 sm:grid-cols-2">
    {options.map((option) => {
      const isActive = value === option;
      return (
        <button
          key={option}
          type="button"
          aria-pressed={isActive}
          onClick={() => onSelect(option)}
          className={cn(
            'rounded-md border px-3 py-2 text-left text-sm transition',
            'focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]',
            isActive ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border/50 hover:bg-muted'
          )}
        >
          {option}
        </button>
      );
    })}
  </div>
);

const MultiChoice = ({title, options, values, onToggle}: {title: string; options: string[]; values: string[]; onToggle: (value: string) => void}) => (
  <div>
    <p className="text-sm font-medium">{title}</p>
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(option)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition',
              'focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]',
              selected ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border/50 hover:bg-muted'
            )}
          >
            {option}
            {selected ? <FiCheckCircle aria-hidden className="shrink-0" /> : null}
          </button>
        );
      })}
    </div>
  </div>
);

const MerchantLaunchSummary = ({answers}: {answers: MerchantOnboardingAnswers}) => (
  <div className="mt-4 grid gap-3">
    <div className="rounded-lg bg-primary p-4 text-primary-foreground">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-foreground/10">
          <FiShoppingBag aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-primary-foreground/60">{answers.category}</p>
          <h3 className="font-display text-xl font-semibold">{answers.businessName}</h3>
          <p className="mt-1.5 text-sm leading-6 text-primary-foreground/70">{answers.shortDescription}</p>
        </div>
      </div>
    </div>
    <div className="grid gap-2 md:grid-cols-3">
      <SummaryTile icon={<FiPackage aria-hidden />} label="First offer" value={`${answers.mainOffer} from K${answers.startingPrice}`} />
      <SummaryTile icon={<FiMapPin aria-hidden />} label="Where" value={`${answers.location}; serves ${answers.serviceArea}`} />
      <SummaryTile icon={<FiPhone aria-hidden />} label="Contact" value={answers.mobile} />
    </div>
    <div className="rounded-lg border border-border/50 p-4">
      <p className="text-sm font-medium">ZamComm launch checklist</p>
      <ul className="mt-2 grid gap-1.5">
        {launchChecklist.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <FiCheckCircle aria-hidden className="shrink-0 text-success" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const SummaryTile = ({icon, label, value}: {icon: ReactNode; label: string; value: string}) => (
  <div className="rounded-md border border-border/50 p-3">
    <span className="text-primary">{icon}</span>
    <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-sm leading-5">{value}</p>
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

/**
 * Labelled text input. Wraps the Shadcn primitives so every auth field shares
 * one label, height, and focus treatment, and keeps the password reveal toggle
 * the previous bespoke input provided.
 */
const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  multiline = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'numeric';
  multiline?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5" />
      ) : (
        <div className="relative mt-1.5">
          <Input
            id={id}
            type={effectiveType}
            inputMode={inputMode}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={cn('h-10', isPassword && 'pr-10')}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
