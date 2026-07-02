import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.js";
import { resetMetrics } from "../src/metrics.js";

test("health and readiness endpoints respond successfully", async () => {
  resetMetrics();
  const server = createServer({
    logLevel: "silent",
    version: "test"
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
    version: "test"
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
    assert.equal(body.currency, "HUF");
    assert.equal(body.installments, 6);
    assert.equal(body.installmentPlan.length, 6);
    assert.equal(
      body.installmentPlan.reduce(
        (total: number, line: { amountMinor: number }) => total + line.amountMinor,
        0
      ),
      15_001
    );
  } finally {
    await server.close();
  }
});

test("metrics endpoint exposes request counters", async () => {
  resetMetrics();
  const server = createServer({
    logLevel: "silent",
    version: "test"
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
