CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    language VARCHAR(50),
    profile_picture_url VARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Admin (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [Users](id)
);

CREATE TABLE CommunityEvent (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    description VARCHAR(500) NOT NULL,
    user_id INT NOT NULL,
    approved_by_admin_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [Users](id),
    FOREIGN KEY (approved_by_admin_id) REFERENCES Admin(user_id)
);

CREATE TABLE CommunityEventSignup (
    user_id INT,
    community_event_id INT,
    signed_up_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, community_event_id),
    FOREIGN KEY (user_id) REFERENCES [Users](id),
    FOREIGN KEY (community_event_id) REFERENCES CommunityEvent(id)
);

CREATE TABLE CommunityEventImage (
    id INT PRIMARY KEY IDENTITY(1,1),
    community_event_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (community_event_id) REFERENCES CommunityEvent(id)
);

CREATE TABLE Chat (
    id INT PRIMARY KEY IDENTITY(1,1),
    created_at DATETIME DEFAULT GETDATE(),
    chat_initiator INT NOT NULL,
    chat_recipient INT NOT NULL,
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (chat_initiator) REFERENCES [Users](id),
    FOREIGN KEY (chat_recipient) REFERENCES [Users](id)
);

CREATE TABLE ChatMsg (
    id INT PRIMARY KEY IDENTITY(1,1),
    chat_id INT NOT NULL,
    msg VARCHAR(1000),
    sender INT NOT NULL,
    msg_created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (chat_id) REFERENCES Chat(id),
    FOREIGN KEY (sender) REFERENCES Users(id)
);

CREATE TABLE MealCategory (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE ScannedMeal (
    id INT PRIMARY KEY IDENTITY(1,1),
    meal_name VARCHAR(100),
    meal_category_id INT NOT NULL,
    carbohydrates DECIMAL(5, 2),
    protein DECIMAL(5, 2),
    fat DECIMAL(5, 2),
    calories DECIMAL(5, 2),
    ingredients VARCHAR(1000),
    scanned_at DATETIME DEFAULT GETDATE(),
    image_url VARCHAR(255),
    user_id INT NOT NULL,
    FOREIGN KEY (meal_category_id) REFERENCES MealCategory(id),
    FOREIGN KEY (user_id) REFERENCES [Users](id)
);

CREATE TABLE MealIngredient (
    scanned_meal_id INT NOT NULL,
    ingredient VARCHAR(100) NOT NULL,
    PRIMARY KEY (scanned_meal_id, ingredient),
    FOREIGN KEY (scanned_meal_id) REFERENCES ScannedMeal(id)
);


CREATE TABLE Medication (
  id INT PRIMARY KEY IDENTITY(1,1),
  user_id INT NOT NULL,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  medicine_time DATETIME NOT NULL,
  frequency_per_day INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES [Users](id)
);


CREATE TABLE MedicationQuestion (
    user_id INT PRIMARY KEY,
    difficulty_walking VARCHAR(255) NOT NULL,
    assistive_device VARCHAR(255) NOT NULL,
    symptoms_or_pain VARCHAR(500) NOT NULL,
    allergies VARCHAR(500) NOT NULL,
    medical_conditions VARCHAR(500) NOT NULL,
    exercise_frequency VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [Users](id)
);

CREATE TABLE HealthSummary (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    summary TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [Users](id)
);
