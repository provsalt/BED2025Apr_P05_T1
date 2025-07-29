import {getConnectedUsers, getConnectedUsersRange} from "../../models/analytics/analyticsModel.js";
import {ErrorFactory} from "../../utils/AppError.js";

export const getConnectedUsersController = async (req, res) => {
  try {
    const {
      start = new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      end = new Date().toISOString(),
      step = "60"
    } = req.query;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const result = await getConnectedUsersRange(startTime, endTime, Number(step));

    const response = {
      timeRange: {
        start: new Date(startTime * 1000).toISOString(),
        end: new Date(endTime * 1000).toISOString()
      },
      query: "connected_websocket_users",
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

export const getConnectedUsersInstant = async (req, res) => {
  try {
    const result = await getConnectedUsers()

    const response = {
      timestamp: Date.now(),
      query: "connected_websocket_users",
      metric: result.result[0].metric,
      value: result.result[0].value.value
    };

    res.json(response);
  } catch (e) {
    throw ErrorFactory.external("Prometheus service is unavailable", e);
  }
}