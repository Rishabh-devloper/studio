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

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  account: string;
};

export function TransactionTabs({
  allTransactions,
  incomeTransactions,
  expenseTransactions,
}: {
  allTransactions: Transaction[];
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
}) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="all">All ({allTransactions.length})</TabsTrigger>
        <TabsTrigger value="income">Income ({incomeTransactions.length})</TabsTrigger>
        <TabsTrigger value="expense">Expense ({expenseTransactions.length})</TabsTrigger>
      </TabsList>

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

function TransactionTable({
  transactions,
  title,
}: {
  transactions: Transaction[];
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
                        {transaction.account}
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
                        {transaction.account}
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
