interface MetricsSnapshot {
  totalRequests: number;
  conversions: number;
}

const metrics: MetricsSnapshot = {
  totalRequests: 0,
  conversions: 0
};

export function recordCurrencyExchangeHttpRequest(): void {
  metrics.totalRequests += 1;
}

export function recordCurrencyExchangeConversion(): void {
  metrics.conversions += 1;
}

export function resetCurrencyExchangeMetrics(): void {
  metrics.totalRequests = 0;
  metrics.conversions = 0;
}

export function renderCurrencyExchangeMetrics(): string {
  return [
    "# HELP currency_exchange_http_requests_total Total HTTP requests handled.",
    "# TYPE currency_exchange_http_requests_total counter",
    `currency_exchange_http_requests_total ${metrics.totalRequests}`,
    "# HELP currency_exchange_conversion_requests_total Total conversion requests handled.",
    "# TYPE currency_exchange_conversion_requests_total counter",
    `currency_exchange_conversion_requests_total ${metrics.conversions}`
  ].join("\n");
}
