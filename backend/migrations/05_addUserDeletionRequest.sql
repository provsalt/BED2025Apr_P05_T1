ALTER TABLE Users
ADD deletionRequested BIT DEFAULT 0,
    deletionRequestedAt DATETIME NULL; 