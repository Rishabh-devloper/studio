"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { contributeToGoal } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp } from "lucide-react";

const contributeSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

interface ContributeToGoalDialogProps {
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  children: React.ReactNode;
}

export default function ContributeToGoalDialog({
  goalId,
  goalName,
  currentAmount,
  targetAmount,
  children,
}: ContributeToGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const remaining = targetAmount - currentAmount;

  const form = useForm<z.infer<typeof contributeSchema>>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof contributeSchema>) => {
    const result = await contributeToGoal({
      goalId,
      amount: values.amount,
    });

    if ("error" in result) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    if (result.isComplete) {
      toast({
        title: "🎉 Goal Completed!",
        description: `Congratulations! You've reached your goal of ${formatCurrency(targetAmount)} for "${goalName}"!`,
      });
    } else {
      toast({
        title: "Contribution Added! 💰",
        description: `You added ${formatCurrency(values.amount)} to "${goalName}". Only ${formatCurrency(result.remaining!)} left to go!`,
      });
    }

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Contribute to Goal
          </DialogTitle>
          <DialogDescription>
            Add money to your "{goalName}" goal
          </DialogDescription>
        </DialogHeader>

        {/* Goal Progress Info */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Progress</span>
            <span className="font-semibold">{formatCurrency(currentAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target Amount</span>
            <span className="font-semibold">{formatCurrency(targetAmount)}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-bold text-primary">{formatCurrency(remaining)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick amounts:</p>
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, remaining].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue("amount", amount)}
                    disabled={amount > remaining}
                  >
                    {amount === remaining ? "All" : `₹${amount}`}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">
                Add Contribution
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}