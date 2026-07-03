import test from "node:test";
import assert from "node:assert/strict";
import type { CurrencyExchangeClient } from "../src/currency-exchange-client.js";
import { createServer } from "../src/server.js";
import { resetMetrics } from "../src/metrics.js";

function createCurrencyExchangeClientStub(): CurrencyExchangeClient {
  return {
    async convertToEur(input) {
      return {
        sourceCurrency: input.sourceCurrency,
        sourceAmountMinor: input.sourceAmountMinor,
        targetCurrency: "EUR",
        targetAmountMinor: Math.round(input.sourceAmountMinor * 0.01),
        exchangeRate: 0.01,
        rateTimestamp: "2026-07-03T10:00:00.000Z",
        provider: "currency-exchange"
      };
    }
  };
}

test("health and readiness endpoints respond successfully", async () => {
  resetMetrics();
  const server = createServer({
    logLevel: "silent",
    version: "test",
    currencyExchangeClient: createCurrencyExchangeClientStub()
  });

  try {
    const healthResponse = await server.inject({
      method: "GET",
      url: "/health"
    });
    const readyResponse = await server.inject({
      method: "GET",
      url: "/ready"
    });

    assert.equal(healthResponse.statusCode, 200);
    assert.deepEqual(healthResponse.json(), { status: "ok" });
    assert.equal(readyResponse.statusCode, 200);
    assert.deepEqual(readyResponse.json(), {
      status: "ready",
      version: "test"
    });
  } finally {
    await server.close();
  }
});

test("payments quote endpoint validates and returns an installment plan", async () => {
  resetMetrics();
  const server = createServer({
    logLevel: "silent",
    version: "test",
    currencyExchangeClient: createCurrencyExchangeClientStub()
  });

  try {
    const response = await server.inject({
      method: "POST",
      url: "/payments/quote",
      payload: {
        amountMinor: 15_001,
        currency: "HUF",
        installments: 6
      }
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.approved, true);
    assert.equal(body.sourceCurrency, "HUF");
    assert.equal(body.sourceAmountMinor, 15_001);
    assert.equal(body.currency, "EUR");
    assert.equal(body.exchangeRate, 0.01);
    assert.equal(body.installments, 6);
    assert.equal(body.installmentPlan.length, 6);
    assert.equal(
      body.installmentPlan.reduce(
        (total: number, line: { amountMinor: number }) => total + line.amountMinor,
        0
      ),
      150
    );
  } finally {
    await server.close();
  }
});

test("metrics endpoint exposes request counters", async () => {
  resetMetrics();
  const server = createServer({
    logLevel: "silent",
    version: "test",
    currencyExchangeClient: createCurrencyExchangeClientStub()
  });

  try {
    await server.inject({
      method: "GET",
      url: "/health"
    });
    await server.inject({
      method: "POST",
      url: "/payments/quote",
      payload: {
        amountMinor: 9000,
        currency: "EUR",
        installments: 3
      }
    });

    const metricsResponse = await server.inject({
      method: "GET",
      url: "/metrics"
    });

    assert.equal(metricsResponse.statusCode, 200);
    assert.match(metricsResponse.body, /pay_api_http_requests_total 3/);
    assert.match(metricsResponse.body, /pay_api_payment_quotes_total 1/);
  } finally {
    await server.close();
  }
});
