// src/app/transactions/page.tsx
import { getAllTransactions, getAllAccounts } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import { TransactionTabs } from "@/components/transactions/transaction-tabs";
import { CsvUploadForm } from "@/components/transactions/csv-upload-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, Wallet, TrendingUp } from "lucide-react";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { ExportTransactionsButton } from "@/components/transactions/export-transactions-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function TransactionsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your transactions</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const [transactions, accounts] = await Promise.all([
    getAllTransactions(),
    getAllAccounts(),
  ]);

  // Calculate quick stats
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {transactions.length} Transactions
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Transaction History
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track and manage all your financial transactions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AddTransactionDialog accounts={accounts}>
              <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>
            </AddTransactionDialog>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Import Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CsvUploadForm />
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExportTransactionsButton />
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <TransactionTabs transactions={transactions} />
    </div>
  );
}