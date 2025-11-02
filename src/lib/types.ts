export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Utilities"
  | "Rent"
  | "Salary"
  | "Shopping"
  | "Travel"
  | "Other";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: Category;
  account?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}
