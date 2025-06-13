
"use client";

import React, { useState } from 'react';
import { Coins, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/settings/SettingsDialog';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="py-6 mb-8 text-center border-b relative">
        <div className="container mx-auto flex items-center justify-center">
          <Coins className="w-10 h-10 mr-3 text-primary" />
          <h1 className="text-4xl font-headline font-bold text-primary">
            HowSplit
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">Share expenses, not headaches.</p>
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
            <Cog className="w-6 h-6" />
          </Button>
        </div>
      </header>
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
