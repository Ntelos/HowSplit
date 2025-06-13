
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Housemate, Expense, Debt, Payment } from '@/types';
import { Header } from '@/components/howsplit/Header';
import { HousemateManager } from '@/components/howsplit/HousemateManager';
import { ExpenseForm } from '@/components/howsplit/ExpenseForm';
import { BalanceOverview } from '@/components/howsplit/BalanceOverview';
import { ExpenseHistory } from '@/components/howsplit/ExpenseHistory';
import { AnalyticsTile } from '@/components/howsplit/AnalyticsTile';
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [housemates, setHousemates] = useState<Housemate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const { toast } = useToast();

  const addHousemate = (name: string) => {
    const newHousemate: Housemate = { id: crypto.randomUUID(), name };
    setHousemates((prev) => [...prev, newHousemate]);
  };

  const removeHousemate = (id: string) => {
    const isPayerInExpenses = expenses.some(exp => exp.payerId === id);
    const isParticipantInExpenses = expenses.some(exp => exp.participantIds.includes(id));
    const isPayerInPayments = payments.some(p => p.fromId === id);
    const isRecipientInPayments = payments.some(p => p.toId === id);

    if (isPayerInExpenses || isParticipantInExpenses || isPayerInPayments || isRecipientInPayments) {
      toast({
        title: "Cannot Remove Housemate",
        description: "This housemate is involved in existing expenses or payments. Settle debts or remove related transactions first.",
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

  const deleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(exp => exp.id === id);
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    if (expenseToDelete) {
      toast({
        title: "Expense Deleted",
        description: `Expense "${expenseToDelete.description}" has been deleted.`,
      });
    }
  };

  const addPayment = (fromId: string, toId: string, amount: number) => {
    const fromHousemate = housemates.find(hm => hm.id === fromId);
    const toHousemate = housemates.find(hm => hm.id === toId);

    if (!fromHousemate || !toHousemate) {
      toast({ title: "Error", description: "Invalid housemate ID for payment.", variant: "destructive" });
      return;
    }

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      fromId,
      toId,
      amount,
      date: new Date(),
      description: `Settlement from ${fromHousemate.name} to ${toHousemate.name}`,
    };
    setPayments((prev) => [...prev, newPayment]);
    toast({
      title: "Payment Recorded",
      description: `Payment of $${amount.toFixed(2)} from ${fromHousemate.name} to ${toHousemate.name} recorded.`,
    });
  };

  const calculateAndSetDebts = useCallback(() => {
    if (housemates.length === 0) {
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

    payments.forEach(payment => {
      balances[payment.fromId] = (balances[payment.fromId] || 0) + payment.amount; 
      balances[payment.toId] = (balances[payment.toId] || 0) - payment.amount;    
    });

    const debtorsList: { id: string; amount: number }[] = [];
    const creditorsList: { id: string; amount: number }[] = [];

    housemates.forEach(hm => {
      const balance = balances[hm.id];
      // Using a small epsilon to handle floating point inaccuracies
      if (balance < -0.001) { 
        debtorsList.push({ id: hm.id, amount: balance });
      } else if (balance > 0.001) {
        creditorsList.push({ id: hm.id, amount: balance });
      }
    });
    
    debtorsList.sort((a, b) => a.amount - b.amount); // Most negative first
    creditorsList.sort((a, b) => b.amount - a.amount); // Most positive first

    const newDebts: Debt[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtorsList.length && creditorIndex < creditorsList.length) {
      const currentDebtor = debtorsList[debtorIndex];
      const currentCreditor = creditorsList[creditorIndex];
      
      // Amount to transfer is the minimum of what the debtor owes or what the creditor is owed
      const amountToTransfer = Math.min(-currentDebtor.amount, currentCreditor.amount);

      // If the amount to transfer is negligible, advance pointers accordingly
      if (amountToTransfer < 0.01) { // Use a small epsilon for comparison
        let advanced = false;
        if (Math.abs(currentDebtor.amount) < 0.01) {
          debtorIndex++;
          advanced = true;
        }
        if (Math.abs(currentCreditor.amount) < 0.01) {
          creditorIndex++;
           advanced = true;
        }
        // If neither was negligible enough to advance, advance the one closer to zero
        // or arbitrarily advance one if they are similarly small but not zero.
        if (!advanced) {
            if (Math.abs(currentDebtor.amount) < Math.abs(currentCreditor.amount)) {
                debtorIndex++;
            } else {
                creditorIndex++;
            }
        }
        continue; 
      }
      
      const debtorHousemate = housemates.find(hm => hm.id === currentDebtor.id);
      const creditorHousemate = housemates.find(hm => hm.id === currentCreditor.id);

      if (debtorHousemate && creditorHousemate) {
        newDebts.push({
          from: debtorHousemate.name,
          fromId: debtorHousemate.id,
          to: creditorHousemate.name,
          toId: creditorHousemate.id,
          amount: amountToTransfer,
        });
      }

      // Update balances directly in the lists
      currentDebtor.amount += amountToTransfer;
      currentCreditor.amount -= amountToTransfer;

      // If a debtor's balance is settled (or very close to zero), move to the next debtor
      if (Math.abs(currentDebtor.amount) < 0.01) {
        debtorIndex++;
      }
      // If a creditor has received all they are owed (or very close to zero), move to the next creditor
      if (Math.abs(currentCreditor.amount) < 0.01) {
        creditorIndex++;
      }
    }
    setDebts(newDebts);
  }, [expenses, payments, housemates]);

  useEffect(() => {
    calculateAndSetDebts();
  }, [calculateAndSetDebts]);

  const clearAllTransactionsHandler = () => {
    setExpenses([]);
    setPayments([]);
    toast({
      title: "All Data Cleared",
      description: "All expenses and payments have been cleared.",
    });
  };

  useEffect(() => {
    const storedHousemates = localStorage.getItem('howsplit_housemates');
    if (storedHousemates) {
      setHousemates(JSON.parse(storedHousemates));
    }
    const storedExpenses = localStorage.getItem('howsplit_expenses');
    if (storedExpenses) {
      const parsedExpenses = JSON.parse(storedExpenses).map((exp: Expense) => ({
        ...exp,
        date: new Date(exp.date),
      }));
      setExpenses(parsedExpenses);
    }
    const storedPayments = localStorage.getItem('howsplit_payments');
    if (storedPayments) {
      const parsedPayments = JSON.parse(storedPayments).map((p: Payment) => ({
        ...p,
        date: new Date(p.date),
      }));
      setPayments(parsedPayments);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('howsplit_housemates', JSON.stringify(housemates));
  }, [housemates]);

  useEffect(() => {
    localStorage.setItem('howsplit_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('howsplit_payments', JSON.stringify(payments));
  }, [payments]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <HousemateManager housemates={housemates} onAddHousemate={addHousemate} onRemoveHousemate={removeHousemate} />
            <ExpenseForm housemates={housemates} onAddExpense={addExpense} />
            <ExpenseHistory 
              expenses={expenses} 
              payments={payments} 
              housemates={housemates} 
              onDeleteExpense={deleteExpense} 
            />
          </div>
          <div className="sticky top-8 space-y-8">
            <BalanceOverview 
              debts={debts} 
              onClearAllTransactions={clearAllTransactionsHandler} 
              housemates={housemates} 
              expensesCount={expenses.length}
              paymentsCount={payments.length}
              onAddPayment={addPayment}
            />
            <AnalyticsTile expenses={expenses} housemates={housemates} />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HowSplit. Built with fun by your friendly AI.</p>
      </footer>
    </div>
  );
}

    