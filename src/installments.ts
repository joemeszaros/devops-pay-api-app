export interface PaymentQuoteRequest {
  amountMinor: number;
  currency: string;
  outputCurrency: string;
  installments: 1 | 3 | 6;
}

export interface InstallmentLine {
  installmentNumber: number;
  amountMinor: number;
  dueInDays: number;
}

export interface PaymentQuoteResponse {
  requestId: string;
  approved: boolean;
  sourceCurrency: string;
  sourceAmountMinor: number;
  currency: string;
  amountMinor: number;
  exchangeRate: number;
  exchangeRateTimestamp: string;
  installments: number;
  installmentPlan: InstallmentLine[];
  calculatedAt: string;
}

export interface CurrencyConversion {
  sourceCurrency: string;
  sourceAmountMinor: number;
  targetCurrency: string;
  targetAmountMinor: number;
  exchangeRate: number;
  rateTimestamp: string;
}

export function splitIntoInstallments(
  amountMinor: number,
  installments: number
): InstallmentLine[] {
  const baseAmount = Math.floor(amountMinor / installments);
  let remainder = amountMinor % installments;

  return Array.from({ length: installments }, (_, index) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - 1);

    return {
      installmentNumber: index + 1,
      amountMinor: baseAmount + extra,
      dueInDays: index * 30
    };
  });
}

export function buildQuote(
  input: PaymentQuoteRequest,
  conversion: CurrencyConversion,
  requestId: string,
  calculatedAt: string
): PaymentQuoteResponse {
  return {
    requestId,
    approved: true,
    sourceCurrency: conversion.sourceCurrency,
    sourceAmountMinor: conversion.sourceAmountMinor,
    currency: input.outputCurrency,
    amountMinor: conversion.targetAmountMinor,
    exchangeRate: conversion.exchangeRate,
    exchangeRateTimestamp: conversion.rateTimestamp,
    installments: input.installments,
    installmentPlan: splitIntoInstallments(conversion.targetAmountMinor, input.installments),
    calculatedAt
  };
}
