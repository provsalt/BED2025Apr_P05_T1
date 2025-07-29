import {prometheusService} from "../../services/prometheusService.js";
import { dbConfig } from "../../config/db.js";
import sql from "mssql";

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

/**
 * Track page visit for analytics
 */
export const trackPageVisit = async (userId, pageUrl, sessionId = null, featureName = "page_view") => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      INSERT INTO FeatureUsage (user_id, feature_name, action_type, page_url, session_id, timestamp)
      VALUES (@userId, @featureName, 'view', @pageUrl, @sessionId, GETDATE())
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("featureName", sql.VarChar(100), featureName);
    request.input("pageUrl", sql.VarChar(255), pageUrl);
    request.input("sessionId", sql.Int, sessionId);
    
    await request.query(query);
  } catch (error) {
    console.error("Error tracking page visit:", error);
    // Don't throw - analytics shouldn't break the main flow
  }
};

/**
 * Track login attempt (successful or failed)
 */
export const trackLoginAttempt = async (loginData) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      INSERT INTO UserLoginHistory (user_id, attempted_email, success, ip_address, user_agent, failure_reason)
      VALUES (@userId, @attemptedEmail, @success, @ipAddress, @userAgent, @failureReason)
    `;
    const request = db.request();
    request.input("userId", sql.Int, loginData.userId || null);
    request.input("attemptedEmail", sql.VarChar(255), loginData.attemptedEmail || null);
    request.input("success", sql.Bit, loginData.success ? 1 : 0);
    request.input("ipAddress", sql.VarChar(45), loginData.ipAddress || null);
    request.input("userAgent", sql.VarChar(500), loginData.userAgent || null);
    request.input("failureReason", sql.VarChar(255), loginData.failureReason || null);
    
    await request.query(query);
  } catch (error) {
    console.error("Error tracking login attempt:", error);
    // Don't throw - analytics shouldn't break the main flow
  }
};

/**
 * Get page visit frequency analytics
 */
export const getPageVisitFrequency = async (startDate = null, endDate = null, limit = 20) => {
  const db = await sql.connect(dbConfig);
  let query = `
    SELECT 
      page_url,
      feature_name,
      COUNT(*) as visit_count,
      COUNT(DISTINCT user_id) as unique_users
    FROM FeatureUsage 
    WHERE action_type = 'view'
  `;
  
  const request = db.request();
  
  if (startDate && endDate) {
    query += ` AND timestamp >= @startDate AND timestamp <= @endDate`;
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
  }
  
  query += `
    GROUP BY page_url, feature_name
    ORDER BY visit_count DESC
    OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
  `;
  
  request.input("limit", sql.Int, limit);
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get login attempts analytics
 */
export const getLoginAttemptsAnalytics = async (startDate = null, endDate = null) => {
  const db = await sql.connect(dbConfig);
  let query = `
    SELECT 
      attempted_email,
      user_id,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_attempts,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_attempts,
      MAX(login_time) as last_attempt,
      failure_reason
    FROM UserLoginHistory
  `;
  
  const request = db.request();
  
  if (startDate && endDate) {
    query += ` WHERE login_time >= @startDate AND login_time <= @endDate`;
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
  }
  
  query += `
    GROUP BY attempted_email, user_id, failure_reason
    ORDER BY failed_attempts DESC, total_attempts DESC
  `;
  
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get failed login attempts for security monitoring
 */
export const getFailedLoginAttempts = async (hours = 24) => {
  const db = await sql.connect(dbConfig);
  const query = `
    SELECT 
      attempted_email,
      ip_address,
      COUNT(*) as failed_attempts,
      MAX(login_time) as last_attempt,
      failure_reason
    FROM UserLoginHistory
    WHERE success = 0 
      AND login_time >= DATEADD(HOUR, -@hours, GETDATE())
    GROUP BY attempted_email, ip_address, failure_reason
    HAVING COUNT(*) >= 3
    ORDER BY failed_attempts DESC
  `;
  
  const request = db.request();
  request.input("hours", sql.Int, hours);
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get user engagement by page visits
 */
export const getUserEngagementByPages = async (userId, startDate = null, endDate = null) => {
  const db = await sql.connect(dbConfig);
  let query = `
    SELECT 
      page_url,
      feature_name,
      COUNT(*) as visit_count,
      MIN(timestamp) as first_visit,
      MAX(timestamp) as last_visit
    FROM FeatureUsage
    WHERE user_id = @userId AND action_type = 'view'
  `;
  
  const request = db.request();
  request.input("userId", sql.Int, userId);
  
  if (startDate && endDate) {
    query += ` AND timestamp >= @startDate AND timestamp <= @endDate`;
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
  }
  
  query += `
    GROUP BY page_url, feature_name
    ORDER BY visit_count DESC
  `;
  
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get new user signups by day for analytics
 */
export const getNewUserSignupsByDay = async (startDate = null, endDate = null) => {
  const db = await sql.connect(dbConfig);
  let query = `
    SELECT 
      CAST(created_at AS DATE) as signup_date,
      COUNT(*) as new_users,
      COUNT(CASE WHEN role = 'User' THEN 1 END) as regular_users,
      COUNT(CASE WHEN role = 'Admin' THEN 1 END) as admin_users
    FROM Users
  `;
  
  const request = db.request();
  
  if (startDate && endDate) {
    query += ` WHERE created_at >= @startDate AND created_at <= @endDate`;
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
  }
  
  query += `
    GROUP BY CAST(created_at AS DATE)
    ORDER BY signup_date DESC
  `;
  
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get new user signups summary for dashboard
 */
export const getNewUserSignupsSummary = async (days = 30) => {
  const db = await sql.connect(dbConfig);
  const query = `
    SELECT 
      COUNT(*) as total_new_users,
      COUNT(CASE WHEN created_at >= DATEADD(DAY, -7, GETDATE()) THEN 1 END) as last_7_days,
      COUNT(CASE WHEN created_at >= DATEADD(DAY, -30, GETDATE()) THEN 1 END) as last_30_days,
      COUNT(CASE WHEN role = 'User' THEN 1 END) as total_regular_users,
      COUNT(CASE WHEN role = 'Admin' THEN 1 END) as total_admin_users,
      AVG(CAST(DATEDIFF(DAY, created_at, GETDATE()) AS FLOAT)) as avg_user_age_days
    FROM Users
    WHERE created_at >= DATEADD(DAY, -@days, GETDATE())
  `;
  
  const request = db.request();
  request.input("days", sql.Int, days);
  
  const result = await request.query(query);
  return result.recordset[0] || null;
};

/**
 * Get login analytics by user ID
 */
export const getLoginAnalyticsByUserId = async (userId, startDate = null, endDate = null) => {
  const db = await sql.connect(dbConfig);
  let query = `
    SELECT 
      user_id,
      attempted_email,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_attempts,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_attempts,
      MAX(login_time) as last_attempt,
      failure_reason,
      ip_address,
      user_agent
    FROM UserLoginHistory
    WHERE user_id = @userId
  `;
  
  const request = db.request();
  request.input("userId", sql.Int, userId);
  
  if (startDate && endDate) {
    query += ` AND login_time >= @startDate AND login_time <= @endDate`;
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
  }
  
  query += `
    GROUP BY user_id, attempted_email, failure_reason, ip_address, user_agent
    ORDER BY last_attempt DESC
  `;
  
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get overall login analytics summary for admin dashboard
 */
export const getLoginAnalyticsSummary = async (days = 30) => {
  const db = await sql.connect(dbConfig);
  const query = `
    SELECT 
      COUNT(*) as total_attempts,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as total_successful,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as total_failed,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT attempted_email) as unique_emails,
      COUNT(DISTINCT ip_address) as unique_ips,
      AVG(CAST(success as FLOAT)) * 100 as success_rate,
      MAX(login_time) as last_attempt,
      MIN(login_time) as first_attempt
    FROM UserLoginHistory
    WHERE login_time >= DATEADD(DAY, -@days, GETDATE())
  `;
  
  const request = db.request();
  request.input("days", sql.Int, days);
  
  const result = await request.query(query);
  return result.recordset[0] || null;
};

/**
 * Get login attempts by day for charts
 */
export const getLoginAttemptsByDay = async (days = 30) => {
  const db = await sql.connect(dbConfig);
  const query = `
    SELECT 
      CAST(login_time AS DATE) as date,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_attempts,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_attempts,
      COUNT(DISTINCT user_id) as unique_users
    FROM UserLoginHistory
    WHERE login_time >= DATEADD(DAY, -@days, GETDATE())
    GROUP BY CAST(login_time AS DATE)
    ORDER BY date DESC
  `;
  
  const request = db.request();
  request.input("days", sql.Int, days);
  
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get top users with most login attempts
 */
export const getTopUsersByLoginAttempts = async (limit = 10, days = 30) => {
  const db = await sql.connect(dbConfig);
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(ulh.id) as total_attempts,
      SUM(CASE WHEN ulh.success = 1 THEN 1 ELSE 0 END) as successful_attempts,
      SUM(CASE WHEN ulh.success = 0 THEN 1 ELSE 0 END) as failed_attempts,
      MAX(ulh.login_time) as last_attempt,
      AVG(CAST(ulh.success as FLOAT)) * 100 as success_rate
    FROM Users u
    LEFT JOIN UserLoginHistory ulh ON u.id = ulh.user_id 
      AND ulh.login_time >= DATEADD(DAY, -@days, GETDATE())
    GROUP BY u.id, u.name, u.email
    HAVING COUNT(ulh.id) > 0
    ORDER BY total_attempts DESC
    OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
  `;
  
  const request = db.request();
  request.input("days", sql.Int, days);
  request.input("limit", sql.Int, limit);
  
  const result = await request.query(query);
  return result.recordset;
};

/**
 * Get suspicious login attempts (multiple failures from same IP/email)
 */
export const getSuspiciousLoginAttempts = async (hours = 24, minFailures = 3) => {
  const db = await sql.connect(dbConfig);
  const query = `
    SELECT 
      attempted_email,
      ip_address,
      COUNT(*) as failed_attempts,
      MAX(login_time) as last_attempt,
      failure_reason,
      user_agent
    FROM UserLoginHistory
    WHERE success = 0 
      AND login_time >= DATEADD(HOUR, -@hours, GETDATE())
    GROUP BY attempted_email, ip_address, failure_reason, user_agent
    HAVING COUNT(*) >= @minFailures
    ORDER BY failed_attempts DESC
  `;
  
  const request = db.request();
  request.input("hours", sql.Int, hours);
  request.input("minFailures", sql.Int, minFailures);
  
  const result = await request.query(query);
  return result.recordset;
};