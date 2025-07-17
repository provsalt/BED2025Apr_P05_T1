CREATE TABLE UserRoutes (
  id INT IDENTITY(1,1 ),
  user_id INT,
  start_station VARCHAR(100),
  end_station VARCHAR(100)
)