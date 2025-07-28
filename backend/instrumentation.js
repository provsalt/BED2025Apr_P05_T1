import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes} from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {logInfo} from "./utils/logger.js";
import {OTLPLogExporter} from "@opentelemetry/exporter-logs-otlp-http";
import dotenv from "dotenv";
import {ExpressInstrumentation, ExpressLayerType} from "@opentelemetry/instrumentation-express";
import {HttpInstrumentation} from "@opentelemetry/instrumentation-http";

dotenv.config();
const traceExporter = new OTLPTraceExporter({
  url: `${process.env.TEMPO_GRPC_ENDPOINT}/v1/traces`,
});

const logExporter = new OTLPLogExporter({
  url: `${process.env.LOKI_ENDPOINT}/otlp/v1/logs`,
});

const sdk = new NodeSDK({
  resource: new resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "bed-assignment-backend",
  }),
  instrumentations: [getNodeAutoInstrumentations({
    "@opentelemetry/instrumentation-fs": {
      enabled: false,
    },
  }),

    new ExpressInstrumentation({
      requestHook: function (span, info) {
        if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
          span.setAttribute("http.method", info.request.method);
          span.setAttribute("express.base_url", info.request.baseUrl);
        }
      },
    }),

    new HttpInstrumentation(),
  ],
  traceExporter,
});

sdk.start();

logInfo("OpenTelemetry instrumentation started");

process.on("SIGTERM", () => {
  sdk.shutdown()
    .then(() => console.log("OpenTelemetry terminated"))
    .catch((error) => console.log("Error terminating OpenTelemetry", error))
    .finally(() => process.exit(0));
});