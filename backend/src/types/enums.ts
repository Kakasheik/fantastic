/**
 * Enums tipo-seguros (substituem os enums Prisma para compatibilidade SQLite).
 * Em produção (Postgres), o schema Prisma definiria enums nativos; aqui usamos
 * unions TS validados nas DTOs com class-validator.
 */
export const UserRole = {
  SUBSCRIBER: 'SUBSCRIBER',
  CREATOR:    'CREATOR',
  ADVERTISER: 'ADVERTISER',
  ADMIN:      'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionStatus = {
  PENDING:   'PENDING',
  ACTIVE:    'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED:   'EXPIRED',
  TRIAL:     'TRIAL',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const TransactionType = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  PPV:          'PPV',
  TIP:          'TIP',
  AD_CREDIT:    'AD_CREDIT',
  WITHDRAWAL:   'WITHDRAWAL',
  REFUND:       'REFUND',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING:    'PENDING',
  COMPLETED:  'COMPLETED',
  REFUNDED:   'REFUNDED',
  CHARGEBACK: 'CHARGEBACK',
  FAILED:     'FAILED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const PostType = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  TEXT:  'TEXT',
} as const;
export type PostType = (typeof PostType)[keyof typeof PostType];

export const PaymentMethod = {
  PIX:          'PIX',
  CREDIT_CARD:  'CREDIT_CARD',
  GOOGLE_PAY:   'GOOGLE_PAY',
  PICPAY:       'PICPAY',
  WALLET:       'WALLET',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
