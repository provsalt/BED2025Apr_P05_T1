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

/**
 * Track login attempt (successful or failed)
 */
export const trackLoginAttempt = async (userId, loginData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO UserLoginAnalytics (user_id, login_date, login_count, first_login_time, last_login_time, ip_addresses, device_types)
        VALUES (@userId, CAST(GETDATE() AS DATE), 1, GETDATE(), GETDATE(), @ipAddress, @deviceType)
        ON DUPLICATE KEY UPDATE
            login_count = login_count + 1,
            last_login_time = GETDATE(),
            ip_addresses = CASE 
                WHEN ip_addresses IS NULL THEN @ipAddress
                WHEN ip_addresses NOT LIKE '%' + @ipAddress + '%' THEN ip_addresses + ',' + @ipAddress
                ELSE ip_addresses
            END,
            device_types = CASE 
                WHEN device_types IS NULL THEN @deviceType
                WHEN device_types NOT LIKE '%' + @deviceType + '%' THEN device_types + ',' + @deviceType
                ELSE device_types
            END,
            updated_at = GETDATE();
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("ipAddress", sql.VarChar(45), loginData.ipAddress || null);
    request.input("deviceType", sql.VarChar(50), loginData.deviceType || null);
    
    await request.query(query);
};

/**
 * Track failed login attempt
 */
