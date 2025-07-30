import React, { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const OverviewSection = ({ users, admins, fetchAllData }) => {
  const [cpuUsage, setCpuUsage] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch instant metrics
  const fetchInstantMetrics = async () => {
    try {
      const [cpuData, memoryData] = await Promise.all([
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/cpu-usage/instant`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/memory-usage/instant`)
      ]);
      
      setCpuUsage(cpuData.value ? parseFloat(cpuData.value).toFixed(2) : 'N/A');
      setMemoryUsage(memoryData.value ? (parseFloat(memoryData.value) / 1024 / 1024).toFixed(0) : 'N/A');
    } catch (error) {
      console.error('Error fetching instant metrics:', error);
      setCpuUsage('Error');
      setMemoryUsage('Error');
    }
  };

  // Fetch historical metrics  
  const fetchHistoricalMetrics = async () => {
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
      
      const [cpuData, memoryData] = await Promise.all([
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/cpu-usage?start=${startTime}&end=${endTime}&step=300`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/memory-usage?start=${startTime}&end=${endTime}&step=300`)
      ]);

      // Transform data for charts
      const transformChartData = (data, label) => {
        if (!data.series || data.series.length === 0) return [];
        return data.series.map((point) => {
          // Handle both formats: [timestamp, value] arrays and {time, value} objects
          let timestamp, value;
          if (Array.isArray(point)) {
            [timestamp, value] = point;
            timestamp = timestamp * 1000; // Convert to milliseconds
          } else {
            timestamp = new Date(point.time).getTime();
            value = point.value;
          }
          
          return {
            time: new Date(timestamp).toLocaleTimeString(),
            [label]: label === 'memory' ? parseFloat(value) / 1024 / 1024 : parseFloat(value)
          };
        });
      };

      setCpuHistory(transformChartData(cpuData, 'cpu'));
      setMemoryHistory(transformChartData(memoryData, 'memory'));
    } catch (error) {
      console.error('Error fetching historical metrics:', error);
      setCpuHistory([]);
      setMemoryHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllMetrics = async () => {
      await Promise.all([fetchInstantMetrics(), fetchHistoricalMetrics()]);
    };
    
    fetchAllMetrics();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchInstantMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const chartConfigCpu = {
    cpu: {
      label: "CPU Usage",
      color: "#2563eb"
    }
  };

  const chartConfigMemory = {
    memory: {
      label: "Memory Usage (MB)",
      color: "#dc2626"
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          <p className="text-gray-600 text-sm">All registered users</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-2">Admins</h3>
          <p className="text-3xl font-bold text-red-600">{admins.length}</p>
          <p className="text-gray-600 text-sm">Users with admin privileges</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-2">Regular Users</h3>
          <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role !== 'Admin').length}</p>
          <p className="text-gray-600 text-sm">Non-admin users</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-2">Actions</h3>
          <button 
            className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={fetchAllData}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-2">CPU Usage</h3>
          <p className="text-3xl font-bold text-orange-600">{cpuUsage}%</p>
          <p className="text-gray-600 text-sm">Current CPU usage</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-2">Memory Usage</h3>
          <p className="text-3xl font-bold text-purple-600">{memoryUsage} MB</p>
          <p className="text-gray-600 text-sm">Current memory usage</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">CPU Usage (Last Hour)</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <ChartContainer config={chartConfigCpu} className="h-64 w-full">
              <LineChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="var(--color-cpu)" 
                  strokeWidth={2}
                  dot={false}
                  name="CPU Usage"
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Memory Usage (Last Hour)</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <ChartContainer config={chartConfigMemory} className="h-64 w-full">
              <LineChart data={memoryHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="var(--color-memory)" 
                  strokeWidth={2}
                  dot={false}
                  name="Memory Usage (MB)"
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewSection;
