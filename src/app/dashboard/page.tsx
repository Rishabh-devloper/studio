// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import {
  getMonthlyFinancialData,
  getAllAccounts,
  getRecentTransactions,
  getAllBudgets,
  getAllGoals,
  getFinancialSummary
} from "@/app/actions";
import { Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import FinancialChart from "@/components/dashboard/financial-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PiggyBank,
  Activity,
  Calendar,
  CreditCard,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Landing Page</Button>
            </Link>
          </CardContent>
        </Card>
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

  const serializableAccounts = (accounts || []).map((a: any) => ({
    ...a,
    balance: a.balance != null ? Number(a.balance) : 0,
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : null,
  }));

  const recentTransactions = recentRaw.map(t => ({
    ...t,
    amount: parseFloat(t.amount),
    category: t.category as Category
  }));

  // Calculate percentages for visual feedback
  const savingsRate = summary.totalIncome > 0 
    ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1)
    : '0';

  return (
    <div className="flex flex-col gap-8" role="main">
      
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-primary-foreground shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Welcome back!</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Your Financial Overview
            </h1>
            <p className="mt-2 text-sm opacity-90">
              {format(new Date(), "EEEE, MMMM dd, yyyy")}
            </p>
          </div>
          <AddTransactionDialog accounts={serializableAccounts}>
            <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
              <PlusCircle className="h-5 w-5" />
              Add Transaction
            </Button>
          </AddTransactionDialog>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Net Balance Card */}
        <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Balance
              </CardTitle>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(summary.netBalance)}
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Badge variant={Number(savingsRate) > 20 ? "default" : "secondary"} className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {savingsRate}% Savings Rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
              <div className="rounded-lg bg-green-500/10 p-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Money earned this period
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses Card */}
        <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <div className="rounded-lg bg-red-500/10 p-2">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(Math.abs(summary.totalExpenses))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Money spent this period
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Goals
              </CardTitle>
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {goals.length}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {budgets.length} budgets tracked
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Left Column - Chart and Transactions */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          
          {/* Financial Overview Chart */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Financial Trends
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your income and expenses over time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FinancialChart data={monthlyData} />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your latest transactions
                  </CardDescription>
                </div>
                <Link href="/transactions">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <PiggyBank className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">No transactions yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start by adding your first transaction
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${
                          transaction.type === 'income' 
                            ? 'bg-green-500/10' 
                            : 'bg-red-500/10'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {transaction.date}
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Budgets and Goals */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          
          {/* Budget Status */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-primary" />
                    Budget Status
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Track your spending limits
                  </CardDescription>
                </div>
                <Link href="/budgets">
                  <Button variant="outline" size="sm">Manage</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <Target className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">No budgets set</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Create budgets to track your spending
                  </p>
                  <Link href="/budgets">
                    <Button className="mt-4" size="sm">Create Budget</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.slice(0, 4).map((budget) => {
                    const spent = Number(budget.spent);
                    const limit = Number(budget.limit);
                    const progress = (spent / limit) * 100;
                    const isOverBudget = progress >= 100;
                    const isNearLimit = progress >= 80 && progress < 100;

                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              isOverBudget 
                                ? 'bg-red-500' 
                                : isNearLimit 
                                ? 'bg-orange-500' 
                                : 'bg-green-500'
                            }`} />
                            <span className="font-medium">{budget.category}</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(progress, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(spent)}</span>
                          <span>of {formatCurrency(limit)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Financial Goals
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your savings milestones
                  </CardDescription>
                </div>
                <Link href="/goals">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-semibold">No goals yet</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Set financial goals to achieve
                  </p>
                  <Link href="/goals">
                    <Button className="mt-4" size="sm">Create Goal</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {goals.slice(0, 3).map((goal) => {
                    const current = Number(goal.currentAmount);
                    const target = Number(goal.targetAmount);
                    const progress = (current / target) * 100;
                    const isCompleted = progress >= 100;

                    return (
                      <div key={goal.id} className={`rounded-lg border-2 p-4 transition-colors ${
                        isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''
                      }`}>
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{goal.name}</h4>
                            {goal.deadline && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Due {formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          {isCompleted && (
                            <Badge className="bg-green-500">
                              ✓ Completed
                            </Badge>
                          )}
                        </div>
                        <Progress 
                          value={Math.min(progress, 100)} 
                          className="mb-2 h-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{formatCurrency(current)}</span>
                          <span className="text-muted-foreground">
                            of {formatCurrency(target)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}