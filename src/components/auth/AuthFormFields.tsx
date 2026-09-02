'use client';

import type {ChangeEventHandler} from 'react';

import {InputField} from '@/src/components/auth/InputField';

export type AuthFieldConfig = {
  labelKey: string;
  name: string;
  placeholderKey?: string;
  type: 'email' | 'password' | 'tel' | 'text';
};

type AuthFormFieldsProps = {
  fields: AuthFieldConfig[];
  formState: Record<string, string>;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const AuthFormFields = ({fields, formState, onChange}: AuthFormFieldsProps) => {
  return (
    <div className="grid gap-3">
      {fields.map((field) => (
        <InputField
          key={field.name}
          labelKey={field.labelKey}
          name={field.name}
          namespace="auth.fields"
          placeholderKey={field.placeholderKey}
          type={field.type}
          value={formState[field.name] ?? ''}
          onChange={onChange}
        />
      ))}
    </div>
  );
};
