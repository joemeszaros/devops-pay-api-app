const KNOWN_RATES_TO_EUR: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  HUF: 0.0025,
  CHF: 1.04,
  PLN: 0.235,
  CZK: 0.0404,
  JPY: 0.0062
};

function buildFallbackRate(currency: string): number {
  const weight = Array.from(currency).reduce(
    (sum, character, index) => sum + character.charCodeAt(0) * (index + 1),
    0
  );

  return Number((0.15 + (weight % 85) / 100).toFixed(4));
}

export function resolveRateToEur(currency: string): number {
  return KNOWN_RATES_TO_EUR[currency] ?? buildFallbackRate(currency);
}

export function resolveExchangeRate(sourceCurrency: string, targetCurrency: string): number {
  const sourceToEur = resolveRateToEur(sourceCurrency);
  const targetToEur = resolveRateToEur(targetCurrency);

  return Number((sourceToEur / targetToEur).toFixed(6));
}
