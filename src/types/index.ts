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

export interface Debt {
  from: string; // Housemate name
  to: string;   // Housemate name
  amount: number;
}
