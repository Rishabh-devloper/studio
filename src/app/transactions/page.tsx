import { getAllTransactions, getAllAccounts } from "@/app/actions";
import { auth } from "@clerk/nextjs/server";
import { TransactionTabs } from "@/components/transactions/transaction-tabs";
import { CsvUploadForm } from "@/components/transactions/csv-upload-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { ExportTransactionsButton } from "@/components/transactions/export-transactions-button"; // Import the new component

export default async function TransactionsPage() {
  // Fetch both transactions and accounts in parallel for efficiency.
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

  // Fetch data in parallel.
  const [transactions, accounts] = await Promise.all([
    getAllTransactions(),
    getAllAccounts(),
  ]);

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
          <CsvUploadForm />
          <ExportTransactionsButton /> 
          {/* CORRECTED: The accounts prop is now passed to the dialog. */}
          <AddTransactionDialog accounts={accounts}>
            <Button size="sm" className="h-9 gap-2" aria-label="Add new transaction">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </AddTransactionDialog>
        </div>
      </div>

      <TransactionTabs transactions={transactions} />
    </div>
  );
}