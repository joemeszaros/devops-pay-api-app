import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import type { CurrencyExchangeClient } from "./currency-exchange-client.js";
import { buildQuote, type PaymentQuoteRequest } from "./installments.js";
import { recordHttpRequest, recordPaymentQuoteRequest, renderMetrics } from "./metrics.js";

const paymentQuoteSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["amountMinor", "currency", "installments"],
    properties: {
      amountMinor: { type: "integer", minimum: 1 },
      currency: { type: "string", pattern: "^[A-Z]{3}$" },
      installments: { type: "integer", enum: [1, 3, 6] }
    }
  }
} as const;

export interface CreateServerOptions {
  logLevel: string;
  version: string;
  currencyExchangeClient: CurrencyExchangeClient;
}

export function createServer(options: CreateServerOptions): FastifyInstance {
  const server = Fastify({
    logger: {
      level: options.logLevel
    }
  });
  const tracer = trace.getTracer("pay-api");

  server.addHook("onRequest", async () => {
    recordHttpRequest();
  });

  server.addHook("onSend", async (_request, reply, payload) => {
    const activeSpan = trace.getActiveSpan();
    const traceId = activeSpan?.spanContext().traceId;

    if (traceId !== undefined) {
      reply.header("x-trace-id", traceId);
    }

    return payload;
  });

  server.get("/health", async () => ({
    status: "ok"
  }));

  server.get("/ready", async () => ({
    status: "ready",
    version: options.version
  }));

  server.get("/metrics", async (_request, reply) => {
    reply.header("content-type", "text/plain; version=0.0.4");
    return renderMetrics();
  });

  server.post<{ Body: PaymentQuoteRequest }>(
    "/payments/quote",
    { schema: paymentQuoteSchema },
    async (request) => {
      return tracer.startActiveSpan("quote.calculate", async (span) => {
        try {
          recordPaymentQuoteRequest();
          span.setAttributes({
            "pay-api.amount_minor": request.body.amountMinor,
            "pay-api.currency": request.body.currency,
            "pay-api.installments": request.body.installments
          });

          const conversion = await options.currencyExchangeClient.convertToEur({
            sourceCurrency: request.body.currency,
            sourceAmountMinor: request.body.amountMinor
          });

          const quote = buildQuote(
            request.body,
            conversion,
            randomUUID(),
            new Date().toISOString()
          );

          span.setAttributes({
            "pay-api.approved": quote.approved,
            "pay-api.request_id": quote.requestId,
            "pay-api.output_currency": quote.currency,
            "pay-api.output_amount_minor": quote.amountMinor
          });

          return quote;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR
          });
          throw error;
        } finally {
          span.end();
        }
      });
    }
  );

  return server;
}
