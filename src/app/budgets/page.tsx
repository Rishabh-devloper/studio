// src/app/budgets/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllBudgets } from "@/app/actions";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, AlertCircle, PiggyBank, TrendingDown, CheckCircle2, AlertTriangle } from "lucide-react";
import AddBudgetDialog from "@/components/budgets/add-budget-dialog";
import { auth } from "@clerk/nextjs/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default async function BudgetsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your budgets</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const budgets = await getAllBudgets();

  // Calculate stats
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
  const overBudgetCount = budgets.filter(b => (parseFloat(b.spent) / parseFloat(b.limit)) >= 1).length;
  const onTrackCount = budgets.filter(b => (parseFloat(b.spent) / parseFloat(b.limit)) < 0.8).length;

  return (
    <div className="flex flex-col gap-8" role="main">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1">
                <TrendingDown className="h-3 w-3" />
                {budgets.length} Active Budgets
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Budget Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your monthly spending against set limits
            </p>
          </div>
          <AddBudgetDialog>
            <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="h-4 w-4" />
              New Budget
            </Button>
          </AddBudgetDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onTrackCount}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Over Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overBudgetCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets Grid */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Your Budget Categories</CardTitle>
          <CardDescription>
            Monitor your spending across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                  <PiggyBank className="h-10 w-10 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold">No budgets yet</h3>
                <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                  Create your first budget to start tracking spending and stay on top of your finances
                </p>
                <AddBudgetDialog>
                  <Button className="mt-6 gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create Your First Budget
                  </Button>
                </AddBudgetDialog>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
                const spent = Number(budget.spent);
                const limit = Number(budget.limit);
                const progress = (spent / limit) * 100;
                const isOverBudget = progress >= 100;
                const isNearLimit = progress >= 80 && progress < 100;
                const remaining = limit - spent;

                return (
                  <Card
                    key={budget.id}
                    className={`group relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                      isOverBudget 
                        ? 'border-red-500/30 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20' 
                        : isNearLimit 
                        ? 'border-orange-500/30 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20'
                        : 'border-green-500/30 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20'
                    }`}
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-2xl" />
                    
                    <CardHeader className="relative pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{budget.category}</CardTitle>
                        <Badge 
                          variant={isOverBudget ? "destructive" : isNearLimit ? "secondary" : "default"}
                          className="gap-1"
                        >
                          {progress.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative space-y-4">
                      <div>
                        <Progress 
                          value={Math.min(progress, 100)} 
                          className={`h-3 ${
                            isOverBudget 
                              ? '[&>div]:bg-red-500' 
                              : isNearLimit 
                              ? '[&>div]:bg-orange-500' 
                              : '[&>div]:bg-green-500'
                          }`}
                          aria-label={`Budget progress: ${progress.toFixed(0)}%`}
                        />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-semibold">{formatCurrency(spent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-semibold">{formatCurrency(limit)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(remaining))}
                          </span>
                        </div>
                      </div>

                      {isOverBudget && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Over budget by {formatCurrency(Math.abs(remaining))}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {isNearLimit && !isOverBudget && (
                        <Alert className="mt-4 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-xs text-orange-600">
                            {formatCurrency(remaining)} left to spend
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}