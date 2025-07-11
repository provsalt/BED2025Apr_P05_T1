import {dbConfig} from "../../config/db.js";
import sql from "mssql";

/**
 * Analytics model for tracking user engagement and app metrics
 */

/**
 * Create a new user session
 */
export const createUserSession = async (userId, sessionData = {}) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO UserSessions (user_id, ip_address, user_agent, device_type)
        VALUES (@userId, @ipAddress, @userAgent, @deviceType);
        SELECT SCOPE_IDENTITY() AS sessionId;
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("ipAddress", sql.VarChar(45), sessionData.ipAddress || null);
    request.input("userAgent", sql.VarChar(500), sessionData.userAgent || null);
    request.input("deviceType", sql.VarChar(50), sessionData.deviceType || null);
    
    const result = await request.query(query);
    return result.recordset[0].sessionId;
};

/**
 * End a user session
 */
export const endUserSession = async (sessionId) => {
    const db = await sql.connect(dbConfig);
    const query = `
        UPDATE UserSessions 
        SET session_end = GETDATE(),
            session_duration_minutes = DATEDIFF(MINUTE, session_start, GETDATE())
        WHERE id = @sessionId AND session_end IS NULL;
        SELECT @@ROWCOUNT as affectedRows;
    `;
    const request = db.request();
    request.input("sessionId", sql.Int, sessionId);
    
    const result = await request.query(query);
    return result.recordset[0].affectedRows;
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = async (userId, featureData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO FeatureUsage (user_id, feature_name, action_type, page_url, session_id, additional_data)
        VALUES (@userId, @featureName, @actionType, @pageUrl, @sessionId, @additionalData);
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("featureName", sql.VarChar(100), featureData.featureName);
    request.input("actionType", sql.VarChar(50), featureData.actionType);
    request.input("pageUrl", sql.VarChar(255), featureData.pageUrl || null);
    request.input("sessionId", sql.Int, featureData.sessionId || null);
    request.input("additionalData", sql.NVarChar(sql.MAX), featureData.additionalData || null);
    
    await request.query(query);
};

/**
 * Get user engagement metrics for a specific user
 */
export const getUserEngagementMetrics = async (userId, startDate, endDate) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            COUNT(DISTINCT s.id) as total_sessions,
            COALESCE(SUM(s.session_duration_minutes), 0) as total_online_time_minutes,
            COALESCE(AVG(s.session_duration_minutes), 0) as avg_session_duration,
            COUNT(DISTINCT f.feature_name) as unique_features_used,
            COUNT(f.id) as total_feature_interactions,
            MAX(s.session_start) as last_login
        FROM Users u
        LEFT JOIN UserSessions s ON u.id = s.user_id 
            AND s.session_start >= @startDate 
            AND s.session_start <= @endDate
        LEFT JOIN FeatureUsage f ON u.id = f.user_id 
            AND f.timestamp >= @startDate 
            AND f.timestamp <= @endDate
        WHERE u.id = @userId
        GROUP BY u.id, u.name, u.email
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    
    const result = await request.query(query);
    return result.recordset[0] || null;
};

/**
 * Get engagement metrics for all users
 */
export const getAllUsersEngagementMetrics = async (startDate, endDate, limit = 100, offset = 0) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            u.role,
            u.created_at as user_created_at,
            COUNT(DISTINCT s.id) as total_sessions,
            COALESCE(SUM(s.session_duration_minutes), 0) as total_online_time_minutes,
            COALESCE(AVG(s.session_duration_minutes), 0) as avg_session_duration,
            COUNT(DISTINCT f.feature_name) as unique_features_used,
            COUNT(f.id) as total_feature_interactions,
            MAX(s.session_start) as last_login,
            DATEDIFF(DAY, MAX(s.session_start), GETDATE()) as days_since_last_login
        FROM Users u
        LEFT JOIN UserSessions s ON u.id = s.user_id 
            AND s.session_start >= @startDate 
            AND s.session_start <= @endDate
        LEFT JOIN FeatureUsage f ON u.id = f.user_id 
            AND f.timestamp >= @startDate 
            AND f.timestamp <= @endDate
        GROUP BY u.id, u.name, u.email, u.role, u.created_at
        ORDER BY total_online_time_minutes DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    request.input("limit", sql.Int, limit);
    request.input("offset", sql.Int, offset);
    
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Get most used features across all users
 */
