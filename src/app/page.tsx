"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Housemate, Expense, Debt } from '@/types';
import { Header } from '@/components/howsplit/Header';
import { HousemateManager } from '@/components/howsplit/HousemateManager';
import { ExpenseForm } from '@/components/howsplit/ExpenseForm';
import { BalanceOverview } from '@/components/howsplit/BalanceOverview';
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [housemates, setHousemates] = useState<Housemate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const { toast } = useToast();

  const addHousemate = (name: string) => {
    const newHousemate: Housemate = { id: crypto.randomUUID(), name };
    setHousemates((prev) => [...prev, newHousemate]);
  };

  const removeHousemate = (id: string) => {
    // Check if housemate is involved in any expenses
    const isPayer = expenses.some(exp => exp.payerId === id);
    const isParticipant = expenses.some(exp => exp.participantIds.includes(id));

    if (isPayer || isParticipant) {
      toast({
        title: "Cannot Remove Housemate",
        description: "This housemate is involved in existing expenses. Settle debts or remove related expenses first.",
        variant: "destructive",
      });
      return;
    }

    const removedHousemate = housemates.find(hm => hm.id === id);
    setHousemates((prev) => prev.filter((hm) => hm.id !== id));
    if (removedHousemate) {
       toast({
        title: "Housemate Removed",
        description: `${removedHousemate.name} has been removed.`,
      });
    }
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expenseData, id: crypto.randomUUID() };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const calculateAndSetDebts = useCallback(() => {
    if (housemates.length === 0 || expenses.length === 0) {
      setDebts([]);
      return;
    }

    const balances: { [key: string]: number } = {};
    housemates.forEach(hm => balances[hm.id] = 0);

    expenses.forEach(expense => {
      if (expense.amount <= 0 || expense.participantIds.length === 0) return;

      balances[expense.payerId] = (balances[expense.payerId] || 0) + expense.amount;
      const share = expense.amount / expense.participantIds.length;
      expense.participantIds.forEach(participantId => {
        balances[participantId] = (balances[participantId] || 0) - share;
      });
    });

    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    housemates.forEach(hm => {
      const balance = balances[hm.id];
      if (balance < -0.001) { // Epsilon for float comparison
        debtors.push({ id: hm.id, amount: balance });
      } else if (balance > 0.001) {
        creditors.push({ id: hm.id, amount: balance });
      }
    });
    
    debtors.sort((a, b) => a.amount - b.amount); // Most negative first
    creditors.sort((a, b) => b.amount - a.amount); // Most positive first

    const newDebts: Debt[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const amountToTransfer = Math.min(-debtor.amount, creditor.amount);

      if (amountToTransfer < 0.01) { // Skip tiny amounts if they don't effectively change balances
         if (Math.abs(debtor.amount) < 0.01) debtorIndex++;
         if (Math.abs(creditor.amount) < 0.01) creditorIndex++;
         if (Math.abs(debtor.amount) >= 0.01 && Math.abs(creditor.amount) >= 0.01) {
            // Both have significant amounts but min is tiny, means one is almost settled.
            // This situation should ideally not happen with proper sorting and iteration.
            // Force advance to prevent infinite loop on micro-amounts.
            if (Math.abs(debtor.amount) < Math.abs(creditor.amount)) debtorIndex++; else creditorIndex++;
         }
         continue;
      }
      
      const debtorHousemate = housemates.find(hm => hm.id === debtor.id);
      const creditorHousemate = housemates.find(hm => hm.id === creditor.id);

      if (debtorHousemate && creditorHousemate) {
        newDebts.push({
          from: debtorHousemate.name,
          to: creditorHousemate.name,
          amount: amountToTransfer,
        });
      }

      debtor.amount += amountToTransfer;
      creditor.amount -= amountToTransfer;

      if (Math.abs(debtor.amount) < 0.01) {
        debtorIndex++;
      }
      if (Math.abs(creditor.amount) < 0.01) {
        creditorIndex++;
      }
    }
    setDebts(newDebts);
  }, [expenses, housemates]);

  useEffect(() => {
    calculateAndSetDebts();
  }, [calculateAndSetDebts]);

  const settleDebtsHandler = () => {
    setExpenses([]); // This will trigger useEffect to recalculate debts, resulting in an empty debts array.
    toast({
      title: "Debts Settled",
      description: "All outstanding expenses have been cleared.",
    });
  };

  // Load state from localStorage on initial render
  useEffect(() => {
    const storedHousemates = localStorage.getItem('howsplit_housemates');
    if (storedHousemates) {
      setHousemates(JSON.parse(storedHousemates));
    }
    const storedExpenses = localStorage.getItem('howsplit_expenses');
    if (storedExpenses) {
      // Dates need to be parsed correctly from string
      const parsedExpenses = JSON.parse(storedExpenses).map((exp: Expense) => ({
        ...exp,
        date: new Date(exp.date),
      }));
      setExpenses(parsedExpenses);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('howsplit_housemates', JSON.stringify(housemates));
  }, [housemates]);

  useEffect(() => {
    localStorage.setItem('howsplit_expenses', JSON.stringify(expenses));
  }, [expenses]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <HousemateManager housemates={housemates} onAddHousemate={addHousemate} onRemoveHousemate={removeHousemate} />
            <ExpenseForm housemates={housemates} onAddExpense={addExpense} />
          </div>
          <div className="sticky top-8"> {/* Make balance overview sticky on larger screens */}
            <BalanceOverview debts={debts} onSettleDebts={settleDebtsHandler} housemates={housemates} expensesCount={expenses.length}/>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HowSplit. Built with fun by your friendly AI.</p>
      </footer>
    </div>
  );
}
