
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Expense, Housemate } from '@/types';
import type { ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, CalendarDays } from 'lucide-react';
import { format, getYear, getMonth } from 'date-fns';

const chartConfig = {
  totalPaid: {
    label: "Total Paid",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AnalyticsTile({ expenses, housemates }: { expenses: Expense[], housemates: Housemate[] }) {
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Empty string for "All Months"

  const getHousemateName = (id: string): string => housemates.find(hm => hm.id === id)?.name || 'Unknown';

  const availableYears = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    const years = new Set(expenses.map(e => getYear(new Date(e.date)).toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [expenses]);

  const availableMonths = useMemo(() => {
    if (!selectedYear || !expenses) return [];
    const yearNum = parseInt(selectedYear);
    const months = new Set(
      expenses
        .filter(e => getYear(new Date(e.date)) === yearNum)
        .map(e => getMonth(new Date(e.date))) // 0-indexed
    );
    return Array.from(months)
      .sort((a, b) => a - b)
      .map(monthIndex => ({
        value: monthIndex.toString(),
        label: format(new Date(yearNum, monthIndex), 'MMMM')
      }));
  }, [expenses, selectedYear]);

  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (selectedYear) {
        // If the current selectedMonth is not in the new list of availableMonths (or it's the initial load for the year),
        // default to "All Months" or the first available month.
        const currentMonthIsValid = availableMonths.some(m => m.value === selectedMonth);
        if (selectedMonth !== "" && !currentMonthIsValid) {
             setSelectedMonth(""); // Default to "All Months" if current selection is invalid
        }
    } else {
        setSelectedMonth(""); // No year selected, so no specific month
    }
  }, [selectedYear, availableMonths, selectedMonth]);


  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const yearMatch = selectedYear ? getYear(expenseDate).toString() === selectedYear : true;
      // Month match: true if "All Months" (empty string or undefined) or if specific month matches
      const monthMatch = (selectedMonth && selectedMonth !== "") ? getMonth(expenseDate).toString() === selectedMonth : true;
      return yearMatch && monthMatch;
    });
  }, [expenses, selectedYear, selectedMonth]);

  const analyticsData = useMemo(() => {
    const totalSpending = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const spendingByPayerMap = new Map<string, number>();
    filteredExpenses.forEach(exp => {
      const currentAmount = spendingByPayerMap.get(exp.payerId) || 0;
      spendingByPayerMap.set(exp.payerId, currentAmount + exp.amount);
    });

    const spendingByPayerChartData = Array.from(spendingByPayerMap.entries()).map(([payerId, amount]) => ({
      name: getHousemateName(payerId),
      totalPaid: parseFloat(amount.toFixed(2)),
    })).sort((a,b) => b.totalPaid - a.totalPaid);

    return { totalSpending, spendingByPayerChartData };
  }, [filteredExpenses, housemates]);


  if (expenses.length === 0) {
    return (
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <TrendingUp className="w-6 h-6 mr-2 text-primary" />
            Spending Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No expenses recorded yet to analyze.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <TrendingUp className="w-6 h-6 mr-2 text-primary" />
          Spending Analytics
        </CardTitle>
        <CardDescription>
          Overview of spending for the selected period.
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Select value={selectedYear} onValueChange={(value) => { setSelectedYear(value); setSelectedMonth(""); /* Reset month on year change */ }} disabled={availableYears.length === 0}>
            <SelectTrigger className="w-full sm:w-[120px]" aria-label="Select Year">
              <CalendarDays className="w-4 h-4 mr-2 opacity-50" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={!selectedYear}>
            <SelectTrigger className="w-full sm:w-[150px]" aria-label="Select Month">
               <CalendarDays className="w-4 h-4 mr-2 opacity-50" />
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              {selectedYear && <SelectItem value="">All Months</SelectItem>}
              {availableMonths.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Total Spending</h3>
          <p className="text-3xl font-bold text-primary">
            ${analyticsData.totalSpending.toFixed(2)}
          </p>
          {filteredExpenses.length === 0 && (selectedYear || selectedMonth !== "") && (
            <p className="text-sm text-muted-foreground mt-1">No expenses found for this period.</p>
          )}
        </div>
        
        {analyticsData.spendingByPayerChartData.length > 0 ? (
          <div>
            <h3 className="text-lg font-medium mb-2">Spending by Payer</h3>
             <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <BarChart 
                        accessibilityLayer 
                        data={analyticsData.spendingByPayerChartData} 
                        margin={{ top: 5, right: 10, left: -20, bottom: 40 }} // Increased bottom margin for labels
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8} 
                            interval={0}
                            angle={-35}
                            textAnchor="end"
                            height={50} // Give space for angled labels
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            tickFormatter={(value) => `$${value}`} 
                            tickMargin={5} 
                            width={80} 
                            axisLine={false} 
                            tickLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="totalPaid" fill="var(--color-totalPaid)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </div>
          </div>
        ) : filteredExpenses.length > 0 && housemates.length > 0 ? (
             <p className="text-muted-foreground text-center py-4">No payer data for this period's expenses.</p>
        ): null}
      </CardContent>
    </Card>
  );
}

    
