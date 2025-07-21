DECLARE @pk NVARCHAR(128) = (SELECT name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('MedicationQuestion') AND type = 'PK')

IF @pk IS NOT NULL
    EXEC('ALTER TABLE MedicationQuestion DROP CONSTRAINT ' + @pk)

ALTER TABLE MedicationQuestion ADD id INT IDENTITY(1,1) PRIMARY KEY




