-- User engagement analytics tables

-- Track user sessions and online time
CREATE TABLE UserSessions (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    session_start DATETIME DEFAULT GETDATE(),
    session_end DATETIME NULL,
    session_duration_minutes INT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Track feature usage across the app
CREATE TABLE FeatureUsage (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    feature_name VARCHAR(100) NOT NULL, -- 'chat', 'announcements', 'medical', etc.
    action_type VARCHAR(50) NOT NULL, -- 'view', 'create', 'update', 'delete', 'click'
    page_url VARCHAR(255),
    timestamp DATETIME DEFAULT GETDATE(),
    session_id INT,
    additional_data NVARCHAR(MAX), -- JSON for extra context
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (session_id) REFERENCES UserSessions(id)
);

-- Track daily/weekly/monthly engagement summaries
CREATE TABLE EngagementSummary (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    date DATE NOT NULL,
    total_session_time_minutes INT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    features_used INT DEFAULT 0,
    most_used_feature VARCHAR(100),
    last_activity DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    UNIQUE(user_id, date)
);

-- Track overall app metrics
CREATE TABLE AppMetrics (
    id INT PRIMARY KEY IDENTITY(1,1),
    metric_date DATE NOT NULL,
    total_active_users INT DEFAULT 0,
    new_users INT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    average_session_duration DECIMAL(10,2) DEFAULT 0,
    most_popular_feature VARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    UNIQUE(metric_date)
);

