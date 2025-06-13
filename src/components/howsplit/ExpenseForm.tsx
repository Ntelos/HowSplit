"use client";

import type { Housemate, Expense } from '@/types';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { NotebookText, CalendarIcon, Wallet, Users, CirclePlus } from 'lucide-react';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  housemates: Housemate[];
  onAddExpense: (expenseData: Omit<Expense, 'id'>) => void;
}

export function ExpenseForm({ housemates, onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState<string | undefined>(undefined);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleParticipantChange = (housemateId: string) => {
    setParticipantIds((prev) =>
      prev.includes(housemateId)
        ? prev.filter((id) => id !== housemateId)
        : [...prev, housemateId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!description.trim()) {
      toast({ title: "Error", description: "Description cannot be empty.", variant: "destructive" });
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid positive amount.", variant: "destructive" });
      return;
    }
    if (!payerId) {
      toast({ title: "Error", description: "Please select who paid.", variant: "destructive" });
      return;
    }
    if (participantIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one participant.", variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Error", description: "Please select a date for the expense.", variant: "destructive" });
      return;
    }

    onAddExpense({
      description,
      amount: numericAmount,
      payerId,
      participantIds,
      date,
    });

    setDescription('');
    setAmount('');
    setPayerId(undefined);
    setParticipantIds([]);
    setDate(new Date());
    toast({ title: "Expense Added", description: `${description} successfully added.` });
  };
  
  if (housemates.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <NotebookText className="w-6 h-6 mr-2 text-primary" />
            Add New Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Please add housemates first to record expenses.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <NotebookText className="w-6 h-6 mr-2 text-primary" />
          Add New Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="description" className="block text-sm font-medium mb-1">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Groceries, Rent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium mb-1">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="date" className="block text-sm font-medium mb-1">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                    id="date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <Label htmlFor="payer" className="block text-sm font-medium mb-1 flex items-center">
              <Wallet className="w-4 h-4 mr-2"/> Who Paid?
            </Label>
            <Select value={payerId} onValueChange={setPayerId}>
              <SelectTrigger id="payer" aria-label="Select Payer">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {housemates.map((hm) => (
                  <SelectItem key={hm.id} value={hm.id}>
                    {hm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2"/> Participants (Split with)
            </Label>
            <div className="space-y-2 p-3 border rounded-md max-h-40 overflow-y-auto">
              {housemates.map((hm) => (
                <div key={hm.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${hm.id}`}
                    checked={participantIds.includes(hm.id)}
                    onCheckedChange={() => handleParticipantChange(hm.id)}
                  />
                  <Label htmlFor={`participant-${hm.id}`} className="font-normal cursor-pointer">
                    {hm.name}
                  </Label>
                </div>
              ))}
            </div>
             <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto mt-1 text-sm"
                onClick={() => setParticipantIds(housemates.map(hm => hm.id))}
              >
                Select All
              </Button>
              <span className="mx-1 text-muted-foreground">/</span>
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto mt-1 text-sm"
                onClick={() => setParticipantIds([])}
              >
                Deselect All
              </Button>
          </div>

          <Button type="submit" className="w-full" variant="default">
            <CirclePlus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
