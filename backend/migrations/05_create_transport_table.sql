CREATE TABLE UserRoutes (
  id INT IDENTITY(1,1 ),
  user_id INT,
  name VARCHAR(255),
  start_station VARCHAR(100),
  end_station VARCHAR(100)
)