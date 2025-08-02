import { PrometheusDriver } from "prometheus-query";
import { prometheusConfig } from "../config/prometheus.js";
import client from "prom-client";

const prom = new PrometheusDriver({
  endpoint: prometheusConfig.prometheusEndpoint,
  baseURL: "/api/v1"
});

export const connectedUsersGauge = new client.Gauge({
  name: "connected_websocket_users",
  help: "Number of currently connected WebSocket users"
});

export const openaiTokensCounter = new client.Counter({
  name: "openai_tokens_total",
  help: "Total OpenAI tokens consumed",
  labelNames: ["user_id", "service_name", "model_name", "token_type"]
});

export const openaiRequestsCounter = new client.Counter({
  name: "openai_requests_total", 
  help: "Total OpenAI API requests",
  labelNames: ["user_id", "service_name", "model_name", "request_type"]
});


export const s3OperationsCounter = new client.Counter({
  name: "s3_operations_total",
  help: "Total S3 operations",
  labelNames: ["user_id", "operation", "bucket_name"]
});

export const s3StorageGauge = new client.Gauge({
  name: "s3_storage_bytes",
  help: "S3 storage usage in bytes",
  labelNames: ["user_id", "bucket_name"]
});

export const s3BytesGauge = new client.Gauge({
  name: "s3_bytes_usage",
  help: "Current S3 bytes usage by operation type",
  labelNames: ["user_id", "operation", "bucket_name"]
});

export const incrementConnectedUsers = () => {
  connectedUsersGauge.inc();
};

export const decrementConnectedUsers = () => {
  connectedUsersGauge.dec();
};

export const trackOpenAIUsage = (userId, serviceName, modelName, usage, requestType = "chat") => {
  const requestLabels = {
    user_id: userId?.toString() || "anonymous",
    service_name: serviceName,
    model_name: modelName,
    request_type: requestType
  };

  const tokenLabels = {
    user_id: userId?.toString() || "anonymous",
    service_name: serviceName,
    model_name: modelName
  };

  openaiRequestsCounter.inc(requestLabels);

  if (usage.input_tokens) {
    openaiTokensCounter.inc({
      ...tokenLabels,
      token_type: "input"
    }, usage.input_tokens);
  }

  if (usage.output_tokens) {
    openaiTokensCounter.inc({
      ...tokenLabels,
      token_type: "output"
    }, usage.output_tokens);
  }

  if (usage.total_tokens) {
    openaiTokensCounter.inc({
      ...tokenLabels,
      token_type: "total"
    }, usage.total_tokens);
  }
};

export const trackS3Usage = (userId, operation, bucketName, fileKey, fileSizeBytes) => {
  const labels = {
    user_id: userId?.toString() || "anonymous",
    operation,
    bucket_name: bucketName
  };

  s3OperationsCounter.inc(labels);

  if (fileSizeBytes) {
    if (operation === "upload") {
      s3BytesGauge.inc(labels, fileSizeBytes);
      s3StorageGauge.inc({
        user_id: userId?.toString() || "anonymous",
        bucket_name: bucketName
      }, fileSizeBytes);
    } else if (operation === "delete") {
      s3BytesGauge.dec(labels, fileSizeBytes);
      s3StorageGauge.dec({
        user_id: userId?.toString() || "anonymous",
        bucket_name: bucketName
      }, fileSizeBytes);
    }
  }
};

export const executeQuery = async (query, options = {}) => {
  const { type = 'instant', startTime, endTime, step } = options;
  
  if (type === 'range') {
    if (!startTime || !endTime) {
      throw new Error('Range queries require startTime and endTime');
    }
    return await prom.rangeQuery(query, startTime, endTime, step);
  } else if (type === 'instant') {
    return await prom.instantQuery(query);
  } else {
    throw new Error('Query type must be either "instant" or "range"');
  }
};

export const prometheusService = prom;
