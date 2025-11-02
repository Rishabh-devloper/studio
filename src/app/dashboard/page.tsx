import SummaryCard from "@/components/dashboard/summary-card";
import FinancialChart from "@/components/dashboard/financial-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import BudgetStatus from "@/components/dashboard/budget-status";
import GoalProgress from "@/components/dashboard/goal-progress";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { budgets as budgetsTable, goals as goalsTable, transactions as transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { getMonthlyFinancialData } from "@/app/actions";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    // Public users should land on "/"; safeguard here
    return (
      <div className="prose dark:prose-invert">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p>
          You must be signed in to view your dashboard.
          <a href="/" className="ml-2 underline">Go to landing</a>
        </p>
      </div>
    );
  }

  // Fetch data securely scoped to user
  const [recent, incomeSumRes, expenseSumRes, budgets, goals, monthlyData] = await Promise.all([
    db.query.transactions.findMany({
      where: eq(transactionsTable.userId, userId),
      orderBy: [desc(transactionsTable.date)],
      limit: 5,
    }),
    db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'income' THEN ${transactionsTable.amount} ELSE 0 END), 0)` }).from(transactionsTable).where(eq(transactionsTable.userId, userId)),
    db.select({ sum: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END), 0)` }).from(transactionsTable).where(eq(transactionsTable.userId, userId)),
    db.query.budgets.findMany({ where: eq(budgetsTable.userId, userId) }),
    db.query.goals.findMany({ where: eq(goalsTable.userId, userId) }),
    getMonthlyFinancialData(),
  ]);

  const totalIncome = Number(incomeSumRes?.[0]?.sum ?? 0);
  const totalExpenses = Number(expenseSumRes?.[0]?.sum ?? 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="flex flex-col gap-8" role="main">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <AddTransactionDialog>
          <Button>Add Transaction</Button>
        </AddTransactionDialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Net Balance"
          value={netBalance}
          icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />}
          change={netBalance > 0 ? 12.5 : -5.2}
        />
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
          change={8.2}
        />
        <SummaryCard
          title="Total Expenses"
          value={totalExpenses}
          icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />}
          change={-15.3}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FinancialChart data={monthlyData} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions transactions={recent.map(r => ({
            id: r.id,
            date: r.date?.toString?.() ?? "",
            description: r.description,
            amount: Number(r.amount),
            type: r.type as any,
            category: r.category as any,
          }))} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BudgetStatus budgets={budgets.map(b => ({
          id: b.id,
          category: b.category as any,
          limit: Number(b.limit),
          spent: Number(b.spent),
        }))} />
        <GoalProgress goals={goals.map(g => ({
          id: g.id,
          name: g.name,
          targetAmount: Number(g.targetAmount),
          currentAmount: Number(g.currentAmount),
          deadline: g.deadline?.toString?.() ?? "",
        }))} />
      </div>
    </div>
  );
}
