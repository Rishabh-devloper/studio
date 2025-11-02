"use server";

import { categorizeTransactions } from "@/ai/flows/categorize-transactions";
import * as z from "zod";
import { db } from "@/db";
import {
  transactions as transactionsTable,
  budgets as budgetsTable,
  goals as goalsTable,
  accounts,
  type accounts as accountsType,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Transaction Actions ---

const AddTxnSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  date: z.string().optional(),
  accountName: z.string().min(1),
});

export async function addTransaction(input: z.infer<typeof AddTxnSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = AddTxnSchema.safeParse(input);
    if (!parsed.success) return { error: "Invalid data" };

    const { amount, type, accountName, ...values } = parsed.data;

    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.userId, userId), eq(accounts.name, accountName)),
    });

    if (!account) {
      return { error: `Account "${accountName}" not found.` };
    }

    const signedAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);

    await db.insert(transactionsTable).values({
      userId,
      amount: signedAmount,
      type,
      ...values,
      accountId: account.id,
      accountName: account.name, 
      date: values.date ? new Date(values.date) : new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/reports");
    revalidatePath("/budgets");
    revalidatePath("/goals");

    return { ok: true };
  } catch (e) {
    console.error("Failed to add transaction:", e);
    return { error: "An unexpected error occurred." };
  }
}

const TransactionBatchSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
});

export async function addTransactions(
  transactions: z.infer<typeof TransactionBatchSchema>[]
) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const userAccounts = await getAllAccounts();
    if (userAccounts.length === 0) {
      return {
        error:
          "You must have at least one account to import transactions. Please add an account and try again.",
      };
    }
    const defaultAccount = userAccounts[0];

    const formattedTransactions = transactions.map((t) => ({
      userId,
      description: t.description,
      amount: t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount),
      type: t.type,
      category: t.category || "Uncategorized",
      date: new Date(t.date),
      accountName: defaultAccount.name,
      accountId: defaultAccount.id,
    }));

    await db.insert(transactionsTable).values(formattedTransactions);

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/reports");
    revalidatePath("/budgets");
    revalidatePath("/goals");
    
    return { ok: true };
  } catch (e) {
    console.error("Failed to add batch transactions:", e);
    return { error: "An unexpected error occurred during the import." };
  }
}

export async function getRecentTransactions(limit = 5) {
  const { userId } = await auth();
  if (!userId) return [];
  return await db.query.transactions.findMany({
    where: eq(transactionsTable.userId, userId),
    orderBy: [desc(transactionsTable.date)],
    limit,
  });
}

export async function getAllTransactions() {
  const { userId } = await auth();
  if (!userId) return [];
  return await db.query.transactions.findMany({
    where: eq(transactionsTable.userId, userId),
    orderBy: [desc(transactionsTable.date)],
  });
}

export async function getFinancialSummary() {
  const { userId } = await auth();
  if (!userId) {
    return { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  }

  const [incomeRes, expenseRes] = await Promise.all([
    db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'income' THEN ${transactionsTable.amount} ELSE 0 END), 0)` }).from(transactionsTable).where(eq(transactionsTable.userId, userId)),
    db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END), 0)` }).from(transactionsTable).where(eq(transactionsTable.userId, userId)),
  ]);

  const totalIncome = Number(incomeRes?.[0]?.sum ?? 0);
  const totalExpenses = Number(expenseRes?.[0]?.sum ?? 0);
  const netBalance = totalIncome + totalExpenses;

  return { totalIncome, totalExpenses, netBalance };
}

export async function getSpendingByCategory() {
  const { userId } = await auth();
  if (!userId) return [];

  const result = await db
    .select({
      category: transactionsTable.category,
      value: sql<number>`abs(sum(${transactionsTable.amount}))`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.type, 'expense')
      )
    )
    .groupBy(transactionsTable.category)
    .orderBy(desc(sql`sum(${transactionsTable.amount})`));

  return result;
}


// --- Account Actions ---

export async function getAllAccounts(): Promise<Array<typeof accountsType.$inferSelect>> {
  const { userId } = await auth();
  if (!userId) return [];
  return await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
    orderBy: [desc(accounts.createdAt)],
  });
}

// --- Budget, Goal, and other actions remain the same ---

const AddBudgetSchema = z.object({
  category: z.string().min(1),
  limit: z.number().positive(),
});

export async function addBudget(input: z.infer<typeof AddBudgetSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = AddBudgetSchema.safeParse(input);
    if (!parsed.success) return { error: "Invalid data" };

    await db.insert(budgetsTable).values({
      userId,
      category: parsed.data.category,
      limit: parsed.data.limit,
      spent: 0,
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("Failed to add budget:", e);
    return { error: "An unexpected error occurred." };
  }
}

export async function getAllBudgets() {
  const { userId } = await auth();
  if (!userId) return [];
  return await db.query.budgets.findMany({
    where: eq(budgetsTable.userId, userId),
  });
}

const AddGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  deadline: z.string().optional(),
});

export async function addGoal(input: z.infer<typeof AddGoalSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = AddGoalSchema.safeParse(input);
    if (!parsed.success) return { error: "Invalid data" };

    await db.insert(goalsTable).values({
      userId,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currentAmount: 0,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("Failed to add goal:", e);
    return { error: "An unexpected error occurred." };
  }
}

export async function getAllGoals() {
  const { userId } = await auth();
  if (!userId) return [];
  return await db.query.goals.findMany({
    where: eq(goalsTable.userId, userId),
  });
}

// ... other utility and report functions ...

export async function getMonthlyFinancialData() {
  const { userId } = await auth();
  if (!userId) return [];

  const allTxns = await db.query.transactions.findMany({
    where: eq(transactionsTable.userId, userId),
    orderBy: [desc(transactionsTable.date)],
  });

  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

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

  return Object.entries(monthlyData)
    .map(([date, data]) => ({ date, ...data }))
    .slice(0, 7)
    .reverse();
}

export async function getCategorySuggestion(description: string, amount: number) {
  try {
    const validation = z
      .object({ description: z.string(), amount: z.number() })
      .safeParse({ description, amount });
    if (!validation.success) return { error: "Invalid input." };

    const result = await categorizeTransactions({
      transactionDescription: validation.data.description,
      transactionAmount: validation.data.amount,
    });
    return { category: result.category };
  } catch (e) {
    console.error(e);
    return { error: "Failed to get suggestion. Please try again." };
  }
}
