-- User engagement analytics tables

-- Table for tracking user login frequency and patterns
CREATE TABLE UserLoginAnalytics (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    login_date DATE NOT NULL,
    login_count INT DEFAULT 1,
    first_login_time DATETIME NOT NULL,
    last_login_time DATETIME NOT NULL,
    total_session_duration_minutes INT DEFAULT 0,
    device_types NVARCHAR(255), -- JSON array of device types used
    ip_addresses NVARCHAR(500), -- JSON array of IP addresses
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE(user_id, login_date)
);

-- Table for tracking page visits and user engagement
CREATE TABLE PageVisitAnalytics (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    page_url NVARCHAR(255) NOT NULL,
    page_title NVARCHAR(255),
    visit_timestamp DATETIME DEFAULT GETDATE(),
    session_id INT,
    time_spent_seconds INT DEFAULT 0,
    action_type NVARCHAR(50), -- 'view', 'click', 'form_submit', etc.
    referrer_url NVARCHAR(255),
    user_agent NVARCHAR(500),
    device_type NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES UserSessions(id) ON DELETE SET NULL
);

-- Index for fast queries on recent page visits
CREATE INDEX IX_PageVisitAnalytics_UserTime ON PageVisitAnalytics(user_id, visit_timestamp DESC);

-- Table for daily aggregated metrics (for graphical data)
CREATE TABLE DailyMetrics (
    id INT PRIMARY KEY IDENTITY(1,1),
    metric_date DATE NOT NULL,
    total_active_users INT DEFAULT 0,
    total_logins INT DEFAULT 0,
    total_page_views INT DEFAULT 0,
    total_session_time_minutes INT DEFAULT 0,
    avg_session_duration_minutes DECIMAL(10,2) DEFAULT 0,
    new_user_registrations INT DEFAULT 0,
    most_popular_page NVARCHAR(255),
    most_popular_page_views INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    UNIQUE(metric_date)
);

-- Table for user engagement scoring
CREATE TABLE UserEngagementScores (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    score_date DATE NOT NULL,
    login_frequency_score INT DEFAULT 0, -- 0-100 based on login frequency
    page_interaction_score INT DEFAULT 0, -- 0-100 based on page visits and time spent
    feature_usage_score INT DEFAULT 0, -- 0-100 based on feature diversity
    overall_engagement_score INT DEFAULT 0, -- weighted average of above scores
    engagement_level NVARCHAR(20) DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Very High'
    last_activity_date DATETIME,
    days_since_last_login INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE(user_id, score_date)
);

-- Table for real-time activity tracking (last 24 hours focus)
CREATE TABLE RealtimeActivity (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    activity_type NVARCHAR(50) NOT NULL, -- 'login', 'page_visit', 'feature_use', 'logout'
    activity_details NVARCHAR(MAX), -- JSON with details like page, feature name, etc.
    activity_timestamp DATETIME DEFAULT GETDATE(),
    session_id INT,
    ip_address NVARCHAR(45),
    device_type NVARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES UserSessions(id) ON DELETE SET NULL
);

-- Index for fast activity queries
CREATE INDEX IX_RealtimeActivity_UserRecent ON RealtimeActivity(user_id, activity_timestamp DESC); 

-- Table for tracking failed login attempts
CREATE TABLE FailedLoginAttempts (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL,
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    device_type NVARCHAR(50),
    attempt_timestamp DATETIME DEFAULT GETDATE(),
    created_at DATETIME DEFAULT GETDATE()
);

-- Index for fast failed login queries
CREATE INDEX IX_FailedLoginAttempts_EmailTime ON FailedLoginAttempts(email, attempt_timestamp DESC);
CREATE INDEX IX_FailedLoginAttempts_IPTime ON FailedLoginAttempts(ip_address, attempt_timestamp DESC); 

-- Table for Prometheus metrics snapshots (every 5 min)
CREATE TABLE PrometheusMetricsSnapshots (
    id INT PRIMARY KEY IDENTITY(1,1),
    snapshot_time DATETIME NOT NULL,
    avg_login_attempts FLOAT,
    avg_page_visits FLOAT,
    avg_failed_logins FLOAT,
    avg_active_users FLOAT,
    avg_age_groups FLOAT,
    raw_json NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE INDEX IX_PrometheusMetricsSnapshots_Time ON PrometheusMetricsSnapshots(snapshot_time DESC); 

