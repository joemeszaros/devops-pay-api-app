import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
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
}

export function createServer(options: CreateServerOptions): FastifyInstance {
  const server = Fastify({
    logger: {
      level: options.logLevel
    }
  });

  server.addHook("onRequest", async () => {
    recordHttpRequest();
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
      recordPaymentQuoteRequest();

      return buildQuote(
        request.body,
        randomUUID(),
        new Date().toISOString()
      );
    }
  );

  return server;
}
