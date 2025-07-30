import {executeQuery} from "../../services/prometheusService.js";

export const getConnectedUsersRange = async (startTime, endTime, step) => {
  return await executeQuery("connected_websocket_users", {
    type: 'range',
    startTime,
    endTime,
    step
  });
}

export const getConnectedUsers = async () => {
  return await executeQuery("connected_websocket_users", {
    type: 'instant'
  });
}

export const getCpuUsageRange = async (startTime, endTime, step) => {
  return await executeQuery("rate(process_cpu_user_seconds_total[5m]) + rate(process_cpu_system_seconds_total[5m])", {
    type: 'range',
    startTime,
    endTime,
    step
  });
}

export const getCpuUsage = async () => {
  return await executeQuery("rate(process_cpu_user_seconds_total[5m]) + rate(process_cpu_system_seconds_total[5m])", {
    type: 'instant'
  });
}

export const getMemoryUsageRange = async (startTime, endTime, step) => {
  return await executeQuery("process_resident_memory_bytes", {
    type: 'range',
    startTime,
    endTime,
    step
  });
}

export const getMemoryUsage = async () => {
  return await executeQuery("process_resident_memory_bytes", {
    type: 'instant'
  });
}