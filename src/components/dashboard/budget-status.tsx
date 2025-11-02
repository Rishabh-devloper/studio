import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { Budget } from "@/lib/types";

type BudgetStatusProps = {
  budgets: Budget[];
};

export default function BudgetStatus({ budgets }: BudgetStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
        <CardDescription>
          Track your spending against your set budgets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const progress = (budget.spent / budget.limit) * 100;
            return (
              <div key={budget.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{budget.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent)} /{" "}
                    {formatCurrency(budget.limit)}
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
