
"use client";

import type { Expense, Housemate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, ListChecks } from 'lucide-react';
import { format } from "date-fns";

interface ExpenseHistoryProps {
  expenses: Expense[];
  housemates: Housemate[];
  onDeleteExpense: (id: string) => void;
}

export function ExpenseHistory({ expenses, housemates, onDeleteExpense }: ExpenseHistoryProps) {
  const getPayerName = (payerId: string) => {
    const payer = housemates.find(hm => hm.id === payerId);
    return payer ? payer.name : 'Unknown Payer';
  };

  if (expenses.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <ListChecks className="w-6 h-6 mr-2 text-primary" />
            Expense History
          </CardTitle>
          <CardDescription>No expenses recorded yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Add some expenses to see them listed here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <ListChecks className="w-6 h-6 mr-2 text-primary" />
          Expense History
        </CardTitle>
        <CardDescription>
          A log of all recorded expenses. You can delete entries if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{getPayerName(expense.payerId)}</TableCell>
                  <TableCell>{format(new Date(expense.date), "PPP")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteExpense(expense.id)}
                      aria-label={`Delete expense: ${expense.description}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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
