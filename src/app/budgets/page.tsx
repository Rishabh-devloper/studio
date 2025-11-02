import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { budgets } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import AddBudgetDialog from "@/components/budgets/add-budget-dialog";

export default function BudgetsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Budgets</h1>
        <AddBudgetDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </AddBudgetDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
          <CardDescription>
            Track your monthly spending against your set limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const progress = (budget.spent / budget.limit) * 100;
              return (
                <div key={budget.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-lg font-semibold">{budget.category}</span>
                    <span
                      className={`text-lg font-bold ${
                        progress > 90 ? "text-red-500" : ""
                      }`}
                    >
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{formatCurrency(budget.spent)} spent</span>
                    <span>{formatCurrency(budget.limit)} limit</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}