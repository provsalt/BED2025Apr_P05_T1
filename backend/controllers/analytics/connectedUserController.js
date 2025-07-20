import {getConnectedUsers, getConnectedUsersRange} from "../../models/analytics/analyticsModel.js";

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
    console.error("Error fetching connected users metrics:", error);

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: "Invalid query parameters",
        message: error.message
      });
    }

    if (error.response?.status === 503) {
      return res.status(503).json({
        error: "Prometheus unavailable",
        message: "Unable to connect to Prometheus server"
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch metrics data"
    });
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
    console.error("Error fetching connected users:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}