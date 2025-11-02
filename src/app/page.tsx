import SummaryCard from "@/components/dashboard/summary-card";
import FinancialChart from "@/components/dashboard/financial-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import BudgetStatus from "@/components/dashboard/budget-status";
import GoalProgress from "@/components/dashboard/goal-progress";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import {
  totalIncome,
  totalExpenses,
  netBalance,
  transactions,
  budgets,
  goals,
} from "@/lib/data";
import {
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <AddTransactionDialog>
          <Button>Add Transaction</Button>
        </AddTransactionDialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Net Balance"
          value={netBalance}
          icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />}
          change={netBalance > 0 ? 12.5 : -5.2}
        />
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
          change={8.2}
        />
        <SummaryCard
          title="Total Expenses"
          value={totalExpenses}
          icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />}
          change={-15.3}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FinancialChart />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transactions.slice(0, 5)} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BudgetStatus budgets={budgets} />
        <GoalProgress goals={goals} />
      </div>
    </div>
  );
}