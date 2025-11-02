
"use client";

import { useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { getCategorySuggestion } from "@/app/actions";
import { Wand2 } from "lucide-react";
import { transactions } from "@/lib/data";
import type { Category } from "@/lib/types";

const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
});

const categories: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Rent",
  "Salary",
  "Shopping",
  "Travel",
  "Other",
];

export function AddTransactionDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type: "expense",
      category: "",
    },
  });

  const handleGetSuggestion = () => {
    const description = form.getValues("description");
    const amount = form.getValues("amount");
    if (!description || !amount) {
        toast({
            title: "Error",
            description: "Please enter a description and amount to get a suggestion.",
            variant: "destructive",
        });
        return;
    }
    
    startTransition(async () => {
        const result = await getCategorySuggestion(description, amount);
        if (result.error) {
            toast({
                title: "AI Suggestion Failed",
                description: result.error,
                variant: "destructive",
            });
        } else if (result.category) {
            form.setValue("category", result.category);
             toast({
                title: "AI Suggestion",
                description: `We've categorized this as "${result.category}".`,
            });
        }
    });
  };

  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    console.log(values);
    // This is where you would typically call a server action to save the transaction
    transactions.unshift({
        id: `txn_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: values.description,
        amount: values.type === 'expense' ? -values.amount : values.amount,
        type: values.type,
        category: values.category as Category,
        account: "Checking"
    });
    toast({
      title: "Success!",
      description: "Your transaction has been added.",
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee with friends" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <div className="flex gap-2">
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                            {cat}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                     <Button type="button" variant="outline" size="icon" onClick={handleGetSuggestion} disabled={isPending}>
                        <Wand2 className="h-4 w-4" />
                        <span className="sr-only">Get AI Suggestion</span>
                    </Button>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
