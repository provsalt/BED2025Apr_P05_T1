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

// User analytics metrics
export const userLoginAttempts = new Counter({
  name: 'user_login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status', 'device_type']
});

export const userPageVisits = new Counter({
  name: 'user_page_visits_total',
  help: 'Total number of page visits',
  labelNames: ['page_url', 'device_type']
});

export const userAgeGroupDistribution = new Gauge({
  name: 'user_age_group_distribution',
  help: 'Number of users by age group',
  labelNames: ['age_group']
});

export const failedLoginAttempts = new Counter({
  name: 'failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['email_domain']
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
export const metricsHandler = (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};

export { register };
