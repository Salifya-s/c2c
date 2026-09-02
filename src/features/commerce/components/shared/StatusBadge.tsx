import {Badge} from '@/src/components/ui/badge';
import {cn} from '@/src/lib/cn';

import {getStatusLabel} from '../../lib/commerceLogic';
import type {OrderStatus, PaymentStatus, ProtectionStatus} from '../../types/commerce';

type Tone = 'neutral' | 'active' | 'success' | 'warning' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  active: 'bg-primary/10 text-primary',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-destructive/10 text-destructive'
};

const orderTone = {
  created: 'neutral',
  pending_payment: 'warning',
  paid: 'active',
  paid_in_escrow: 'active',
  awaiting_merchant_acceptance: 'warning',
  accepted: 'active',
  preparing: 'active',
  ready: 'active',
  ready_for_pickup: 'active',
  courier_requested: 'active',
  courier_assigned: 'active',
  picked_up: 'active',
  in_delivery: 'active',
  out_for_delivery: 'active',
  delivered: 'success',
  pin_verified: 'success',
  completed: 'success',
  cancelled: 'danger',
  disputed: 'danger'
} satisfies Record<OrderStatus, Tone>;

const protectionTone = {
  not_required: 'neutral',
  pending_payment: 'warning',
  funds_protected: 'active',
  release_pending: 'warning',
  released: 'success',
  refunded: 'neutral',
  disputed: 'danger'
} satisfies Record<ProtectionStatus, Tone>;

const protectionLabel = {
  not_required: 'No protection needed',
  pending_payment: 'Awaiting payment',
  funds_protected: 'Funds protected',
  release_pending: 'Release pending',
  released: 'Funds released',
  refunded: 'Refunded',
  disputed: 'Disputed'
} satisfies Record<ProtectionStatus, string>;

const paymentTone = {
  pending: 'warning',
  processing: 'warning',
  paid: 'success',
  failed: 'danger',
  pay_on_pickup: 'neutral'
} satisfies Record<PaymentStatus, Tone>;

const paymentLabel = {
  pending: 'Payment pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Payment failed',
  pay_on_pickup: 'Pay on pickup'
} satisfies Record<PaymentStatus, string>;

type StatusBadgeProps = {className?: string} & (
  | {kind: 'order'; status: OrderStatus}
  | {kind: 'protection'; status: ProtectionStatus}
  | {kind: 'payment'; status: PaymentStatus}
);

/**
 * Single presentation of every order-lifecycle status.
 *
 * Order labels come from `getStatusLabel` so the wording stays in one place;
 * protection and payment wording lives here because it is purely presentational
 * and previously appeared as `status.replaceAll('_', ' ')` in three components.
 */
export const StatusBadge = ({className, ...props}: StatusBadgeProps) => {
  const {tone, label} =
    props.kind === 'order'
      ? {tone: orderTone[props.status], label: getStatusLabel(props.status)}
      : props.kind === 'protection'
        ? {tone: protectionTone[props.status], label: protectionLabel[props.status]}
        : {tone: paymentTone[props.status], label: paymentLabel[props.status]};

  return (
    <Badge variant="secondary" className={cn(toneClass[tone], className)}>
      {label}
    </Badge>
  );
};
