import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loadConfig applies tracing defaults", () => {
  const originalEnv = {
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    CURRENCY_EXCHANGE_BASE_URL: process.env.CURRENCY_EXCHANGE_BASE_URL
  };

  delete process.env.OTEL_ENABLED;
  delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  delete process.env.CURRENCY_EXCHANGE_BASE_URL;

  try {
    const config = loadConfig();

    assert.equal(config.telemetryEnabled, false);
    assert.equal(config.otlpTracesEndpoint, undefined);
    assert.equal(config.currencyExchangeBaseUrl, "http://127.0.0.1:3100");
  } finally {
    process.env.OTEL_ENABLED = originalEnv.OTEL_ENABLED;
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      originalEnv.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    process.env.CURRENCY_EXCHANGE_BASE_URL = originalEnv.CURRENCY_EXCHANGE_BASE_URL;
  }
});

test("loadConfig reads tracing environment variables", () => {
  const originalEnv = {
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    CURRENCY_EXCHANGE_BASE_URL: process.env.CURRENCY_EXCHANGE_BASE_URL
  };

  process.env.OTEL_ENABLED = "true";
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
    "http://jaeger.observability.svc.cluster.local:4318/v1/traces";
  process.env.CURRENCY_EXCHANGE_BASE_URL =
    "http://currency-exchange.pay-api-prod.svc.cluster.local";

  try {
    const config = loadConfig();

    assert.equal(config.telemetryEnabled, true);
    assert.equal(
      config.otlpTracesEndpoint,
      "http://jaeger.observability.svc.cluster.local:4318/v1/traces"
    );
    assert.equal(
      config.currencyExchangeBaseUrl,
      "http://currency-exchange.pay-api-prod.svc.cluster.local"
    );
  } finally {
    process.env.OTEL_ENABLED = originalEnv.OTEL_ENABLED;
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      originalEnv.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    process.env.CURRENCY_EXCHANGE_BASE_URL = originalEnv.CURRENCY_EXCHANGE_BASE_URL;
  }
});
