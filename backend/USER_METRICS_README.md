# User Metrics Data Collection System

This document describes the user metrics data collection system implemented for tracking user behavior, login attempts, page visits, and age-based analytics.

## Overview

The system collects three main types of user metrics:
1. **Login Attempts** - Both successful and failed login attempts
2. **Page Visits** - User navigation patterns and most frequently visited pages
3. **Age-based Analytics** - User engagement metrics broken down by age groups

## Database Tables

### UserLoginAnalytics
Tracks daily login patterns for each user:
- `user_id` - User identifier
- `login_date` - Date of login
- `login_count` - Number of logins on that date
- `first_login_time` - First login time of the day
- `last_login_time` - Last login time of the day
- `ip_addresses` - Comma-separated list of IP addresses used
- `device_types` - Comma-separated list of device types used

### PageVisitAnalytics
Tracks individual page visits:
- `user_id` - User identifier
- `page_url` - URL of the visited page
- `page_title` - Title of the page
- `visit_timestamp` - When the visit occurred
- `action_type` - Type of action (view, click, form_submit)
- `referrer_url` - Where the user came from
- `user_agent` - Browser/device information
- `device_type` - Device type (mobile, tablet, desktop)

### FailedLoginAttempts
Tracks failed login attempts for security monitoring:
- `email` - Email address used in failed attempt
- `ip_address` - IP address of the attempt
- `user_agent` - Browser/device information
- `device_type` - Device type used
- `attempt_timestamp` - When the attempt occurred

## API Endpoints

All endpoints require admin authentication and are available under `/api/admin/metrics/`:

### Dashboard Overview
```
GET /api/admin/metrics/dashboard?startDate=2024-01-01&endDate=2024-01-31
```
Returns comprehensive metrics including:
- New users
- Active users
- Total logins
- Total page visits
- Failed login attempts
- Average session duration

### Age Group Analytics
```
GET /api/admin/metrics/age-groups?startDate=2024-01-01&endDate=2024-01-31
```
Returns user engagement metrics broken down by age groups:
- Under 18, 18-25, 26-35, 36-50, 51-65, 65+
- Total users per age group
- Average sessions, page visits, and logins per user
- Total engagement metrics per age group

### Popular Pages
```
GET /api/admin/metrics/popular-pages?startDate=2024-01-01&endDate=2024-01-31&limit=10
```
Returns the most frequently visited pages:
- Page URL and title
- Visit count
- Unique users
- Average time spent

### Login Attempt Statistics
```
GET /api/admin/metrics/login-attempts?startDate=2024-01-01&endDate=2024-01-31
```
Returns daily login attempt statistics:
- Total logins per day
- Unique users logging in
- Average logins per user

### Failed Login Attempts
```
GET /api/admin/metrics/failed-logins?startDate=2024-01-01&endDate=2024-01-31&limit=100
```
Returns details of failed login attempts for security monitoring:
- Email addresses
- IP addresses
- Device information
- Timestamps

### User Engagement
```
GET /api/admin/metrics/user-engagement?startDate=2024-01-01&endDate=2024-01-31&limit=100&offset=0
```
Returns detailed engagement metrics for individual users:
- Total sessions
- Online time
- Feature usage
- Last activity

## Prometheus Metrics

The system also exports Prometheus metrics for monitoring:

### Counters
- `user_login_attempts_total` - Login attempts by status and device type
- `user_page_visits_total` - Page visits by URL and device type
- `failed_login_attempts_total` - Failed login attempts by email domain

### Gauges
- `user_age_group_distribution` - Number of users by age group
- `eldercare_active_users` - Currently active users

Access metrics at: `GET /metrics`

## Implementation Details

### Login Tracking
Login attempts are automatically tracked in the `loginUserController`:
- Successful logins are tracked in `UserLoginAnalytics`
- Failed logins are tracked in `FailedLoginAttempts`
- Prometheus metrics are incremented for both

### Page Visit Tracking
Page visits are tracked using the `pageTrackingMiddleware`:
- Applied to routes that need tracking
- Captures URL, device type, user agent, and referrer
- Stores data in `PageVisitAnalytics`
- Increments Prometheus metrics

### Age-based Analytics
Age groups are calculated from user `date_of_birth`:
- Under 18, 18-25, 26-35, 36-50, 51-65, 65+
- Metrics are aggregated by age group
- Includes engagement scores and usage patterns

## Usage Examples

