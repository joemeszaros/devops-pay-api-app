import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import type { AppConfig } from "./config.js";

let sdk: NodeSDK | null = null;

export async function startTelemetry(config: AppConfig): Promise<void> {
  if (!config.telemetryEnabled || !config.otlpTracesEndpoint) {
    return;
  }

  if (sdk !== null) {
    return;
  }

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: config.otlpTracesEndpoint
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  await sdk.start();
}

export async function stopTelemetry(): Promise<void> {
  if (sdk === null) {
    return;
  }

  await sdk.shutdown();
  sdk = null;
}
