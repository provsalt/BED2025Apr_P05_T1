CREATE TABLE UserLoginHistory (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NULL, -- NULL for failed attempts where user doesn't exist
    attempted_email VARCHAR(255) NULL, -- Track attempted email for failed logins
    login_time DATETIME DEFAULT GETDATE() NOT NULL,
    success BIT NOT NULL DEFAULT 1, -- 1 for success, 0 for failure
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    failure_reason VARCHAR(255) NULL, -- 'user_not_found', 'wrong_password', etc.
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);