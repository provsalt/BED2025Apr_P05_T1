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

export const incrementConnectedUsers = () => {
  connectedUsersGauge.inc();
};

export const decrementConnectedUsers = () => {
  connectedUsersGauge.dec();
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
