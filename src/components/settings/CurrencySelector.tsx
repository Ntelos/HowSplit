
"use client";

import * as React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { currencies } from "@/types";
import type { CurrencyCode } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrencyCode } = useSettings();

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="currency-select">Currency</Label>
      <Select
        value={selectedCurrency.code}
        onValueChange={(value) => setSelectedCurrencyCode(value as CurrencyCode)}
      >
        <SelectTrigger id="currency-select">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
