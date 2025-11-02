"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { transactions as transactionsTable } from "@/db/schema";
import { format } from "date-fns";

// FINAL FIX: The type used by the TransactionTable component.
// The 'amount' is a number because we convert it from a string before passing it down.
type FormattedTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number; // This must be a number to match the processed data.
  type: "income" | "expense";
  category: string;
  accountName: string | null;
};

// The props for the main component accept the raw database type, where amount is a string.
export function TransactionTabs({
  transactions,
}: {
  transactions: (typeof transactionsTable.$inferSelect)[];
}) {

  // 1. Process the raw data, converting the string amount to a number.
  const allTransactions: FormattedTransaction[] = transactions.map((t) => ({
    id: t.id,
    date: t.date ? format(new Date(t.date), "MMM dd, yyyy") : "",
    description: t.description,
    amount: Number(t.amount), // Convert string from DB to number for calculations/formatting.
    type: t.type as "income" | "expense",
    category: t.category,
    accountName: t.accountName
  }));

  // 2. Filter the processed data.
  const incomeTransactions = allTransactions.filter((t) => t.type === "income");
  const expenseTransactions = allTransactions.filter((t) => t.type === "expense");

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="all">All ({allTransactions.length})</TabsTrigger>
        <TabsTrigger value="income">Income ({incomeTransactions.length})</TabsTrigger>
        <TabsTrigger value="expense">Expense ({expenseTransactions.length})</TabsTrigger>
      </TabsList>

      {/* 3. Pass the correctly typed and processed data to the table component. */}
      <TabsContent value="all" className="mt-6">
        <TransactionTable transactions={allTransactions} title="All Transactions" />
      </TabsContent>
      <TabsContent value="income" className="mt-6">
        <TransactionTable transactions={incomeTransactions} title="Income Transactions" />
      </TabsContent>
      <TabsContent value="expense" className="mt-6">
        <TransactionTable transactions={expenseTransactions} title="Expense Transactions" />
      </TabsContent>
    </Tabs>
  );
}

// The table component now correctly receives the FormattedTransaction type where amount is a number.
function TransactionTable({
  transactions,
  title,
}: {
  transactions: FormattedTransaction[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {transactions.length === 0
            ? "No transactions found."
            : `Showing ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first transaction to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {transaction.category} • {transaction.date}
                      </div>
                      <div className="text-sm text-muted-foreground hidden md:inline lg:hidden">
                        {transaction.accountName}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={transaction.type === "income" ? "default" : "secondary"}
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div>{transaction.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.accountName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          transaction.type === "income"
                            ? "font-semibold text-green-600 dark:text-green-500"
                            : "font-semibold text-red-600 dark:text-red-500"
                        }
                      >
                        {/* This now correctly receives a number */}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
