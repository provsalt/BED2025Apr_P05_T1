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

export const prometheusService = prom;