### Adding Page Tracking to a Route
```javascript
import { pageTrackingMiddleware } from "../../middleware/pageTracking.js";

// Apply to individual routes
router.get("/profile", getUserMiddleware, pageTrackingMiddleware, profileController);

// Or use specific tracking with custom data
router.get("/dashboard", getUserMiddleware, trackSpecificPage({
  title: "User Dashboard",
  actionType: "view"
}), dashboardController);
```

### Querying Metrics
```javascript
// Get dashboard metrics for last 30 days
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const endDate = new Date();

const response = await fetch(`/api/admin/metrics/dashboard?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const metrics = await response.json();
```

## Security Considerations

1. **Admin-only Access**: All metrics endpoints require admin role
2. **Rate Limiting**: Standard rate limiting applies to all endpoints
3. **Data Privacy**: IP addresses and user agents are stored for security monitoring
4. **Data Retention**: Consider implementing data retention policies for analytics tables

## Performance Considerations

1. **Indexes**: Database indexes are created for fast queries on common patterns
2. **Async Tracking**: Page visits and login tracking are asynchronous to avoid blocking responses
3. **Pagination**: User engagement endpoint supports pagination for large datasets
4. **Caching**: Consider implementing caching for frequently accessed metrics

## Future Enhancements

1. **Real-time Dashboard**: WebSocket-based real-time metrics updates
2. **Advanced Analytics**: Machine learning-based user behavior prediction
3. **Export Functionality**: CSV/Excel export of metrics data
4. **Alerting**: Automated alerts for unusual login patterns or security events
5. **Data Visualization**: Charts and graphs for better data interpretation 

# Prometheus-Only Analytics

## Metrics Exposed
- All user engagement, login attempts, and page visits are tracked using Prometheus metrics via `prom-client`.
- The backend exposes `/metrics` for Prometheus scraping.

## Example PromQL Queries

### Total HTTP Requests
```
sum(http_requests_total)
```

### HTTP Requests by Method and Status
```
sum by (method, status) (http_requests_total)
```

### Login Attempts (Success vs Fail)
```
sum by (status) (user_login_attempts_total)
```

### Login Attempts Over Time (Last 24h)
```
sum by (status) (increase(user_login_attempts_total[24h]))
```

### Page Visits by URL
```
sum by (page_url) (user_page_visits_total)
```

## Grafana Dashboard Setup
1. Add Prometheus as a data source in Grafana (URL: `http://localhost:9090`).
2. Create a new dashboard and add panels for the queries above.
3. Choose visualization types (e.g., time series, bar chart).

## No SQL Analytics
- All analytics are now handled by Prometheus. No data is written to or read from MSSQL for analytics.
- For long-term retention, configure Prometheus accordingly or use remote storage integrations. 

---

## **1. Where to Use PromQL**

- **Prometheus UI:**  
  Go to [http://localhost:9090](http://localhost:9090) (or your Prometheus server’s address).  
  Use the “Expression” input box at the top to enter PromQL queries and click “Execute” to see results.

- **Grafana:**  
  When you add a panel, set the data source to Prometheus and enter your PromQL query in the query editor.

---

## **2. Basic PromQL Query Examples**

Assuming you have metrics like `user_login_attempts_total`, `user_page_visits_total`, etc.

### **A. Total Login Attempts**
```promql
sum(user_login_attempts_total)
```

### **B. Login Attempts by Status (success/fail)**
```promql
sum by (status) (user_login_attempts_total)
```

### **C. Login Attempts Over Time (last 24h)**
```promql
sum by (status) (increase(user_login_attempts_total[24h]))
```

### **D. Page Visits by URL**
```promql
sum by (page_url) (user_page_visits_total)
```

### **E. HTTP Requests by Method and Status**
```promql
sum by (method, status) (http_requests_total)
```

### **F. Rate of Login Attempts per Minute**
```promql
rate(user_login_attempts_total[1m])
```

---

## **3. How to Use in Grafana**

1. **Create a new dashboard panel.**
2. **Set the data source to Prometheus.**
3. **Enter your PromQL query** in the query editor.
4. **Choose a visualization** (e.g., time series, bar chart).
5. **Save the panel.**

---

## **4. Tips**

- Use `sum`, `avg`, `max`, `min`, `rate`, and `increase` for aggregations and trends.
- Use `by (label)` to group results (e.g., by status, page_url, device_type).
- Use time ranges like `[5m]`, `[1h]`, `[24h]` for rate/increase functions.

---

## **5. Resources**

- [Prometheus Querying Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Grafana Prometheus Docs](https://grafana.com/docs/grafana/latest/datasources/prometheus/)

---

If you want a specific query for a metric or a dashboard example, just ask! 