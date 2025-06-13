import { Coins } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 mb-8 text-center border-b">
      <div className="container mx-auto flex items-center justify-center">
        <Coins className="w-10 h-10 mr-3 text-primary" />
        <h1 className="text-4xl font-headline font-bold text-primary">
          HowSplit
        </h1>
      </div>
      <p className="text-muted-foreground mt-2">Share expenses, not headaches.</p>
    </header>
  );
}
