'use client';

import {useId, useState} from 'react';
import {FiEye, FiEyeOff} from 'react-icons/fi';

import {Input} from '@/src/components/ui/input';
import {Label} from '@/src/components/ui/label';
import {Textarea} from '@/src/components/ui/textarea';
import {cn} from '@/src/lib/cn';

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'numeric' | 'tel';
  placeholder?: string;
  /** Small helper line under the control. */
  hint?: string;
  multiline?: boolean;
  className?: string;
};

/**
 * Labelled text input shared by the auth flow and checkout, which previously
 * carried two different bespoke implementations. Wraps the Shadcn primitives so
 * every form field agrees on label, height, and focus treatment, and keeps the
 * password reveal toggle the original auth input provided.
 */
export const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  hint,
  multiline = false,
  className
}: FieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5"
        />
      ) : (
        <div className="relative mt-1.5">
          <Input
            id={id}
            type={effectiveType}
            inputMode={inputMode}
            value={value}
            placeholder={placeholder}
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
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
};
