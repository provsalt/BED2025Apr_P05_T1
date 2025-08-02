# Login Analytics System

This document describes the login analytics system that tracks both successful and unsuccessful login attempts for security monitoring and user behavior analysis.

## Database Schema

### LoginAttempts Table

```sql
CREATE TABLE LoginAttempts (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NULL, -- NULL for failed attempts with non-existent users
    email VARCHAR(255) NOT NULL,
    attempt_time DATETIME DEFAULT GETDATE() NOT NULL,
    success BIT NOT NULL DEFAULT 0,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    failure_reason VARCHAR(100) NULL, -- 'invalid_password', 'user_not_found', 'account_locked', etc.
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `IX_LoginAttempts_user_id` - For querying by user ID
- `IX_LoginAttempts_email` - For querying by email
- `IX_LoginAttempts_attempt_time` - For time-based queries
- `IX_LoginAttempts_success` - For filtering by success status

## API Endpoints

### User-Specific Analytics (Users can view their own data)

#### 1. Get User Login Analytics
```
GET /api/users/:userId/login-analytics?days=30
```
Returns comprehensive analytics for a specific user including:
- Total attempts
- Successful vs failed attempts
- Success rate
- First and last attempt times
- Days with activity

#### 2. Get Recent Login Attempts
```
GET /api/users/:userId/login-attempts?limit=20
```
Returns recent login attempts with details:
- Attempt time
- Success status
- IP address
- User agent
- Failure reason (if applicable)

#### 3. Get Failed Login Attempts (Security Monitoring)
```
GET /api/users/:userId/failed-login-attempts?hours=24
```
Returns failed login attempts for security monitoring:
- Number of failed attempts
- Time range of failures
- Unique IP addresses used

### Admin-Only Analytics

#### 4. Get Login Attempts by Email
```
GET /api/users/analytics/login-attempts-by-email?email=user@example.com&days=30
```
Returns analytics for login attempts to a specific email (useful for non-existent users).

#### 5. Get Overall Login Analytics
```
GET /api/users/analytics/overall-login-stats?days=30
```
Returns system-wide login analytics for admin dashboard:
- Total attempts across all users
- Overall success rate
- Unique users and emails
- Activity patterns

## Implementation Details

### Model Functions

#### `trackLoginAttempt(attemptData)`
Tracks a login attempt in the database.

**Parameters:**
- `userId` (number|null): User ID (null for non-existent users)
- `email` (string): Email address used in attempt
- `success` (boolean): Whether the attempt was successful
- `ipAddress` (string|null): IP address of the attempt
- `userAgent` (string|null): User agent string
- `failureReason` (string|null): Reason for failure if applicable

#### `getUserLoginAttemptsAnalytics(userId, days)`
Returns analytics for a specific user over a time period.

#### `getUserRecentLoginAttempts(userId, limit)`
Returns recent login attempts for a user.

#### `getUserFailedLoginAttempts(userId, hours)`
Returns failed login attempts for security monitoring.

#### `getLoginAttemptsByEmail(email, days)`
Returns analytics for attempts to a specific email address.

#### `getOverallLoginAnalytics(days)`
Returns system-wide login analytics.

### Controller Integration

The `loginUserController` automatically tracks all login attempts:

1. **Failed Attempts**: Tracked before throwing the error
   - User not found: `failureReason = 'user_not_found'`
   - Invalid password: `failureReason = 'invalid_password'`

2. **Successful Attempts**: Tracked after successful authentication

### Security Features

1. **IP Address Tracking**: Captures client IP for security monitoring
2. **User Agent Tracking**: Records browser/client information
3. **Failure Reason Classification**: Categorizes different types of failures
4. **Timing Attack Prevention**: Always performs password comparison
5. **Admin-Only Access**: Sensitive analytics require admin privileges

## Usage Examples

### Frontend Integration

```javascript
// Get user's own login analytics
const analytics = await fetch(`/api/users/${userId}/login-analytics?days=30`);
const data = await analytics.json();

// Check for suspicious activity
const failedAttempts = await fetch(`/api/users/${userId}/failed-login-attempts?hours=24`);
const securityData = await failedAttempts.json();

if (securityData.failed_attempts > 5) {
  // Trigger security alert
  console.warn('Multiple failed login attempts detected');
}
```

### Admin Dashboard

```javascript
// Get overall system analytics
const overallStats = await fetch('/api/users/analytics/overall-login-stats?days=30');
const stats = await overallStats.json();

// Monitor specific email for suspicious activity
const emailAttempts = await fetch('/api/users/analytics/login-attempts-by-email?email=suspicious@example.com');
const emailData = await emailAttempts.json();
```

## Testing

The system includes comprehensive tests for:
- Model functions (database operations)
- Controller functions (API endpoints)
- Error handling
- Edge cases (no data, invalid parameters)

Run tests with:
```bash
npm test -- --run tests/controllers/user/loginAnalyticsController.test.js
npm test -- --run tests/models/user/userModel.test.js
```

## Migration

To set up the database table, run the migration:
```bash
# The migration file is: backend/migrations/06_createLoginAttemptsTable.sql
```

## Security Considerations

1. **Data Privacy**: Users can only access their own login data
2. **Admin Access**: System-wide analytics require admin privileges
3. **Data Retention**: Consider implementing data retention policies
4. **Rate Limiting**: Login endpoints are already rate-limited
5. **Audit Trail**: All login attempts are logged for security auditing

## Future Enhancements

1. **Geolocation**: Add IP geolocation for security analysis
2. **Device Fingerprinting**: Enhanced device identification
3. **Risk Scoring**: Implement risk-based authentication
4. **Alert System**: Real-time security alerts for suspicious activity
5. **Data Export**: Admin tools for exporting analytics data 