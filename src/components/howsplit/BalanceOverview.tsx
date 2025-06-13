
"use client";

import type { Debt, Housemate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Scale, HandCoins, ArrowRight, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BalanceOverviewProps {
  debts: Debt[];
  onClearAllTransactions: () => void;
  housemates: Housemate[];
  expensesCount: number;
  paymentsCount: number;
  onAddPayment: (fromId: string, toId: string, amount: number) => void;
}

export function BalanceOverview({ 
  debts, 
  onClearAllTransactions, 
  housemates, 
  expensesCount, 
  paymentsCount,
  onAddPayment
}: BalanceOverviewProps) {
  
  const totalTransactions = expensesCount + paymentsCount;

  const handleSettleSpecificDebt = (debt: Debt) => {
    onAddPayment(debt.fromId, debt.toId, debt.amount);
  };

  let mainButtonText = "Mark All as Settled";
  if (debts.length === 0) {
    if (totalTransactions > 0) {
      mainButtonText = "Clear History";
    } else {
      mainButtonText = "All Settled!";
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <Scale className="w-6 h-6 mr-2 text-primary" />
          Balance Overview
        </CardTitle>
        <CardDescription>
          {totalTransactions > 0 
            ? `Summary of who owes whom based on ${totalTransactions} transaction(s).`
            : "No transactions recorded yet. Add expenses or payments to see balances."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {housemates.length === 0 ? (
           <p className="text-muted-foreground text-center py-4">Add housemates to calculate balances.</p>
        ) : totalTransactions === 0 ? (
          <p className="text-muted-foreground text-center py-4">Add some expenses or payments to see the balances.</p>
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
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-primary">
                      ${debt.amount.toFixed(2)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSettleSpecificDebt(debt)}
                      className="px-2 py-1 h-auto"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Settle
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
      {(totalTransactions > 0) && (
        <CardFooter>
          <Button 
            onClick={onClearAllTransactions} 
            className="w-full" 
            variant="default" 
            disabled={totalTransactions === 0}
          >
            <HandCoins className="w-4 h-4 mr-2" />
            {mainButtonText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
