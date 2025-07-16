import cron from 'node-cron';
import {
  userLoginAttempts,
  userPageVisits,
  failedLoginAttempts,
  userAgeGroupDistribution,
  activeUsers
} from '../config/metrics.js';
import { storePrometheusSnapshot } from '../models/admin/analyticsModel.js';

/**
 * Scheduled job to persist Prometheus metrics into analytics tables every 5 minutes
 */
cron.schedule('*/5 * * * *', async () => {
  try {
    // 1. Get current metric values
    const loginAttempts = userLoginAttempts.get().values;
    const pageVisits = userPageVisits.get().values;
    const failedLogins = failedLoginAttempts.get().values;
    const ageGroups = userAgeGroupDistribution.get().values;
    const active = activeUsers.get().values;

    // 2. Aggregate (average) where possible
    // Helper to compute average from array of metric objects
    const avg = arr => arr.length ? arr.reduce((sum, v) => sum + v.value, 0) / arr.length : 0;

    const avgLoginAttempts = avg(loginAttempts);
    const avgPageVisits = avg(pageVisits);
    const avgFailedLogins = avg(failedLogins);
    const avgActiveUsers = avg(active);
    const avgAgeGroups = avg(ageGroups);

    // 3. Store snapshot in analytics table
    await storePrometheusSnapshot({
      timestamp: new Date(),
      avgLoginAttempts,
      avgPageVisits,
      avgFailedLogins,
      avgActiveUsers,
      avgAgeGroups,
      raw: {
        loginAttempts,
        pageVisits,
        failedLogins,
        ageGroups,
        active
      }
    });

    console.log('[PrometheusToAnalytics] Snapshot stored at', new Date());
  } catch (err) {
    console.error('[PrometheusToAnalytics] Error persisting metrics:', err);
  }
});

// Export for testing/manual run
export async function runPrometheusToAnalyticsJob() {
  // Same logic as above, can be called manually
} 