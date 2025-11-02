import { Transaction, Budget, Goal } from "./types";

export const transactions: Transaction[] = [
  {
    id: "txn_1",
    date: "2024-07-26",
    description: "Salary Deposit",
    amount: 5000,
    type: "income",
    category: "Salary",
    account: "Checking",
  },
  {
    id: "txn_2",
    date: "2024-07-25",
    description: "Grocery Shopping",
    amount: -75.5,
    type: "expense",
    category: "Food",
    account: "Checking",
  },
  {
    id: "txn_3",
    date: "2024-07-24",
    description: "Monthly Rent",
    amount: -1500,
    type: "expense",
    category: "Rent",
    account: "Checking",
  },
  {
    id: "txn_4",
    date: "2024-07-23",
    description: "Movie Tickets",
    amount: -30,
    type: "expense",
    category: "Entertainment",
    account: "Credit Card",
  },
  {
    id: "txn_5",
    date: "2024-07-22",
    description: "Gasoline",
    amount: -45.25,
    type: "expense",
    category: "Transportation",
    account: "Credit Card",
  },
  {
    id: "txn_6",
    date: "2024-07-21",
    description: "Electricity Bill",
    amount: -120.0,
    type: "expense",
    category: "Utilities",
    account: "Checking",
  },
  {
    id: "txn_7",
    date: "2024-07-20",
    description: "New T-shirt",
    amount: -25.0,
    type: "expense",
    category: "Shopping",
    account: "Credit Card",
  },
  {
    id: "txn_8",
    date: "2024-07-19",
    description: "Dinner with Friends",
    amount: -60.0,
    type: "expense",
    category: "Food",
    account: "Credit Card",
  },
];

export const totalIncome = transactions
  .filter((t) => t.type === "income")
  .reduce((acc, t) => acc + t.amount, 0);

export const totalExpenses = transactions
  .filter((t) => t.type === "expense")
  .reduce((acc, t) => acc + t.amount, 0);

export const netBalance = totalIncome + totalExpenses;

export const budgets: Budget[] = [
  {
    id: "budget_1",
    category: "Food",
    limit: 500,
    spent: 235.5,
  },
  {
    id: "budget_2",
    category: "Transportation",
    limit: 200,
    spent: 95.25,
  },
  {
    id: "budget_3",
    category: "Shopping",
    limit: 300,
    spent: 150.75,
  },
  {
    id: "budget_4",
    category: "Entertainment",
    limit: 150,
    spent: 80,
  },
];

export const goals: Goal[] = [
  {
    id: "goal_1",
    name: "Vacation to Hawaii",
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: "2024-12-31",
  },
  {
    id: "goal_2",
    name: "New Laptop",
    targetAmount: 1500,
    currentAmount: 1450,
    deadline: "2024-08-30",
  },
  {
    id: "goal_3",
    name: "Down Payment for Car",
    targetAmount: 5000,
    currentAmount: 2500,
    deadline: "2025-06-30",
  },
];
