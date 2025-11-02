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

  const [recent, budgets, goals, monthlyData, accounts, summary] = await Promise.all([
    getRecentTransactions(5),
    getAllBudgets(),
    getAllGoals(),
    getMonthlyFinancialData(),
    getAllAccounts(),
    getFinancialSummary(),
  ]);

  return (
    <div className="flex flex-col gap-8" role="main">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <AddTransactionDialog accounts={accounts}>
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
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={recent} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialChart data={monthlyData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetStatus budgets={budgets} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalProgress goals={goals} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
