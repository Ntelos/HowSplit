
"use client";

import type { Expense, Housemate, Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, ListChecks, ReceiptText, ArrowRightLeft } from 'lucide-react';
import { format } from "date-fns";

interface DisplayTransaction {
  id: string;
  originalId: string; // To keep track of original expense/payment id for deletion
  date: Date;
  descriptionText: string;
  detailsText: string;
  amount: number;
  type: 'expense' | 'payment';
  isDeletable: boolean;
}

interface ExpenseHistoryProps {
  expenses: Expense[];
  payments: Payment[];
  housemates: Housemate[];
  onDeleteExpense: (id: string) => void;
}

export function ExpenseHistory({ expenses, payments, housemates, onDeleteExpense }: ExpenseHistoryProps) {
  const getHousemateName = (id: string): string => {
    const housemate = housemates.find(hm => hm.id === id);
    return housemate ? housemate.name : 'Unknown';
  };

  const displayTransactions: DisplayTransaction[] = [
    ...expenses.map(e => ({
      id: `exp-${e.id}`,
      originalId: e.id,
      date: new Date(e.date),
      descriptionText: e.description,
      detailsText: `Paid by ${getHousemateName(e.payerId)}`,
      amount: e.amount,
      type: 'expense' as 'expense',
      isDeletable: true,
    })),
    ...payments.map(p => ({
      id: `pay-${p.id}`,
      originalId: p.id,
      date: new Date(p.date),
      descriptionText: p.description || `Settlement`,
      detailsText: `From ${getHousemateName(p.fromId)} to ${getHousemateName(p.toId)}`,
      amount: p.amount,
      type: 'payment' as 'payment',
      isDeletable: false,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (displayTransactions.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <ListChecks className="w-6 h-6 mr-2 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>No transactions recorded yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Add expenses or record settlements to see them listed here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <ListChecks className="w-6 h-6 mr-2 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>
          A log of all recorded expenses and settlements. Expenses can be deleted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right w-[100px]">Amount</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(transaction.date, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-center">
                    {transaction.type === 'expense' ? 
                      <ReceiptText className="w-5 h-5 mx-auto text-blue-500" title="Expense"/> : 
                      <ArrowRightLeft className="w-5 h-5 mx-auto text-green-500" title="Settlement"/>
                    }
                  </TableCell>
                  <TableCell className="font-medium">{transaction.descriptionText}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{transaction.detailsText}</TableCell>
                  <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {transaction.isDeletable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteExpense(transaction.originalId)}
                        aria-label={`Delete transaction: ${transaction.descriptionText}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
