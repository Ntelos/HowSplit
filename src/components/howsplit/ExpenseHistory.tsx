
"use client";

import type { Expense, Housemate, Payment } from '@/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, ListChecks, ReceiptText, ArrowRightLeft, CalendarIcon, XCircle, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { useSettings } from '@/contexts/SettingsContext';
import { Badge } from '@/components/ui/badge';

interface DisplayTransaction {
  id: string;
  originalId: string;
  date: Date;
  descriptionText: string;
  detailsText: string;
  participantsText?: string; // New field for participant names
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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { selectedCurrency } = useSettings();

  const getHousemateName = (id: string): string => {
    const housemate = housemates.find(hm => hm.id === id);
    return housemate ? housemate.name : 'Unknown';
  };

  const getParticipantNames = (participantIds: string[]): string => {
    if (!participantIds || participantIds.length === 0) return "N/A";
    return participantIds.map(id => getHousemateName(id)).join(', ');
  };

  let filteredExpenses = expenses;
  let filteredPayments = payments;

  if (startDate) {
    const startFilter = startOfDay(startDate);
    filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= startFilter);
    filteredPayments = filteredPayments.filter(p => new Date(p.date) >= startFilter);
  }

  if (endDate) {
    const endFilter = endOfDay(endDate);
    filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= endFilter);
    filteredPayments = filteredPayments.filter(p => new Date(p.date) <= endFilter);
  }

  const displayTransactions: DisplayTransaction[] = [
    ...filteredExpenses.map(e => ({
      id: `exp-${e.id}`,
      originalId: e.id,
      date: new Date(e.date),
      descriptionText: e.description,
      detailsText: `Paid by ${getHousemateName(e.payerId)}`,
      participantsText: getParticipantNames(e.participantIds),
      amount: e.amount,
      type: 'expense' as 'expense',
      isDeletable: true,
    })),
    ...filteredPayments.map(p => ({
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

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <ListChecks className="w-6 h-6 mr-2 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>
          A log of all recorded expenses and settlements. Filter by date range. Expenses can be deleted.
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>End date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  startDate ? date < startDate : false
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
              <XCircle className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {(startDate || endDate) ? "No transactions found for the selected date range." : "Add expenses or record settlements to see them listed here."}
          </p>
        ) : (
          <ScrollArea className="h-96"> {/* Increased height */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[50px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Shared With</TableHead> {/* New Column Header */}
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
                        <Badge variant="outline" className="border-primary/50 text-primary"><ReceiptText className="w-3 h-3 mr-1 inline-block"/>Expense</Badge> :
                        <Badge variant="outline" className="border-green-600/50 text-green-600"><ArrowRightLeft className="w-3 h-3 mr-1 inline-block"/>Settlement</Badge>
                      }
                    </TableCell>
                    <TableCell className="font-medium">{transaction.descriptionText}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{transaction.detailsText}</TableCell>
                    <TableCell className="text-sm text-muted-foreground"> {/* New Column Cell */}
                      {transaction.type === 'expense' && transaction.participantsText ? (
                        <div className="flex items-center">
                           <Users className="w-3 h-3 mr-1 text-muted-foreground"/>
                           {transaction.participantsText}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">{selectedCurrency.symbol}{transaction.amount.toFixed(2)}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}

