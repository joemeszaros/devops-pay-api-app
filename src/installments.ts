export interface PaymentQuoteRequest {
  amountMinor: number;
  currency: string;
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
  currency: string;
  amountMinor: number;
  installments: number;
  installmentPlan: InstallmentLine[];
  calculatedAt: string;
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
  requestId: string,
  calculatedAt: string
): PaymentQuoteResponse {
  return {
    requestId,
    approved: true,
    currency: input.currency,
    amountMinor: input.amountMinor,
    installments: input.installments,
    installmentPlan: splitIntoInstallments(input.amountMinor, input.installments),
    calculatedAt
  };
}
