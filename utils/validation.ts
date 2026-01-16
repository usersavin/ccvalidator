
import { ISSUER_PATTERNS, FLATTENED_BINS, COUNTRY_BINS } from '../constants';
import { CardIssuer, ValidationResult, BulkResult } from '../types';

export const checkLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const calculateLuhnCheckDigit = (partialNumber: string): number => {
  let sum = 0;
  let shouldDouble = true;

  for (let i = partialNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(partialNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
};

export const generateCardFromBin = (bin: string, length: number = 16): string => {
  let number = bin.replace(/\D/g, '');
  while (number.length < length - 1) {
    number += Math.floor(Math.random() * 10).toString();
  }
  const checkDigit = calculateLuhnCheckDigit(number);
  return number + checkDigit.toString();
};

export const getIssuer = (cardNumber: string): CardIssuer => {
  const digits = cardNumber.replace(/\D/g, '');
  for (const { name, pattern } of ISSUER_PATTERNS) {
    if (pattern.test(digits)) {
      return name as CardIssuer;
    }
  }
  return 'unknown';
};

export const detectCountryByBin = (cardNumber: string): { country: string, bank?: string, tier?: string } => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 1) return { country: 'Unknown' };
  
  // High accuracy check: look for exact prefix match in FLATTENED_BINS
  for (const item of FLATTENED_BINS) {
    if (digits.startsWith(item.bin)) {
      return { country: item.country, bank: item.bank, tier: item.tier };
    }
  }
  
  return { country: 'Unknown' };
};

export const generateRandomCard = (options?: { issuer?: CardIssuer, countryCode?: string }): { number: string, expiry: string, cvv: string, holder: string, country: string, bank?: string, tier?: string } => {
  const names = ["James Smith", "Maria Garcia", "Robert Johnson", "Patricia Williams", "Michael Brown", "Linda Jones", "David Miller", "Elizabeth Davis"];
  
  let prefix = '';
  let countryName = 'Unknown';
  let bankName: string | undefined = undefined;
  let tierName: string | undefined = undefined;

  if (options?.countryCode) {
    const countryData = COUNTRY_BINS.find(c => c.code === options.countryCode);
    if (countryData) {
      const randomBinEntry = countryData.bins[Math.floor(Math.random() * countryData.bins.length)];
      prefix = randomBinEntry.bin;
      countryName = countryData.country;
      bankName = randomBinEntry.bank;
      tierName = randomBinEntry.tier;
    }
  }

  if (!prefix) {
    const prefixes: Record<string, string[]> = {
      visa: ['4539', '4556', '4916', '4532', '4929'],
      mastercard: ['51', '52', '53', '54', '55'],
      amex: ['34', '37'],
      discover: ['6011', '65'],
      jcb: ['3528', '3589'],
      diners: ['300', '301', '36'],
      rupay: ['60', '65']
    };
    const selectedIssuer = options?.issuer && options.issuer !== 'unknown' ? options.issuer : (Object.keys(prefixes)[Math.floor(Math.random() * Object.keys(prefixes).length)] as CardIssuer);
    const prefixList = prefixes[selectedIssuer as string] || ['4'];
    prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  }

  const issuer = getIssuer(prefix);
  const length = (issuer as string) === 'amex' ? 15 : 16;
  const number = generateCardFromBin(prefix, length);
  
  const now = new Date();
  const year = (now.getFullYear() % 100) + Math.floor(Math.random() * 5) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  const expiry = `${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
  
  const cvvLength = (issuer as string) === 'amex' ? 4 : 3;
  const cvv = Math.floor(Math.pow(10, cvvLength - 1) + Math.random() * (Math.pow(10, cvvLength) - Math.pow(10, cvvLength - 1))).toString();
  
  const detection = detectCountryByBin(number);

  return {
    number: formatCardNumber(number),
    expiry,
    cvv,
    holder: names[Math.floor(Math.random() * names.length)].toUpperCase(),
    country: detection.country,
    bank: detection.bank,
    tier: detection.tier
  };
};

export const validateCard = (number: string, expiry: string, cvv: string): ValidationResult => {
  const errors: ValidationResult['errors'] = {};
  const digits = number.replace(/\D/g, '');
  const luhnValid = checkLuhn(digits);
  const issuer = getIssuer(digits);
  const detection = detectCountryByBin(digits);

  if (digits.length < 13 || digits.length > 19) {
    errors.number = 'Invalid card number length';
  } else if (!luhnValid) {
    errors.number = 'Failed Luhn validation check';
  }

  if (expiry && !/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.expiry = 'Format MM/YY required';
  } else if (expiry) {
    const [m, y] = expiry.split('/').map(n => parseInt(n, 10));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (m < 1 || m > 12) errors.expiry = 'Invalid month';
    else if (y < currentYear || (y === currentYear && m < currentMonth)) {
      errors.expiry = 'Card is expired';
    }
  }

  if (cvv && (cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv))) {
    errors.cvv = `Invalid CVV`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    issuer,
    luhnValid,
    errors,
    country: detection.country,
    bank: detection.bank,
    tier: detection.tier
  };
};

export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,19}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : v;
};

export const parseBulkCsv = (csvText: string): BulkResult[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => {
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (parts.length < 5) {
      return {
        raw: line,
        holder: 'Invalid Row',
        number: 'N/A',
        isValid: false,
        issuer: 'unknown',
        luhnValid: false,
        errors: { number: 'Incomplete data row' }
      };
    }
    const [issuerStr, holder, rawNumber, cvv, expiry] = parts.map(p => p.trim().replace(/^"|"$/g, ''));
    const validation = validateCard(rawNumber, expiry, cvv);
    return { ...validation, raw: line, holder, number: rawNumber };
  });
};
