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
import { and, desc, eq, sql, type InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Transaction Actions ---

type InsertTransaction = InferInsertModel<typeof transactionsTable>;

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

    const signedAmount = (type === "expense" ? -Math.abs(amount) : Math.abs(amount)).toString();

    // Insert the transaction
    await db.insert(transactionsTable).values({
      userId: userId,
      amount: signedAmount,
      type,
      description: values.description,
      category: values.category,
      accountId: account.id,
      accountName: account.name,
      date: values.date ? new Date(values.date).toISOString() : new Date().toISOString(),
    } satisfies typeof transactionsTable.$inferInsert);

    // 🔥 Update budget if this is an expense
    if (type === "expense") {
      // Find budget for this category
      const budget = await db.query.budgets.findFirst({
        where: and(
          eq(budgetsTable.userId, userId),
          eq(budgetsTable.category, values.category)
        ),
      });

      if (budget) {
        // Update the budget's spent amount
        const newSpent = parseFloat(budget.spent) + Math.abs(amount);
        await db
          .update(budgetsTable)
          .set({ spent: newSpent.toString() })
          .where(
            and(
              eq(budgetsTable.id, budget.id),
              eq(budgetsTable.userId, userId)
            )
          );
      }
    }

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

    const formattedTransactions = transactions.map((t): typeof transactionsTable.$inferInsert => ({
      userId: userId,
      description: t.description,
      amount: (t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount)).toString(),
      type: t.type,
      category: t.category || "Uncategorized",
      date: new Date(t.date).toISOString(),
      accountName: defaultAccount.name,
      accountId: defaultAccount.id,
    }));

    await db.insert(transactionsTable).values(formattedTransactions);

    // 🔥 Update budgets for all expense transactions
    const expenseTransactions = transactions.filter(t => t.type === "expense");
    
    // Group expenses by category
    const expensesByCategory = expenseTransactions.reduce((acc, t) => {
      const category = t.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Update each budget
    for (const [category, totalAmount] of Object.entries(expensesByCategory)) {
      const budget = await db.query.budgets.findFirst({
        where: and(
          eq(budgetsTable.userId, userId),
          eq(budgetsTable.category, category)
        ),
      });

      if (budget) {
        const newSpent = parseFloat(budget.spent) + totalAmount;
        await db
          .update(budgetsTable)
          .set({ spent: newSpent.toString() })
          .where(
            and(
              eq(budgetsTable.id, budget.id),
              eq(budgetsTable.userId, userId)
            )
          );
      }
    }

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
async function ensureDefaultAccount(userId: string) {
  const existing = await db.query.accounts.findFirst({
    where: eq(accounts.userId, userId),
  });
  if (!existing) {
    await db.insert(accounts).values({
      userId,
      name: "Main Account",
      balance: "0",
    });
  }
}

export async function getAllAccounts(): Promise<Array<typeof accountsType.$inferSelect>> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    await ensureDefaultAccount(userId);
  } catch (e) {
    console.error("Failed to ensure default account:", e);
  }

  return await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
    orderBy: [desc(accounts.createdAt)],
  });
}

// --- Budget Actions ---

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

    // 🔥 Calculate initial spent amount from existing transactions
    const existingExpenses = await db
      .select({
        total: sql<number>`COALESCE(ABS(SUM(${transactionsTable.amount})), 0)`,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.category, parsed.data.category),
          eq(transactionsTable.type, 'expense')
        )
      );

    const initialSpent = Number(existingExpenses[0]?.total ?? 0);

    await db.insert(budgetsTable).values({
      userId: userId,
      category: parsed.data.category,
      limit: parsed.data.limit.toString(),
      spent: initialSpent.toString(), // Start with existing expenses
    } satisfies typeof budgetsTable.$inferInsert);

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

// --- Goal Actions ---

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
      userId: userId,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount.toString(),
      currentAmount: "0",
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline).toISOString() : null,
    } satisfies typeof goalsTable.$inferInsert);

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

// 🔥 NEW: Contribute to Goal Action
const ContributeToGoalSchema = z.object({
  goalId: z.string().min(1),
  amount: z.number().positive(),
});

export async function contributeToGoal(input: z.infer<typeof ContributeToGoalSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const parsed = ContributeToGoalSchema.safeParse(input);
    if (!parsed.success) return { error: "Invalid data" };

    const { goalId, amount } = parsed.data;

    // Verify goal belongs to user
    const goal = await db.query.goals.findFirst({
      where: and(
        eq(goalsTable.id, goalId),
        eq(goalsTable.userId, userId)
      ),
    });

    if (!goal) {
      return { error: "Goal not found or you don't have permission to access it." };
    }

    // Calculate new current amount
    const newCurrentAmount = parseFloat(goal.currentAmount) + amount;
    const targetAmount = parseFloat(goal.targetAmount);

    // Don't allow contributions that exceed the target
    if (newCurrentAmount > targetAmount) {
      return { 
        error: `Cannot contribute ₹${amount}. This would exceed the goal target by ₹${(newCurrentAmount - targetAmount).toFixed(2)}.` 
      };
    }

    // Update the goal
    await db
      .update(goalsTable)
      .set({ currentAmount: newCurrentAmount.toString() })
      .where(
        and(
          eq(goalsTable.id, goalId),
          eq(goalsTable.userId, userId)
        )
      );

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    // Check if goal is now complete
    const isComplete = newCurrentAmount >= targetAmount;
    
    return { 
      ok: true, 
      isComplete,
      newAmount: newCurrentAmount,
      remaining: targetAmount - newCurrentAmount
    };
  } catch (e) {
    console.error("Failed to contribute to goal:", e);
    return { error: "An unexpected error occurred." };
  }
}

// --- Monthly Financial Data ---

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

// --- AI Category Suggestion ---

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