import SummaryCard from "@/components/dashboard/summary-card";
import FinancialChart from "@/components/dashboard/financial-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import BudgetStatus from "@/components/dashboard/budget-status";
import GoalProgress from "@/components/dashboard/goal-progress";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import {
  getMonthlyFinancialData,
  getAllAccounts,
  getRecentTransactions,
  getAllBudgets,
  getAllGoals,
  getFinancialSummary
} from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/lib/types";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="prose dark:prose-invert">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p>You must be signed in to view your dashboard. <a href="/" className="ml-2 underline">Go to landing</a></p>
      </div>
    );
  }

  const [recentRaw, budgets, goals, monthlyData, accounts, summary] = await Promise.all([
    getRecentTransactions(5),
    getAllBudgets(),
    getAllGoals(),
    getMonthlyFinancialData(),
    getAllAccounts(),
    getFinancialSummary(),
  ]);

  // Serialize accounts for passing to client components (no Dates/BigInts)
  const serializableAccounts = (accounts || []).map((a: any) => ({
    ...a,
    // Convert numeric/decimal strings to numbers for UI and ensure dates are strings
    balance: a.balance != null ? Number(a.balance) : 0,
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : null,
  }));

  return (
    <div className="flex flex-col gap-8" role="main">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
  <AddTransactionDialog accounts={serializableAccounts}>
          <Button>Add Transaction</Button>
        </AddTransactionDialog>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <SummaryCard
                title="Net Balance"
                value={summary.netBalance}
                icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />} change={0}
              />
              <SummaryCard
                title="Total Income"
                value={summary.totalIncome}
                icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />} change={0}
              />
              <SummaryCard
                title="Total Expenses"
                value={summary.totalExpenses}
                icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />} change={0}
              />
            </CardContent>
            <CardContent className="pt-0">
              {/* Monthly overview chart placed under the summary for quick glance */}
              <FinancialChart data={monthlyData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={recentRaw.map(t => ({ ...t, amount: parseFloat(t.amount), category: t.category as Category }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetStatus budgets={budgets.map(b => ({ ...b, category: b.category as Category, limit: parseFloat(b.limit), spent: parseFloat(b.spent) }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalProgress goals={goals.map(g => ({ ...g, targetAmount: parseFloat(g.targetAmount as unknown as string), currentAmount: parseFloat(g.currentAmount as unknown as string), deadline: g.deadline || '' }))} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
