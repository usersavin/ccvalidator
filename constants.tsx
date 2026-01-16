
import React from 'react';

export const ISSUER_PATTERNS = [
  { name: 'visa', pattern: /^4/ },
  { name: 'mastercard', pattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/ },
  { name: 'amex', pattern: /^3[47]/ },
  { name: 'discover', pattern: /^6(?:011|5|4[4-9]|22)/ },
  { name: 'jcb', pattern: /^(?:2131|1800|35)/ },
  { name: 'diners', pattern: /^3(?:0[0-5]|[68])/ },
  { name: 'maestro', pattern: /^(5018|5020|5038|6304|6759|6761|6763)/ },
  { name: 'unionpay', pattern: /^62/ },
  { name: 'mir', pattern: /^220[0-4]/ },
  { name: 'rupay', pattern: /^(60|65|81|82|508)/ },
] as const;

export const ISSUER_COLORS: Record<string, string> = {
  visa: 'bg-gradient-to-br from-blue-600 to-indigo-900',
  mastercard: 'bg-gradient-to-br from-orange-500 to-red-800',
  amex: 'bg-gradient-to-br from-emerald-600 to-teal-900',
  discover: 'bg-gradient-to-br from-orange-400 to-orange-700',
  jcb: 'bg-gradient-to-br from-green-600 to-green-900',
  diners: 'bg-gradient-to-br from-slate-600 to-slate-900',
  maestro: 'bg-gradient-to-br from-blue-400 to-blue-700',
  unionpay: 'bg-gradient-to-br from-red-500 to-red-900',
  mir: 'bg-gradient-to-br from-emerald-700 to-emerald-950',
  rupay: 'bg-gradient-to-br from-indigo-500 to-indigo-800',
  unknown: 'bg-gradient-to-br from-slate-700 to-slate-900',
};

export const ISSUER_LOGOS: Record<string, React.ReactNode> = {
  visa: <i className="fa-brands fa-cc-visa text-4xl"></i>,
  mastercard: <i className="fa-brands fa-cc-mastercard text-4xl"></i>,
  amex: <i className="fa-brands fa-cc-amex text-4xl"></i>,
  discover: <i className="fa-brands fa-cc-discover text-4xl"></i>,
  jcb: <i className="fa-brands fa-cc-jcb text-4xl"></i>,
  diners: <i className="fa-brands fa-cc-diners-club text-4xl"></i>,
  maestro: <i className="fa-solid fa-credit-card text-4xl"></i>,
  unionpay: <i className="fa-solid fa-credit-card text-4xl"></i>,
  mir: <i className="fa-solid fa-credit-card text-4xl"></i>,
  rupay: <i className="fa-solid fa-credit-card text-4xl"></i>,
  unknown: <i className="fa-solid fa-credit-card text-4xl"></i>,
};

export interface CountryBin {
  country: string;
  code: string;
  bins: { bin: string; bank?: string; tier?: string }[];
}

export const COUNTRY_BINS: CountryBin[] = [
  { 
    country: 'Sri Lanka', 
    code: 'LK', 
    bins: [
      { bin: '405663', bank: 'Commercial Bank', tier: 'Visa Gold' },
      { bin: '405664', bank: 'Commercial Bank', tier: 'Visa Platinum' },
      { bin: '426391', bank: 'HNB', tier: 'Visa Classic' },
      { bin: '451314', bank: 'HNB', tier: 'Visa Gold' },
      { bin: '406065', bank: 'Sampath Bank', tier: 'Visa Classic' },
      { bin: '412492', bank: 'Sampath Bank', tier: 'Visa Platinum' },
      { bin: '400079', bank: 'Bank of Ceylon', tier: 'Visa Debit' },
      { bin: '412495', bank: 'Bank of Ceylon', tier: 'Visa Gold' },
      { bin: '421673', bank: 'Peoples Bank', tier: 'Visa Classic' },
      { bin: '483584', bank: 'Peoples Bank', tier: 'Visa Gold' },
      { bin: '377242', bank: 'NTB', tier: 'Amex Green' },
      { bin: '377243', bank: 'NTB', tier: 'Amex Gold' },
      { bin: '454313', bank: 'Seylan Bank', tier: 'Visa Classic' },
      { bin: '523908', bank: 'Commercial Bank', tier: 'Mastercard Standard' },
      { bin: '542911', bank: 'Sampath Bank', tier: 'Mastercard Gold' },
      { bin: '513361', bank: 'HNB', tier: 'Mastercard Platinum' },
      { bin: '532890', bank: 'Bank of Ceylon', tier: 'Mastercard Standard' },
      { bin: '545621', bank: 'Seylan Bank', tier: 'Mastercard Platinum' },
      // Shorter fallbacks for high-level matching
      { bin: '4056', bank: 'Commercial Bank', tier: 'Visa' },
      { bin: '4060', bank: 'Sampath Bank', tier: 'Visa' },
      { bin: '4124', bank: 'Sri Lanka Generic', tier: 'Visa' },
      { bin: '5239', bank: 'Commercial Bank', tier: 'Mastercard' },
    ] 
  },
  { 
    country: 'United States', 
    code: 'US', 
    bins: [
      { bin: '4147', bank: 'Chase', tier: 'Visa Signature' },
      { bin: '4246', bank: 'Wells Fargo', tier: 'Visa Classic' },
      { bin: '5100', bank: 'Citibank', tier: 'Mastercard World' },
      { bin: '3400', bank: 'American Express', tier: 'Amex Centurion' }
    ] 
  },
  { 
    country: 'United Kingdom', 
    code: 'GB', 
    bins: [
      { bin: '4751', bank: 'Barclays', tier: 'Visa Debit' },
      { bin: '5412', bank: 'HSBC', tier: 'Mastercard Gold' }
    ] 
  },
  { 
    country: 'India', 
    code: 'IN', 
    bins: [
      { bin: '4315', bank: 'SBI', tier: 'Visa Classic' },
      { bin: '6070', bank: 'HDFC', tier: 'Rupay' }
    ] 
  }
];

export const FLATTENED_BINS = COUNTRY_BINS.flatMap(c => 
  c.bins.map(b => ({ ...b, country: c.country, code: c.code }))
).sort((a, b) => b.bin.length - a.bin.length);
