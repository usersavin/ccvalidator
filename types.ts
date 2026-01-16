
export type CardIssuer = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'maestro' | 'unionpay' | 'mir' | 'rupay' | 'unknown';

export interface CardData {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
  country?: string;
  bank?: string;
  tier?: string;
}

export interface CardAnalytics {
  estimatedBalanceLKR: string;
  spendingLimitLKR: string;
  riskScore: number; // 0-100
  cardTier: string;
  trustLevel: 'High' | 'Medium' | 'Low';
  usageCategory: string;
  creditScoreEquivalent: string;
  insights: string[];
}

export interface ValidationResult {
  isValid: boolean;
  issuer: CardIssuer;
  luhnValid: boolean;
  country?: string;
  bank?: string;
  tier?: string;
  errors: {
    number?: string;
    expiry?: string;
    cvv?: string;
  };
}

export interface SecurityInsight {
  title: string;
  content: string;
  type: 'security' | 'feature' | 'info';
}

export interface BulkResult extends ValidationResult {
  raw: string;
  holder: string;
  number: string;
}
