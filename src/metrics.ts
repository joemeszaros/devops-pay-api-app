interface MetricsSnapshot {
  totalRequests: number;
  paymentQuoteRequests: number;
}

const metrics: MetricsSnapshot = {
  totalRequests: 0,
  paymentQuoteRequests: 0
};

export function recordHttpRequest(): void {
  metrics.totalRequests += 1;
}

export function recordPaymentQuoteRequest(): void {
  metrics.paymentQuoteRequests += 1;
}

export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.paymentQuoteRequests = 0;
}

export function renderMetrics(): string {
  return [
    "# HELP pay_api_http_requests_total Total HTTP requests processed by the service.",
    "# TYPE pay_api_http_requests_total counter",
    `pay_api_http_requests_total ${metrics.totalRequests}`,
    "# HELP pay_api_payment_quotes_total Total quote calculations requested.",
    "# TYPE pay_api_payment_quotes_total counter",
    `pay_api_payment_quotes_total ${metrics.paymentQuoteRequests}`
  ].join("\n");
}
