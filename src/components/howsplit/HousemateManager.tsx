"use client";

import type { Housemate } from '@/types';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound, CirclePlus, UserMinus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface HousemateManagerProps {
  housemates: Housemate[];
  onAddHousemate: (name: string) => void;
  onRemoveHousemate: (id: string) => void;
}

export function HousemateManager({ housemates, onAddHousemate, onRemoveHousemate }: HousemateManagerProps) {
  const [newHousemateName, setNewHousemateName] = useState('');
  const { toast } = useToast();

  const handleAddHousemate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHousemateName.trim() === '') {
      toast({
        title: "Invalid Name",
        description: "Housemate name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (housemates.find(hm => hm.name.toLowerCase() === newHousemateName.trim().toLowerCase())) {
      toast({
        title: "Duplicate Name",
        description: "A housemate with this name already exists.",
        variant: "destructive",
      });
      return;
    }
    onAddHousemate(newHousemateName.trim());
    setNewHousemateName('');
    toast({
      title: "Housemate Added",
      description: `${newHousemateName.trim()} has been added to the household.`,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-2xl">
          <UsersRound className="w-6 h-6 mr-2 text-primary" />
          Household Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddHousemate} className="flex gap-2 mb-4">
          <Input
            type="text"
            value={newHousemateName}
            onChange={(e) => setNewHousemateName(e.target.value)}
            placeholder="Enter new housemate's name"
            className="flex-grow"
            aria-label="New housemate name"
          />
          <Button type="submit" variant="default">
            <CirclePlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </form>
        {housemates.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No housemates added yet. Add some to get started!</p>
        ) : (
          <ul className="space-y-2">
            {housemates.map((housemate) => (
              <li
                key={housemate.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
              >
                <span className="text-secondary-foreground">{housemate.name}</span>
                <Button variant="ghost" size="icon" onClick={() => onRemoveHousemate(housemate.id)} aria-label={`Remove ${housemate.name}`}>
                  <UserMinus className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
