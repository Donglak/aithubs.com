// src/types/payment.ts

export type PaymentGateway = 'stripe' | 'vnpay' | 'momo' | 'paypal';
export type PaymentType = 'ebook' | 'vip_subscription';
export type Currency = 'usd' | 'vnd';
export type SubscriptionPlan = 'vip_monthly' | 'vip_yearly';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export interface CheckoutRequest {
  type: PaymentType;
  gateway: PaymentGateway;
  amount: number; // cents (USD) hoặc VND nguyên
  currency: Currency;
  metadata: {
    ebook_id?: string;
    ebook_title?: string;
    ebook_description?: string;
    plan?: SubscriptionPlan;
  };
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: {
    orderId: string;
    sessionId?: string;
    url?: string;
    vnpTxnRef?: string;
    momoOrderId?: string;
    subscriptionId?: string;
  };
  error?: string;
}

export interface SubscriptionInfo {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currency: Currency;
  amount: number;
  interval: 'month' | 'year';
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  type: PaymentType;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: Currency;
  payment_gateway: PaymentGateway;
  payment_intent_id: string | null;
  payment_session_id: string | null;
  metadata: Record<string, any>;
  paid_at: string | null;
  created_at: string;
}