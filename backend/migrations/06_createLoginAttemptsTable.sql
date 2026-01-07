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
