import {getCpuUsage, getCpuUsageRange, getMemoryUsage, getMemoryUsageRange} from "../../models/analytics/analyticsModel.js";
import {ErrorFactory} from "../../utils/AppError.js";

export const getCpuUsageController = async (req, res) => {
  try {
    const {
      start = new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      end = new Date().toISOString(),
      step = "60"
    } = req.query;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const result = await getCpuUsageRange(startTime, endTime, Number(step));

    if (!result.result || result.result.length === 0) {
      return res.json({
        timeRange: {
          start: new Date(startTime * 1000).toISOString(),
          end: new Date(endTime * 1000).toISOString()
        },
        query: "cpu_usage_percentage",
        resolution: step,
        metric: {},
        series: [],
        message: "No data available - check if node_exporter is running"
      });
    }

    const response = {
      timeRange: {
        start: new Date(startTime * 1000).toISOString(),
        end: new Date(endTime * 1000).toISOString()
      },
      query: "cpu_usage_percentage",
      resolution: step,
      metric: result.result[0].metric,
      series: result.result[0].values
    };

    res.json(response);

  } catch (error) {
    console.log(error)
    if (error.response?.status === 400) {
      throw ErrorFactory.validation("Invalid query parameters");
    }

    throw ErrorFactory.external("Prometheus service is unavailable", error);
  }
}

export const getCpuUsageInstant = async (req, res) => {
  try {
    const result = await getCpuUsage()

    if (!result.result || result.result.length === 0) {
      return res.json({
        timestamp: Date.now(),
        query: "cpu_usage_percentage",
        metric: {},
        value: null,
        message: "No data available - check if node_exporter is running"
      });
    }
    
    const response = {
      timestamp: Date.now(),
      query: "cpu_usage_percentage",
      metric: result.result[0].metric,
      value: result.result[0].value.value
    };

    res.json(response);
  } catch (e) {
    console.log(e)
    throw ErrorFactory.external("Prometheus service is unavailable", e);
  }
}

export const getMemoryUsageController = async (req, res) => {
  try {
    const {
      start = new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      end = new Date().toISOString(),
      step = "60"
    } = req.query;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const result = await getMemoryUsageRange(startTime, endTime, Number(step));

    if (!result.result || result.result.length === 0) {
      return res.json({
        timeRange: {
          start: new Date(startTime * 1000).toISOString(),
          end: new Date(endTime * 1000).toISOString()
        },
        query: "memory_usage_percentage",
        resolution: step,
        metric: {},
        series: [],
        message: "No data available - check if node_exporter is running"
      });
    }

    const response = {
      timeRange: {
        start: new Date(startTime * 1000).toISOString(),
        end: new Date(endTime * 1000).toISOString()
      },
      query: "memory_usage_percentage",
      resolution: step,
      metric: result.result[0].metric,
      series: result.result[0].values
    };

    res.json(response);

  } catch (error) {
    if (error.response?.status === 400) {
      throw ErrorFactory.validation("Invalid query parameters");
    }

    throw ErrorFactory.external("Prometheus service is unavailable", error);
  }
}

export const getMemoryUsageInstant = async (req, res) => {
  try {
    const result = await getMemoryUsage()

    if (!result.result || result.result.length === 0) {
      return res.json({
        timestamp: Date.now(),
        query: "memory_usage_percentage",
        metric: {},
        value: null,
        message: "No data available - check if node_exporter is running"
      });
    }

    const response = {
      timestamp: Date.now(),
      query: "memory_usage_percentage",
      metric: result.result[0].metric,
      value: result.result[0].value.value
    };

    res.json(response);
  } catch (e) {
    throw ErrorFactory.external("Prometheus service is unavailable", e);
  }
}