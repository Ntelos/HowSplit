
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Housemate, Expense, Debt, Payment } from '@/types';
import { Header } from '@/components/howsplit/Header';
import { HousemateManager } from '@/components/howsplit/HousemateManager';
import { ExpenseForm } from '@/components/howsplit/ExpenseForm';
import { BalanceOverview } from '@/components/howsplit/BalanceOverview';
import { ExpenseHistory } from '@/components/howsplit/ExpenseHistory';
import { useToast } from "@/hooks/use-toast";
import { useSettings } from '@/contexts/SettingsContext';

export default function HomePage() {
  const [housemates, setHousemates] = useState<Housemate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const { toast } = useToast();
  const { selectedCurrency } = useSettings();

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
     if (amount <= 0) {
      toast({ title: "Error", description: "Payment amount must be positive.", variant: "destructive" });
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
      description: `Payment of ${selectedCurrency.symbol}${amount.toFixed(2)} from ${fromHousemate.name} to ${toHousemate.name} recorded.`,
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
      if (balance < -0.001) { // Owed amount, rounded slightly to avoid floating point issues
        debtorsList.push({ id: hm.id, amount: balance });
      } else if (balance > 0.001) { // Due amount
        creditorsList.push({ id: hm.id, amount: balance });
      }
    });

    debtorsList.sort((a, b) => a.amount - b.amount); 
    creditorsList.sort((a, b) => b.amount - a.amount); 

    const newDebts: Debt[] = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtorsList.length && creditorIndex < creditorsList.length) {
      const currentDebtor = debtorsList[debtorIndex];
      const currentCreditor = creditorsList[creditorIndex];
      
      if (!currentDebtor || !currentCreditor) break; // Safety check

      const amountToTransfer = Math.min(-currentDebtor.amount, currentCreditor.amount);

      if (amountToTransfer < 0.01) {
         if (Math.abs(currentDebtor.amount) < 0.01) {
            debtorIndex++;
         }
         if (Math.abs(currentCreditor.amount) < 0.01) {
            creditorIndex++;
         }
         if (debtorIndex >= debtorsList.length || creditorIndex >= creditorsList.length) break;
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
      
      // Directly update the amounts in the lists
      debtorsList[debtorIndex].amount += amountToTransfer;
      creditorsList[creditorIndex].amount -= amountToTransfer;

      if (Math.abs(debtorsList[debtorIndex].amount) < 0.01) {
        debtorIndex++;
      }
      if (Math.abs(creditorsList[creditorIndex].amount) < 0.01) {
        creditorIndex++;
      }
    }
    setDebts(newDebts);
  }, [expenses, payments, housemates]);

  useEffect(() => {
    calculateAndSetDebts();
  }, [calculateAndSetDebts]);

  const handleClearHistory = () => {
    setExpenses([]);
    setPayments([]);
    toast({
      title: "All Data Cleared",
      description: "All expenses and payments have been cleared.",
    });
  };

  const handleSettleAllDebts = () => {
    if (debts.length === 0) {
      toast({
        title: "No Debts",
        description: "There are no outstanding debts to settle.",
      });
      return;
    }
    // Create a copy of debts to iterate over, as addPayment will trigger re-calculation and modify `debts` state
    const currentDebtsToSettle = [...debts];
    currentDebtsToSettle.forEach(debt => {
      // Ensure housemates still exist before attempting to add payment
      const fromHousemateExists = housemates.some(hm => hm.id === debt.fromId);
      const toHousemateExists = housemates.some(hm => hm.id === debt.toId);
      if (fromHousemateExists && toHousemateExists) {
        addPayment(debt.fromId, debt.toId, debt.amount);
      } else {
         toast({
            title: "Skipped Settlement",
            description: `Could not settle debt from ${debt.from} to ${debt.to} as one or both housemates no longer exist.`,
            variant: "destructive"
        });
      }
    });
    // Check if any debts were actually processed to avoid misleading toast
    if (currentDebtsToSettle.length > 0) {
        toast({
            title: "Debts Settled",
            description: "Attempted to settle all outstanding debts by recording payments.",
        });
    }
    // Recalculation will happen due to state changes in payments.
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
        <div className="space-y-8">
           <BalanceOverview
            debts={debts}
            onSettleAllDebts={handleSettleAllDebts}
            onClearHistory={handleClearHistory}
            housemates={housemates}
            expensesCount={expenses.length}
            paymentsCount={payments.length}
            onAddPayment={addPayment}
          />
          <ExpenseForm housemates={housemates} onAddExpense={addExpense} />
          <ExpenseHistory
            expenses={expenses}
            payments={payments}
            housemates={housemates}
            onDeleteExpense={deleteExpense}
          />
          <HousemateManager housemates={housemates} onAddHousemate={addHousemate} onRemoveHousemate={removeHousemate} />
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HowSplit. Built with fun by your friendly AI.</p>
      </footer>
    </div>
  );
}

    