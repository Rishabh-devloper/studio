"use server";

import { categorizeTransactions } from "@/ai/flows/categorize-transactions";
import * as z from "zod";
import { db } from "@/db";
import { transactions as transactionsTable, budgets as budgetsTable, goals as goalsTable, transactionTypeEnum } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const SuggestSchema = z.object({
  description: z.string(),
  amount: z.number(),
});

export async function getCategorySuggestion(description: string, amount: number) {
  try {
    const validation = SuggestSchema.safeParse({ description, amount });
    if (!validation.success) {
      return { error: "Invalid input." } as const;
    }

    const result = await categorizeTransactions({
      transactionDescription: validation.data.description,
      transactionAmount: validation.data.amount,
    });
    return { category: result.category } as const;
  } catch (e) {
    console.error(e);
    return { error: "Failed to get suggestion. Please try again." } as const;
  }
}

const AddTxnSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  date: z.string().optional(),
});

export async function addTransaction(input: z.infer<typeof AddTxnSchema>) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }
  const parsed = AddTxnSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid data" } as const;
  }
  const values = parsed.data;
  const signedAmount = values.type === "expense" ? -Math.abs(values.amount) : Math.abs(values.amount);

  await db.insert(transactionsTable).values({
    userId,
    description: values.description,
    amount: signedAmount,
    type: values.type,
    category: values.category,
    date: values.date ? new Date(values.date) : new Date(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { ok: true } as const;
}

export async function getRecentTransactions(limit = 5) {
  const { userId } = await auth();
  if (!userId) return [] as const;
  const rows = await db.query.transactions.findMany({
    where: eq(transactionsTable.userId, userId),
    orderBy: [desc(transactionsTable.date)],
    limit,
  });
  return rows;
}

export async function getAllTransactions() {
  const { userId } = await auth();
  if (!userId) return [];
  const rows = await db.query.transactions.findMany({
    where: eq(transactionsTable.userId, userId),
    orderBy: [desc(transactionsTable.date)],
  });
  return rows;
}

// Budget Actions
const AddBudgetSchema = z.object({
  category: z.string().min(1),
  limit: z.number().positive(),
});

export async function addBudget(input: z.infer<typeof AddBudgetSchema>) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }
  const parsed = AddBudgetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid data" } as const;
  }
  const values = parsed.data;

  await db.insert(budgetsTable).values({
    userId,
    category: values.category,
    limit: values.limit.toString(),
    spent: "0",
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function getAllBudgets() {
  const { userId } = await auth();
  if (!userId) return [];
  const rows = await db.query.budgets.findMany({
    where: eq(budgetsTable.userId, userId),
  });
  return rows;
}

export async function updateBudgetSpent(budgetId: string, amount: number) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }

  // Verify budget belongs to user
  const budget = await db.query.budgets.findFirst({
    where: and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)),
  });

  if (!budget) {
    return { error: "Budget not found" } as const;
  }

  await db
    .update(budgetsTable)
    .set({ spent: (Number(budget.spent) + amount).toString() })
    .where(and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)));

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

// Goal Actions
const AddGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  deadline: z.string().optional(),
});

export async function addGoal(input: z.infer<typeof AddGoalSchema>) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }
  const parsed = AddGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid data" } as const;
  }
  const values = parsed.data;

  await db.insert(goalsTable).values({
    userId,
    name: values.name,
    targetAmount: values.targetAmount.toString(),
    currentAmount: "0",
    deadline: values.deadline ? new Date(values.deadline) : null,
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function getAllGoals() {
  const { userId } = await auth();
  if (!userId) return [];
  const rows = await db.query.goals.findMany({
    where: eq(goalsTable.userId, userId),
  });
  return rows;
}

export async function contributeToGoal(goalId: string, amount: number) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }

  // Verify goal belongs to user
  const goal = await db.query.goals.findFirst({
    where: and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)),
  });

  if (!goal) {
    return { error: "Goal not found" } as const;
  }

  await db
    .update(goalsTable)
    .set({ currentAmount: (Number(goal.currentAmount) + amount).toString() })
    .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

// Account Actions
const AddAccountSchema = z.object({
  name: z.string().min(1),
  balance: z.number().default(0),
});

export async function addAccount(input: z.infer<typeof AddAccountSchema>) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }
  const parsed = AddAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid data" } as const;
  }
  const values = parsed.data;

  await db.insert(accounts).values({
    userId,
    name: values.name,
    balance: values.balance.toString(),
  });

  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function getAllAccounts() {
  const { userId } = await auth();
  if (!userId) return [];
  const rows = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
    orderBy: [desc(accounts.createdAt)],
  });
  return rows;
}

export async function updateAccountBalance(accountId: string, amount: number) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" } as const;
  }

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
  });

  if (!account) {
    return { error: "Account not found" } as const;
  }

  await db
    .update(accounts)
    .set({ 
      balance: (Number(account.balance) + amount).toString(),
      updatedAt: new Date(),
    })
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

  revalidatePath("/dashboard");
  return { ok: true } as const;
}

// Reports Actions
export async function getSpendingByCategory() {
  const { userId } = await auth();
  if (!userId) return [];
  
  const expenses = await db.query.transactions.findMany({
    where: and(
      eq(transactionsTable.userId, userId),
      eq(transactionsTable.type, "expense")
    ),
  });

  // Group by category
  const grouped = expenses.reduce((acc, txn) => {
    const category = txn.category;
    const amount = Math.abs(Number(txn.amount));
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}

export async function getMonthlyFinancialData() {
  const { userId } = await auth();
  if (!userId) return [];
  
  const allTxns = await db.query.transactions.findMany({
    where: eq(transactionsTable.userId, userId),
    orderBy: [desc(transactionsTable.date)],
  });

  // Group by month (last 12 months)
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  allTxns.forEach((txn) => {
    const date = new Date(txn.date!);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    const amount = Math.abs(Number(txn.amount));
    if (txn.type === "income") {
      monthlyData[monthKey].income += amount;
    } else {
      monthlyData[monthKey].expenses += amount;
    }
  });

  // Convert to array and take last 7 months
  return Object.entries(monthlyData)
    .map(([date, data]) => ({ date, ...data }))
    .slice(0, 7)
    .reverse();
}
