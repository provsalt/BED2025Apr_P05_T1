import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics();

// Custom metrics for your Eldercare app
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const activeUsers = new Gauge({
  name: 'eldercare_active_users',
  help: 'Number of currently active users'
});

export const announcementsTotal = new Gauge({
  name: 'eldercare_announcements_total',
  help: 'Total number of announcements'
});

export const adminActionsTotal = new Counter({
  name: 'eldercare_admin_actions_total',
  help: 'Total number of admin actions performed',
  labelNames: ['action_type', 'admin_id']
});

// Metrics endpoint
export const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).end('Error getting metrics');
  }
};

export { register };
