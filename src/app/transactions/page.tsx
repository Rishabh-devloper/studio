import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getAllTransactions } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, PlusCircle } from "lucide-react";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { auth } from "@clerk/nextjs/server";
import { TransactionTabs } from "@/components/transactions/transaction-tabs";
import { format } from "date-fns";

export default async function TransactionsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="prose dark:prose-invert">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p>
          You must be signed in to view your transactions.
          <a href="/" className="ml-2 underline">Go to landing</a>
        </p>
      </div>
    );
  }

  const transactions = await getAllTransactions();

  const allTransactions = transactions.map((t) => ({
    id: t.id,
    date: t.date ? format(new Date(t.date), "MMM dd, yyyy") : "",
    description: t.description,
    amount: Number(t.amount),
    type: t.type as "income" | "expense",
    category: t.category,
  }));

  const incomeTransactions = allTransactions.filter((t) => t.type === "income");
  const expenseTransactions = allTransactions.filter((t) => t.type === "expense");

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all your income and expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9 gap-2" aria-label="Export transactions">
            <File className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <AddTransactionDialog>
            <Button size="sm" className="h-9 gap-2" aria-label="Add new transaction">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </AddTransactionDialog>
        </div>
      </div>

      <TransactionTabs
        allTransactions={allTransactions}
        incomeTransactions={incomeTransactions}
        expenseTransactions={expenseTransactions}
      />
    </div>
  );
}
