"use client";

import {
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

interface FinancialChartProps {
  data: { date: string; income: number; expenses: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            {payload.map((pld: any) => (
              <span key={pld.dataKey} className="font-bold text-muted-foreground" style={{color: pld.fill}}>{pld.dataKey}</span>
            ))}
          </div>
          <div className="flex flex-col space-y-1">
             <span className="text-[0.70rem] uppercase text-muted-foreground invisible">
              Value
            </span>
             {payload.map((pld: any) => (
              <span key={pld.dataKey} className="font-bold" style={{color: pld.fill}}>
                {formatCurrency(pld.value)}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default function FinancialChart({ data }: FinancialChartProps) {
  // Use provided data or fallback to empty array
  const chartData = data.length > 0 ? data : [
    { date: "Jan", income: 0, expenses: 0 },
    { date: "Feb", income: 0, expenses: 0 },
    { date: "Mar", income: 0, expenses: 0 },
    { date: "Apr", income: 0, expenses: 0 },
    { date: "May", income: 0, expenses: 0 },
    { date: "Jun", income: 0, expenses: 0 },
    { date: "Jul", income: 0, expenses: 0 },
  ];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <Tabs defaultValue="bar">
            <div className="flex justify-end">
                <TabsList>
                    <TabsTrigger value="bar">Bar</TabsTrigger>
                    <TabsTrigger value="line">Line</TabsTrigger>
                    <TabsTrigger value="area">Area</TabsTrigger>
                    <TabsTrigger value="pie">Pie</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="bar">
                <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    />
                    <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}K`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Legend iconSize={10} />
                    <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
                </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="line">
                 <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}K`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--muted))" }} />
                        <Legend iconSize={10}/>
                        <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" name="Income" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="hsl(var(--accent))" name="Expenses" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="area">
                 <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}K`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10}/>
                        <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                        <Area type="monotone" dataKey="expenses" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                    </AreaChart>
                </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="pie">
                <div className="flex flex-col gap-2 items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[{ name: "Income", value: chartData.reduce((s, c) => s + c.income, 0) }, { name: "Expenses", value: Math.abs(chartData.reduce((s, c) => s + c.expenses, 0)) }]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        label
                      >
                        <Cell key="income" fill="hsl(var(--primary))" />
                        <Cell key="expenses" fill="hsl(var(--accent))" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[color:var(--primary)] block" /> Income</div>
                    <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[color:var(--accent)] block" /> Expenses</div>
                  </div>
                </div>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
