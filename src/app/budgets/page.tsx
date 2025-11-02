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
import { PlusCircle, AlertCircle } from "lucide-react";
import AddBudgetDialog from "@/components/budgets/add-budget-dialog";
import { auth } from "@clerk/nextjs/server";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function BudgetsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="prose dark:prose-invert">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p>
          You must be signed in to view your budgets.
          <a href="/" className="ml-2 underline">Go to landing</a>
        </p>
      </div>
    );
  }

  const budgets = await getAllBudgets();

  return (
    <div className="flex flex-col gap-6 sm:gap-8" role="main">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your monthly spending against your set limits
          </p>
        </div>
        <AddBudgetDialog>
          <Button aria-label="Create new budget">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            New Budget
          </Button>
        </AddBudgetDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
          <CardDescription>
            Monitor your spending categories and stay on track
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <PlusCircle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">No budgets yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first budget to start tracking spending
                </p>
                <AddBudgetDialog>
                  <Button className="mt-4" aria-label="Create first budget">
                    <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Create Budget
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
                const isNearLimit = progress >= 80;
                const isOverLimit = progress >= 100;

                return (
                  <article
                    key={budget.id}
                    className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold">{budget.category}</h3>
                      <span
                        className={`text-lg font-bold ${
                          isOverLimit
                            ? "text-red-600 dark:text-red-500"
                            : isNearLimit
                            ? "text-orange-600 dark:text-orange-500"
                            : "text-green-600 dark:text-green-500"
                        }`}
                      >
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className="h-3"
                      aria-label={`Budget progress: ${progress.toFixed(0)}%`}
                    />
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="font-medium">
                        {formatCurrency(spent)} <span className="text-muted-foreground">spent</span>
                      </span>
                      <span className="text-muted-foreground">
                        of {formatCurrency(limit)}
                      </span>
                    </div>
                    {isOverLimit && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription className="text-xs">
                          You've exceeded your budget limit
                        </AlertDescription>
                      </Alert>
                    )}
                    {isNearLimit && !isOverLimit && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription className="text-xs">
                          Approaching budget limit
                        </AlertDescription>
                      </Alert>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
