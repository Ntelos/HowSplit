
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
