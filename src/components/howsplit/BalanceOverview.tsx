"use client";

import type { Debt, Housemate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Scale, HandCoins, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BalanceOverviewProps {
  debts: Debt[];
  onSettleDebts: () => void;
  housemates: Housemate[];
  expensesCount: number;
}

export function BalanceOverview({ debts, onSettleDebts, housemates, expensesCount }: BalanceOverviewProps) {
  
  const handleSettle = () => {
    onSettleDebts();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <Scale className="w-6 h-6 mr-2 text-primary" />
          Balance Overview
        </CardTitle>
        <CardDescription>
          {expensesCount > 0 
            ? `Summary of who owes whom based on ${expensesCount} expense(s).`
            : "No expenses recorded yet. Add expenses to see balances."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {housemates.length === 0 ? (
           <p className="text-muted-foreground text-center py-4">Add housemates to calculate balances.</p>
        ) : expensesCount === 0 ? (
          <p className="text-muted-foreground text-center py-4">Add some expenses to see the balances.</p>
        ) : debts.length === 0 ? (
          <p className="text-center py-4 text-green-600 font-medium">All settled up! No outstanding debts.</p>
        ) : (
          <ScrollArea className="h-48">
            <ul className="space-y-3 pr-4">
              {debts.map((debt, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-secondary-foreground">{debt.from}</span>
                    <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
                    <span className="font-medium text-secondary-foreground">{debt.to}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    ${debt.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
      {expensesCount > 0 && (
        <CardFooter>
          <Button onClick={handleSettle} className="w-full" variant="default" disabled={debts.length === 0 && expensesCount === 0}>
            <HandCoins className="w-4 h-4 mr-2" />
            {debts.length === 0 ? "All Settled!" : "Mark All as Settled"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
