"use client";

import {
  Bar,
  BarChart,
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

const chartData = [
  { date: "Jan", income: 4000, expenses: 2400 },
  { date: "Feb", income: 3000, expenses: 1398 },
  { date: "Mar", income: 5000, expenses: 4800 },
  { date: "Apr", income: 4780, expenses: 3908 },
  { date: "May", income: 6890, expenses: 4800 },
  { date: "Jun", income: 5390, expenses: 3800 },
  { date: "Jul", income: 6490, expenses: 4300 },
];

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

export default function FinancialChart() {
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
