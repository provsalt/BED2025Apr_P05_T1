import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes} from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {logInfo} from "./utils/logger.js";
import {ConsoleLogRecordExporter, LoggerProvider, SimpleLogRecordProcessor} from "@opentelemetry/sdk-logs";
import * as logsAPI from "@opentelemetry/api-logs";
import {WinstonInstrumentation} from "@opentelemetry/instrumentation-winston";
import {OTLPLogExporter} from "@opentelemetry/exporter-logs-otlp-http";
import dotenv from "dotenv";

dotenv.config();

const traceExporter = new OTLPTraceExporter({
  url: `${process.env.TEMPO_GRPC_ENDPOINT}/v1/traces`,
});

const logExporter = new OTLPLogExporter({
  url: `${process.env.LOKI_ENDPOINT}/otlp/v1/logs`,
});

const loggerProvider = new LoggerProvider({
  processors: [
    new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()),
    new SimpleLogRecordProcessor(logExporter)
  ],
});

logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

const sdk = new NodeSDK({
  resource: new resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "bed-assignment-backend",
  }),
  instrumentations: [getNodeAutoInstrumentations({
    "@opentelemetry/instrumentation-fs": {
      enabled: false,
    },
  }),
    new WinstonInstrumentation({
      disableLogSending: true,
    })
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