import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes} from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {logInfo} from "./utils/logger.js";
import dotenv from "dotenv";

dotenv.config();
const traceExporter = new OTLPTraceExporter({
  url: `${process.env.TEMPO_GRPC_ENDPOINT}/v1/traces`,
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