export const getMostUsedFeatures = async (startDate, endDate, limit = 10) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            feature_name,
            COUNT(*) as usage_count,
            COUNT(DISTINCT user_id) as unique_users,
            AVG(CAST(COUNT(*) as FLOAT)) OVER() as avg_usage_per_feature
        FROM FeatureUsage
        WHERE timestamp >= @startDate AND timestamp <= @endDate
        GROUP BY feature_name
        ORDER BY usage_count DESC
        OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    request.input("limit", sql.Int, limit);
    
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Get daily active users for a date range
 */
export const getDailyActiveUsers = async (startDate, endDate) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            CAST(session_start AS DATE) as date,
            COUNT(DISTINCT user_id) as active_users,
            COUNT(*) as total_sessions,
            AVG(session_duration_minutes) as avg_session_duration
        FROM UserSessions
        WHERE session_start >= @startDate AND session_start <= @endDate
        GROUP BY CAST(session_start AS DATE)
        ORDER BY date DESC
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Get user retention metrics
 */
export const getUserRetentionMetrics = async (startDate, endDate) => {
    const db = await sql.connect(dbConfig);
    const query = `
        WITH UserFirstLogin AS (
            SELECT user_id, MIN(session_start) as first_login_date
            FROM UserSessions
            GROUP BY user_id
        ),
        RetentionData AS (
            SELECT 
                ufl.first_login_date,
                COUNT(DISTINCT ufl.user_id) as cohort_size,
                COUNT(DISTINCT CASE 
                    WHEN s.session_start >= DATEADD(DAY, 1, ufl.first_login_date) 
                    AND s.session_start < DATEADD(DAY, 8, ufl.first_login_date) 
                    THEN s.user_id END) as week1_retained,
                COUNT(DISTINCT CASE 
                    WHEN s.session_start >= DATEADD(DAY, 7, ufl.first_login_date) 
                    AND s.session_start < DATEADD(DAY, 31, ufl.first_login_date) 
                    THEN s.user_id END) as month1_retained
            FROM UserFirstLogin ufl
            LEFT JOIN UserSessions s ON ufl.user_id = s.user_id
            WHERE ufl.first_login_date >= @startDate AND ufl.first_login_date <= @endDate
            GROUP BY ufl.first_login_date
        )
        SELECT 
            first_login_date,
            cohort_size,
            week1_retained,
            month1_retained,
            CASE WHEN cohort_size > 0 THEN (week1_retained * 100.0 / cohort_size) ELSE 0 END as week1_retention_rate,
            CASE WHEN cohort_size > 0 THEN (month1_retained * 100.0 / cohort_size) ELSE 0 END as month1_retention_rate
        FROM RetentionData
        ORDER BY first_login_date DESC
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Update or create daily engagement summary for a user
 */
export const updateEngagementSummary = async (userId, date) => {
    const db = await sql.connect(dbConfig);
    const query = `
        WITH DailySummary AS (
            SELECT 
                @userId as user_id,
                @date as date,
                COALESCE(SUM(s.session_duration_minutes), 0) as total_session_time,
                COUNT(DISTINCT s.id) as total_sessions,
                COUNT(DISTINCT f.feature_name) as features_used,
                (SELECT TOP 1 feature_name 
                 FROM FeatureUsage f2 
                 WHERE f2.user_id = @userId 
                   AND CAST(f2.timestamp AS DATE) = @date 
                 GROUP BY feature_name 
                 ORDER BY COUNT(*) DESC) as most_used_feature,
                MAX(COALESCE(s.session_start, f.timestamp)) as last_activity
            FROM (SELECT @userId as user_id, @date as date) base
            LEFT JOIN UserSessions s ON s.user_id = @userId 
                AND CAST(s.session_start AS DATE) = @date
            LEFT JOIN FeatureUsage f ON f.user_id = @userId 
                AND CAST(f.timestamp AS DATE) = @date
        )
        MERGE EngagementSummary as target
        USING DailySummary as source
        ON target.user_id = source.user_id AND target.date = source.date
        WHEN MATCHED THEN
            UPDATE SET 
                total_session_time_minutes = source.total_session_time,
                total_sessions = source.total_sessions,
                features_used = source.features_used,
                most_used_feature = source.most_used_feature,
                last_activity = source.last_activity
        WHEN NOT MATCHED THEN
            INSERT (user_id, date, total_session_time_minutes, total_sessions, features_used, most_used_feature, last_activity)
            VALUES (source.user_id, source.date, source.total_session_time, source.total_sessions, source.features_used, source.most_used_feature, source.last_activity);
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("date", sql.Date, date);
    
    await request.query(query);
};
