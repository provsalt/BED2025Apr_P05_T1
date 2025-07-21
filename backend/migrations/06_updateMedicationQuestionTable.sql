SELECT name
FROM sys.key_constraints
WHERE parent_object_id = OBJECT_ID('MedicationQuestion') AND type = 'PK';

ALTER TABLE MedicationQuestion
DROP CONSTRAINT PK__Medicati__B9BE370F71ECE7A9;

ALTER TABLE MedicationQuestion
ADD id INT IDENTITY(1,1) PRIMARY KEY;
