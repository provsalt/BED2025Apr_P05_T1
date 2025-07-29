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

// Page visit metrics
export const pageVisitCounter = new client.Counter({
  name: "page_visits_total",
  help: "Total number of page visits",
  labelNames: ["feature", "method", "status"]
});

export const pageVisitHistogram = new client.Histogram({
  name: "page_visit_duration_seconds",
  help: "Page visit duration in seconds",
  labelNames: ["feature"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
});

// Login attempt metrics
export const loginAttemptCounter = new client.Counter({
  name: "login_attempts_total",
  help: "Total number of login attempts",
  labelNames: ["success", "reason"]
});

export const loginAttemptHistogram = new client.Histogram({
  name: "login_attempt_duration_seconds",
  help: "Login attempt duration in seconds",
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const incrementConnectedUsers = () => {
  connectedUsersGauge.inc();
};

export const decrementConnectedUsers = () => {
  connectedUsersGauge.dec();
};

export const prometheusService = prom;
