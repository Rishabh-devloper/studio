import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllGoals } from "@/app/actions";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { PlusCircle, Target, TrendingUp } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import AddGoalDialog from "@/components/goals/add-goal-dialog";
import { auth } from "@clerk/nextjs/server";

export default async function GoalsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="prose dark:prose-invert">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p>
          You must be signed in to view your goals.
          <a href="/" className="ml-2 underline">Go to landing</a>
        </p>
      </div>
    );
  }

  const goals = await getAllGoals();

  return (
    <div className="flex flex-col gap-6 sm:gap-8" role="main">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Financial Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set and track your financial milestones
          </p>
        </div>
        <AddGoalDialog>
          <Button aria-label="Create new goal">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            New Goal
          </Button>
        </AddGoalDialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-10 w-10 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold">No goals yet</h3>
              <p className="mt-2 text-muted-foreground">
                Set your first financial goal and start working towards it
              </p>
              <AddGoalDialog>
                <Button className="mt-6" aria-label="Create first goal">
                  <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create Your First Goal
                </Button>
              </AddGoalDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const current = Number(goal.currentAmount);
            const target = Number(goal.targetAmount);
            const progress = (current / target) * 100;
            const isCompleted = progress >= 100;
            const isOverdue = goal.deadline && isPast(new Date(goal.deadline)) && !isCompleted;

            return (
              <Card
                key={goal.id}
                className={`group transition-all hover:shadow-lg ${
                  isCompleted ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""
                }`}
              >
                <CardHeader className="space-y-0 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2.5 ${
                          isCompleted
                            ? "bg-green-100 dark:bg-green-900/50"
                            : "bg-primary/10"
                        }`}
                      >
                        <Target
                          className={`h-6 w-6 ${
                            isCompleted
                              ? "text-green-600 dark:text-green-500"
                              : "text-primary"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {goal.deadline && (
                          <CardDescription className="mt-1">
                            {isOverdue ? (
                              <span className="text-red-600 dark:text-red-500">
                                Overdue by {formatDistanceToNow(new Date(goal.deadline))}
                              </span>
                            ) : isCompleted ? (
                              <span className="text-green-600 dark:text-green-500">
                                Completed!
                              </span>
                            ) : (
                              `Due ${formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })}`
                            )}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className="h-2.5"
                      aria-label={`Goal progress: ${progress.toFixed(0)}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="font-semibold">{formatCurrency(current)}</div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Target</div>
                      <div className="font-semibold">{formatCurrency(target)}</div>
                    </div>
                  </div>
                  {goal.deadline && (
                    <div className="text-xs text-muted-foreground">
                      Deadline: {format(new Date(goal.deadline), "MMM dd, yyyy")}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
