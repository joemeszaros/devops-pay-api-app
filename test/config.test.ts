import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loadConfig applies tracing defaults", () => {
  const originalEnv = {
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
  };

  delete process.env.OTEL_ENABLED;
  delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

  try {
    const config = loadConfig();

    assert.equal(config.telemetryEnabled, false);
    assert.equal(config.otlpTracesEndpoint, undefined);
  } finally {
    process.env.OTEL_ENABLED = originalEnv.OTEL_ENABLED;
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      originalEnv.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  }
});

test("loadConfig reads tracing environment variables", () => {
  const originalEnv = {
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
  };

  process.env.OTEL_ENABLED = "true";
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
    "http://jaeger.observability.svc.cluster.local:4318/v1/traces";

  try {
    const config = loadConfig();

    assert.equal(config.telemetryEnabled, true);
    assert.equal(
      config.otlpTracesEndpoint,
      "http://jaeger.observability.svc.cluster.local:4318/v1/traces"
    );
  } finally {
    process.env.OTEL_ENABLED = originalEnv.OTEL_ENABLED;
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
      originalEnv.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  }
});
