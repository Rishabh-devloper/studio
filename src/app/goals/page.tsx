import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { goals } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Target } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import AddGoalDialog from "@/components/goals/add-goal-dialog";

export default function GoalsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Financial Goals</h1>
         <AddGoalDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Goal
            </Button>
        </AddGoalDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>{goal.name}</CardTitle>
                    <CardDescription>
                        Deadline: {format(new Date(goal.deadline), "MMMM dd, yyyy")}
                    </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={progress} />
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                <p className="text-sm text-muted-foreground">
                    Due in {formatDistanceToNow(new Date(goal.deadline))}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}