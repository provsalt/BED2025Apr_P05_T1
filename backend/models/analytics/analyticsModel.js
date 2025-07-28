import {prometheusService} from "../../services/prometheusService.js";

export const getConnectedUsersRange = async (startTime, endTime, step) => {
  return await prometheusService.rangeQuery(
    "connected_websocket_users",
    startTime,
    endTime,
    step
  )
}

export const getConnectedUsers = async () => {
  return await prometheusService.instantQuery(
    "connected_websocket_users"
  );
}