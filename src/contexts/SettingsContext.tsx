
"use client";

import type { Currency, CurrencyCode } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencies, DEFAULT_CURRENCY_CODE } from '@/types';

interface SettingsContextType {
  selectedCurrency: Currency;
  setSelectedCurrencyCode: (code: CurrencyCode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrencyCode, setSelectedCurrencyCodeState] = useState<CurrencyCode>(DEFAULT_CURRENCY_CODE);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedCurrencyCode = localStorage.getItem('howsplit_currency') as CurrencyCode | null;
    if (storedCurrencyCode && currencies.some(c => c.code === storedCurrencyCode)) {
      setSelectedCurrencyCodeState(storedCurrencyCode);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('howsplit_currency', selectedCurrencyCode);
    }
  }, [selectedCurrencyCode, isInitialized]);

  const setSelectedCurrencyCode = (code: CurrencyCode) => {
    setSelectedCurrencyCodeState(code);
  };

  const selectedCurrency = currencies.find(c => c.code === selectedCurrencyCode) || currencies.find(c => c.code === DEFAULT_CURRENCY_CODE)!;

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ selectedCurrency, setSelectedCurrencyCode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
