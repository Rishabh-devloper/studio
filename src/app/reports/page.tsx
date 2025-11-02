"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/lib/types';


const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
        if (!acc[t.category]) {
            acc[t.category] = 0;
        }
        acc[t.category] += Math.abs(t.amount);
        return acc;
    }, {} as Record<Category, number>);

const chartData = Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold md:text-3xl">Reports</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>
                        An overview of your expenses broken down by category.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value as number)} />
                            <YAxis type="category" dataKey="name" width={120} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="value" name="Spending" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}