export const trackFailedLoginAttempt = async (email, loginData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO FailedLoginAttempts (email, ip_address, user_agent, device_type, attempt_timestamp)
        VALUES (@email, @ipAddress, @userAgent, @deviceType, GETDATE());
    `;
    const request = db.request();
    request.input("email", sql.VarChar(255), email);
    request.input("ipAddress", sql.VarChar(45), loginData.ipAddress || null);
    request.input("userAgent", sql.VarChar(500), loginData.userAgent || null);
    request.input("deviceType", sql.VarChar(50), loginData.deviceType || null);
    
    await request.query(query);
};

/**
 * Track page visit
 */
export const trackPageVisit = async (userId, pageData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO PageVisitAnalytics (user_id, page_url, page_title, visit_timestamp, session_id, action_type, referrer_url, user_agent, device_type)
        VALUES (@userId, @pageUrl, @pageTitle, GETDATE(), @sessionId, @actionType, @referrerUrl, @userAgent, @deviceType);
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("pageUrl", sql.VarChar(255), pageData.pageUrl);
    request.input("pageTitle", sql.VarChar(255), pageData.pageTitle || null);
    request.input("sessionId", sql.Int, pageData.sessionId || null);
    request.input("actionType", sql.VarChar(50), pageData.actionType || 'view');
    request.input("referrerUrl", sql.VarChar(255), pageData.referrerUrl || null);
    request.input("userAgent", sql.VarChar(500), pageData.userAgent || null);
    request.input("deviceType", sql.VarChar(50), pageData.deviceType || null);
    
    await request.query(query);
};

/**
 * Get user metrics by age group
 */
export const getUserMetricsByAge = async (startDate, endDate) => {
    const db = await sql.connect(dbConfig);
    const query = `
        WITH UserAgeGroups AS (
            SELECT 
                u.id,
                u.name,
                u.email,
                u.date_of_birth,
                CASE 
                    WHEN DATEDIFF(YEAR, u.date_of_birth, GETDATE()) < 18 THEN 'Under 18'
                    WHEN DATEDIFF(YEAR, u.date_of_birth, GETDATE()) BETWEEN 18 AND 25 THEN '18-25'
                    WHEN DATEDIFF(YEAR, u.date_of_birth, GETDATE()) BETWEEN 26 AND 35 THEN '26-35'
                    WHEN DATEDIFF(YEAR, u.date_of_birth, GETDATE()) BETWEEN 36 AND 50 THEN '36-50'
                    WHEN DATEDIFF(YEAR, u.date_of_birth, GETDATE()) BETWEEN 51 AND 65 THEN '51-65'
                    ELSE '65+'
                END as age_group,
                COUNT(DISTINCT s.id) as total_sessions,
                COUNT(DISTINCT p.id) as total_page_visits,
                COUNT(DISTINCT l.id) as total_logins
            FROM Users u
            LEFT JOIN UserSessions s ON u.id = s.user_id 
                AND s.session_start >= @startDate 
                AND s.session_start <= @endDate
            LEFT JOIN PageVisitAnalytics p ON u.id = p.user_id 
                AND p.visit_timestamp >= @startDate 
                AND p.visit_timestamp <= @endDate
            LEFT JOIN UserLoginAnalytics l ON u.id = l.user_id 
                AND l.login_date >= CAST(@startDate AS DATE) 
                AND l.login_date <= CAST(@endDate AS DATE)
            WHERE u.date_of_birth IS NOT NULL
            GROUP BY u.id, u.name, u.email, u.date_of_birth
        )
        SELECT 
            age_group,
            COUNT(*) as total_users,
            AVG(CAST(total_sessions AS FLOAT)) as avg_sessions_per_user,
            AVG(CAST(total_page_visits AS FLOAT)) as avg_page_visits_per_user,
            AVG(CAST(total_logins AS FLOAT)) as avg_logins_per_user,
            SUM(total_sessions) as total_sessions,
            SUM(total_page_visits) as total_page_visits,
            SUM(total_logins) as total_logins
        FROM UserAgeGroups
        GROUP BY age_group
        ORDER BY 
            CASE age_group
                WHEN 'Under 18' THEN 1
                WHEN '18-25' THEN 2
                WHEN '26-35' THEN 3
                WHEN '36-50' THEN 4
                WHEN '51-65' THEN 5
                WHEN '65+' THEN 6
            END;
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Get most frequently visited pages
 */
export const getMostFrequentPages = async (startDate, endDate, limit = 10) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            page_url,
            page_title,
            COUNT(*) as visit_count,
            COUNT(DISTINCT user_id) as unique_users,
            AVG(CAST(time_spent_seconds AS FLOAT)) as avg_time_spent_seconds
        FROM PageVisitAnalytics
        WHERE visit_timestamp >= @startDate AND visit_timestamp <= @endDate
        GROUP BY page_url, page_title
        ORDER BY visit_count DESC
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
 * Get login attempt statistics
 */
export const getLoginAttemptStats = async (startDate, endDate) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            CAST(login_date AS DATE) as date,
            COUNT(*) as total_logins,
            COUNT(DISTINCT user_id) as unique_users_logging_in,
            AVG(CAST(login_count AS FLOAT)) as avg_logins_per_user
        FROM UserLoginAnalytics
        WHERE login_date >= CAST(@startDate AS DATE) AND login_date <= CAST(@endDate AS DATE)
        GROUP BY CAST(login_date AS DATE)
        ORDER BY date DESC
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Get failed login attempts
 */
export const getFailedLoginAttempts = async (startDate, endDate, limit = 100) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            email,
            ip_address,
            device_type,
            attempt_timestamp,
            user_agent
        FROM FailedLoginAttempts
        WHERE attempt_timestamp >= @startDate AND attempt_timestamp <= @endDate
        ORDER BY attempt_timestamp DESC
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
 * Get comprehensive user metrics dashboard data
 */
export const getUserMetricsDashboard = async (startDate, endDate) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM Users WHERE created_at >= @startDate AND created_at <= @endDate) as new_users,
            (SELECT COUNT(DISTINCT user_id) FROM UserSessions WHERE session_start >= @startDate AND session_start <= @endDate) as active_users,
            (SELECT COUNT(*) FROM UserLoginAnalytics WHERE login_date >= CAST(@startDate AS DATE) AND login_date <= CAST(@endDate AS DATE)) as total_logins,
            (SELECT COUNT(*) FROM PageVisitAnalytics WHERE visit_timestamp >= @startDate AND visit_timestamp <= @endDate) as total_page_visits,
            (SELECT COUNT(*) FROM FailedLoginAttempts WHERE attempt_timestamp >= @startDate AND attempt_timestamp <= @endDate) as failed_login_attempts,
            (SELECT AVG(CAST(session_duration_minutes AS FLOAT)) FROM UserSessions WHERE session_start >= @startDate AND session_start <= @endDate) as avg_session_duration
    `;
    const request = db.request();
    request.input("startDate", sql.DateTime, startDate);
    request.input("endDate", sql.DateTime, endDate);
    
    const result = await request.query(query);
    return result.recordset[0];
};

/**
 * Store a Prometheus metrics snapshot (every 5 min)
 */
export const storePrometheusSnapshot = async (snapshot) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO PrometheusMetricsSnapshots (
            snapshot_time,
            avg_login_attempts,
            avg_page_visits,
            avg_failed_logins,
            avg_active_users,
            avg_age_groups,
            raw_json
        ) VALUES (
            @snapshotTime,
            @avgLoginAttempts,
            @avgPageVisits,
            @avgFailedLogins,
            @avgActiveUsers,
            @avgAgeGroups,
            @rawJson
        );
    `;
    const request = db.request();
    request.input("snapshotTime", sql.DateTime, snapshot.timestamp);
    request.input("avgLoginAttempts", sql.Float, snapshot.avgLoginAttempts);
    request.input("avgPageVisits", sql.Float, snapshot.avgPageVisits);
    request.input("avgFailedLogins", sql.Float, snapshot.avgFailedLogins);
    request.input("avgActiveUsers", sql.Float, snapshot.avgActiveUsers);
    request.input("avgAgeGroups", sql.Float, snapshot.avgAgeGroups);
    request.input("rawJson", sql.NVarChar(sql.MAX), JSON.stringify(snapshot.raw));
    await request.query(query);
};
