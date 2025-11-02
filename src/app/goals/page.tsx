// src/app/goals/page.tsx - COMPLETE UPDATED VERSION
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
import { PlusCircle, Target, Trophy, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import AddGoalDialog from "@/components/goals/add-goal-dialog";
import ContributeToGoalDialog from "@/components/goals/contribute-to-goal-dialog";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";

export default async function GoalsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your goals</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const goals = await getAllGoals();

  // Calculate stats
  const completedGoals = goals.filter(g => (parseFloat(g.currentAmount as string) / parseFloat(g.targetAmount as string)) >= 1).length;
  const activeGoals = goals.filter(g => (parseFloat(g.currentAmount as string) / parseFloat(g.targetAmount as string)) < 1).length;
  const totalSaved = goals.reduce((sum, g) => sum + parseFloat(g.currentAmount as string), 0);
  const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.targetAmount as string), 0);

  return (
    <div className="flex flex-col gap-8" role="main">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1">
                <Trophy className="h-3 w-3" />
                {goals.length} Financial Goals
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Financial Goals
            </h1>
            <p className="mt-2 text-muted-foreground">
              Set milestones and track your savings progress
            </p>
          </div>
          <AddGoalDialog>
            <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="h-4 w-4" />
              New Goal
            </Button>
          </AddGoalDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSaved)}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTarget)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="border-2">
          <CardContent className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Target className="h-10 w-10 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold">No goals yet</h3>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                Set your first financial goal and start working towards your dreams
              </p>
              <AddGoalDialog>
                <Button className="mt-6 gap-2">
                  <PlusCircle className="h-4 w-4" />
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
            const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

            return (
              <Card
                key={goal.id}
                className={`group relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                  isCompleted 
                    ? 'border-green-500/50 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20' 
                    : isOverdue
                    ? 'border-red-500/50 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-2xl" />
                
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`rounded-lg p-2.5 ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/50'
                          : 'bg-primary/10'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="h-6 w-6 text-green-600" aria-hidden="true" />
                        ) : (
                          <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{goal.name}</CardTitle>
                      </div>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-green-500 shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="shrink-0">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                  
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      {isOverdue ? (
                        <span className="text-red-600 font-medium">
                          Overdue by {Math.abs(daysLeft || 0)} days
                        </span>
                      ) : isCompleted ? (
                        <span className="text-green-600 font-medium">
                          Completed on {format(new Date(goal.deadline), "MMM dd, yyyy")}
                        </span>
                      ) : (
                        <span>
                          {daysLeft ? `${daysLeft} days left` : 'Due today'} • {format(new Date(goal.deadline), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={`h-3 ${
                        isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-primary'
                      }`}
                      aria-label={`Goal progress: ${progress.toFixed(0)}%`}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Saved</div>
                      <div className="text-lg font-bold">{formatCurrency(current)}</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Target</div>
                      <div className="text-lg font-bold">{formatCurrency(target)}</div>
                    </div>
                  </div>

                  {!isCompleted && (
                    <>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(target - current)}
                          </span>
                        </div>
                      </div>
                      
                      {/* 🔥 NEW: Add Money Button */}
                      <ContributeToGoalDialog
                        goalId={goal.id}
                        goalName={goal.name}
                        currentAmount={current}
                        targetAmount={target}
                      >
                        <Button className="w-full gap-2" variant="default">
                          <PlusCircle className="h-4 w-4" />
                          Add Money
                        </Button>
                      </ContributeToGoalDialog>
                    </>
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