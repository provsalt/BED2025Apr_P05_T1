import dotenv from "dotenv";

dotenv.config();

export const prometheusConfig = {
  prometheusEndpoint: process.env.PROMETHEUS_ENDPOINT || "http://localhost:9090",
}