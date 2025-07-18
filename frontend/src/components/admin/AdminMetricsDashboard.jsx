/*
 * AdminMetricsDashboard.jsx
 *
 * This component displays key analytics metrics for the admin dashboard.
 * It fetches data from the backend /api/admin/metrics/dashboard endpoint and displays:
 *   - New Users
 *   - Active Users
 *   - Total Logins
 *   - Total Page Visits
 *   - Failed Login Attempts
 *   - Average Session Duration
 *
 * Usage:
 *   <AdminMetricsDashboard />
 *
 * Props: none
 *
 * Features:
 *   - Date range selection (defaults to last 30 days)
 *   - Loading and error handling
 *   - Responsive summary cards
 *   - Easy to extend for charts/tables
 */
import React, { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher';

const formatDate = (date) => date.toISOString().slice(0, 10);

const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start: formatDate(start), end: formatDate(end) };
};

const metricLabels = {
  new_users: 'New Users',
  active_users: 'Active Users',
  total_logins: 'Total Logins',
  total_page_visits: 'Page Visits',
  failed_login_attempts: 'Failed Logins',
  avg_session_duration: 'Avg. Session Duration (min)'
};

const AdminMetricsDashboard = () => {
  const [range, setRange] = useState(defaultRange());
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch metrics when date range changes
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/metrics/dashboard?startDate=${range.start}&endDate=${range.end}`;
        const res = await fetcher(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setMetrics(res.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [range.start, range.end]);

  // Handle date input changes
  const handleDateChange = (e) => {
    setRange({ ...range, [e.target.name]: e.target.value });
  };

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Analytics Overview</h2>
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" name="start" value={range.start} max={range.end} onChange={handleDateChange} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" name="end" value={range.end} min={range.start} max={formatDate(new Date())} onChange={handleDateChange} className="border rounded px-2 py-1" />
        </div>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading metrics...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(metricLabels).map(([key, label]) => (
            <div key={key} className="bg-white rounded shadow p-4 flex flex-col items-center border">
              <span className="text-sm text-gray-500 mb-1">{label}</span>
              <span className="text-2xl font-bold text-blue-600">
                {metrics[key] !== undefined && metrics[key] !== null ?
                  (key === 'avg_session_duration' ? Number(metrics[key]).toFixed(2) : metrics[key]) :
                  '--'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No metrics available for this range.</div>
      )}
    </div>
  );
};

export default AdminMetricsDashboard; 