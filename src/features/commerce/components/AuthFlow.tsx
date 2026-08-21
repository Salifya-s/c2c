'use client';

import type {FormEvent, ReactNode} from 'react';
import {useMemo, useState} from 'react';
import {FiBriefcase, FiCheckCircle, FiShield, FiShoppingBag, FiUser} from 'react-icons/fi';

export type CommerceUserRole = 'customer' | 'merchant';

export type CommerceSession = {
  role: CommerceUserRole;
  name: string;
  username: string;
  mobile: string;
  businessName?: string;
  onboarded: boolean;
};

type AuthFlowProps = {
  initialRole: CommerceUserRole;
  title: string;
  description: string;
  onComplete: (session: CommerceSession) => void;
  alternateAction?: ReactNode;
};

type RoleContent = {
  label: string;
  icon: typeof FiUser;
  defaultName: string;
  defaultUsername: string;
  defaultMobile: string;
  defaultBusiness?: string;
  bullets: string[];
  onboarding: string[];
};

const roleContent: Record<CommerceUserRole, RoleContent> = {
  customer: {
    label: 'Customer',
    icon: FiUser,
    defaultName: 'Naledi Mwansa',
    defaultUsername: '@naledi.m',
    defaultMobile: '+260 977 000 001',
    bullets: ['Personalised product discovery', 'Protected checkout', 'Order tracking from one place'],
    onboarding: ['Confirm your mobile number', 'Choose delivery preferences', 'Review payment protection']
  },
  merchant: {
    label: 'Merchant',
    icon: FiBriefcase,
    defaultName: 'Tasha Mwila',
    defaultUsername: '@tashabakes',
    defaultMobile: '+260 966 000 014',
    defaultBusiness: "Tasha's Cakes",
    bullets: ['Manage incoming orders', 'Update fulfilment status', 'Keep customer chats close to orders'],
    onboarding: ['Add business profile', 'Set fulfilment options', 'Turn on protected payments']
  }
};

export const AuthFlow = ({initialRole, title, description, onComplete, alternateAction}: AuthFlowProps) => {
  const [role, setRole] = useState<CommerceUserRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'onboarding'>('login');
  const [form, setForm] = useState(() => buildDefaultForm(initialRole));
  const content = roleContent[role];
  const RoleIcon = content.icon;

  const completionLabel = useMemo(() => {
    if (mode === 'login') return role === 'customer' ? 'Continue to customer app' : 'Continue to merchant orders';
    return role === 'customer' ? 'Finish customer onboarding' : 'Finish merchant onboarding';
  }, [mode, role]);

  const updateRole = (nextRole: CommerceUserRole) => {
    setRole(nextRole);
    setForm(buildDefaultForm(nextRole));
    setMode('login');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete({
      role,
      name: form.name,
      username: form.username,
      mobile: form.mobile,
      businessName: form.businessName,
      onboarded: mode === 'onboarding'
    });
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-sm lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative overflow-hidden bg-neutral-950 p-6 text-white lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.32),transparent_34%),radial-gradient(circle_at_90%_85%,rgba(245,158,11,0.25),transparent_36%)]" />
          <div className="relative z-[1] flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-black text-emerald-100">
              <FiShield />
              Protected commerce preview
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
            {(['login', 'onboarding'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`rounded-full px-4 py-2 text-sm font-black capitalize transition ${
                  mode === option ? 'bg-white shadow-sm' : 'text-neutral-500'
                }`}
              >
                {option === 'login' ? 'Login' : 'Onboarding'}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <RoleIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  {mode === 'login' ? `${content.label} login` : `${content.label} onboarding`}
                </h2>
                <p className="text-sm text-neutral-500">This is a simulated flow for the prototype.</p>
              </div>
            </div>

            <TextInput label="Full name" value={form.name} onChange={(value) => setForm((current) => ({...current, name: value}))} />
            <TextInput label="Username" value={form.username} onChange={(value) => setForm((current) => ({...current, username: value}))} />
            <TextInput label="Mobile number" value={form.mobile} onChange={(value) => setForm((current) => ({...current, mobile: value}))} />
            {role === 'merchant' ? (
              <TextInput label="Business name" value={form.businessName} onChange={(value) => setForm((current) => ({...current, businessName: value}))} />
            ) : null}

            {mode === 'onboarding' ? (
              <div className="grid gap-3 rounded-3xl bg-neutral-100 p-4">
                {content.onboarding.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-sm font-black text-amber-800">{index + 1}</span>
                    <span className="text-sm font-black">{step}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <button type="submit" className="min-h-13 w-full rounded-2xl bg-amber-500 px-5 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:bg-amber-400">
              {completionLabel}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

const buildDefaultForm = (role: CommerceUserRole) => ({
  name: roleContent[role].defaultName,
  username: roleContent[role].defaultUsername,
  mobile: roleContent[role].defaultMobile,
  businessName: roleContent[role].defaultBusiness ?? ''
});

const TextInput = ({label, value, onChange}: {label: string; value: string; onChange: (value: string) => void}) => (
  <label className="block">
    <span className="text-sm font-black text-neutral-700">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 min-h-13 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
    />
  </label>
);
