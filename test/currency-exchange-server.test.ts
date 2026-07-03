import test from "node:test";
import assert from "node:assert/strict";
import { createCurrencyExchangeServer } from "../src/currency-exchange-server.js";
import { resetCurrencyExchangeMetrics } from "../src/currency-exchange-metrics.js";

test("currency exchange converts known rates to euro", async () => {
  resetCurrencyExchangeMetrics();
  const server = createCurrencyExchangeServer({
    logLevel: "silent",
    version: "test"
  });

  try {
    const response = await server.inject({
      method: "GET",
      url: "/exchange-rates/convert?from=USD&to=EUR&amountMinor=15001"
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.equal(body.sourceCurrency, "USD");
    assert.equal(body.targetCurrency, "EUR");
    assert.equal(body.exchangeRate, 0.92);
    assert.equal(body.targetAmountMinor, 13_801);
  } finally {
    await server.close();
  }
});

test("currency exchange converts between non-euro currencies", async () => {
  resetCurrencyExchangeMetrics();
  const server = createCurrencyExchangeServer({
    logLevel: "silent",
    version: "test"
  });

  try {
    const response = await server.inject({
      method: "GET",
      url: "/exchange-rates/convert?from=USD&to=GBP&amountMinor=15001"
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.equal(body.sourceCurrency, "USD");
    assert.equal(body.targetCurrency, "GBP");
    assert.equal(body.exchangeRate, 0.786325);
    assert.equal(body.targetAmountMinor, 11_796);
  } finally {
    await server.close();
  }
});

test("currency exchange accepts unknown currencies with deterministic demo rate", async () => {
  resetCurrencyExchangeMetrics();
  const server = createCurrencyExchangeServer({
    logLevel: "silent",
    version: "test"
  });

  try {
    const response = await server.inject({
      method: "GET",
      url: "/exchange-rates/convert?from=ABC&to=JPY&amountMinor=1000"
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.equal(body.sourceCurrency, "ABC");
    assert.equal(body.targetCurrency, "JPY");
    assert.equal(typeof body.exchangeRate, "number");
    assert.ok(body.targetAmountMinor > 0);
  } finally {
    await server.close();
  }
});

test("currency exchange metrics endpoint exposes counters", async () => {
  resetCurrencyExchangeMetrics();
  const server = createCurrencyExchangeServer({
    logLevel: "silent",
    version: "test"
  });

  try {
    await server.inject({
      method: "GET",
      url: "/health"
    });
    await server.inject({
      method: "GET",
      url: "/exchange-rates/convert?from=HUF&to=EUR&amountMinor=15001"
    });

    const metricsResponse = await server.inject({
      method: "GET",
      url: "/metrics"
    });

    assert.equal(metricsResponse.statusCode, 200);
    assert.match(metricsResponse.body, /currency_exchange_http_requests_total 3/);
    assert.match(metricsResponse.body, /currency_exchange_conversion_requests_total 1/);
  } finally {
    await server.close();
  }
});
