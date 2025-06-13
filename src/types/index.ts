
export interface Housemate {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  participantIds: string[];
  date: Date;
}

export interface Payment {
  id: string;
  fromId: string; // Housemate ID of the payer
  toId: string;   // Housemate ID of the recipient
  amount: number;
  date: Date;
  description?: string; // Optional description for the payment
}

export interface Debt {
  from: string; // Housemate name
  fromId: string; // Housemate ID
  to: string;   // Housemate name
  toId: string;   // Housemate ID
  amount: number;
}

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const;

export type Currency = typeof currencies[number];
export type CurrencyCode = typeof currencies[number]['code'];

export const DEFAULT_CURRENCY_CODE: CurrencyCode = 'USD';
