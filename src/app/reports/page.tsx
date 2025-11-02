// src/app/reports/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSpendingByCategory, getAllTransactions } from '@/app/actions';
import { auth } from '@clerk/nextjs/server';
import { ReportsChart } from '@/components/reports/reports-chart';
import { TrendingDown, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your reports</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const [chartData, allTransactions] = await Promise.all([
    getSpendingByCategory(),
    getAllTransactions()
  ]);
  
  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = chartData.length > 0 
    ? chartData.reduce((max, item) => item.value > max.value ? item : max, chartData[0]) 
    : null;
  
  const avgPerTransaction = allTransactions.length > 0
    ? totalSpending / allTransactions.filter(t => t.type === 'expense').length
    : 0;

  return (
    <div className="flex flex-col gap-8" role="main">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                Financial Analytics
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Reports & Analytics
            </h1>
            <p className="mt-2 text-muted-foreground">
              Visualize your spending patterns and financial insights
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spending
            </CardTitle>
            <div className="rounded-lg bg-red-500/10 p-2">
              <DollarSign className="h-4 w-4 text-red-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Category
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingDown className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {topCategory?.category || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topCategory ? formatCurrency(topCategory.value) : 'No expenses yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2">
              <PieChart className="h-4 w-4 text-purple-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {chartData.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active spending categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg per Transaction
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(avgPerTransaction)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average expense amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Spending by Category
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your expenses across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                  <PieChart className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">No expense data yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Start adding expenses to see your spending analytics and insights
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ReportsChart data={chartData} />
              
              {/* Category Breakdown Table */}
              <div className="rounded-lg border">
                <div className="grid grid-cols-3 gap-4 p-4 font-semibold text-sm bg-muted/50">
                  <div>Category</div>
                  <div className="text-right">Amount</div>
                  <div className="text-right">Percentage</div>
                </div>
                {chartData.map((item, index) => {
                  const percentage = ((item.value / totalSpending) * 100).toFixed(1);
                  return (
                    <div 
                      key={item.category} 
                      className={`grid grid-cols-3 gap-4 p-4 text-sm ${
                        index !== chartData.length - 1 ? 'border-b' : ''
                      } hover:bg-muted/30 transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ 
                            backgroundColor: `hsl(${index * 40}, 70%, 50%)` 
                          }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right font-semibold">
                        {formatCurrency(item.value)}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}