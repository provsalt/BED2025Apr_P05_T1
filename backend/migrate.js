import sql from "mssql";
import { dbConfig } from "./config/db.js";
import * as path from "node:path";
import * as fs from "node:fs";

const db = sql.connect(dbConfig);

async function runMigrations() {
  try {
    const pool = await db;

    // Create migrations table if it doesn't exist
    await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Migrations' and xtype='U')
            CREATE TABLE Migrations (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                applied_at DATETIME DEFAULT GETDATE()
            );
        `);
    console.log("Ensured Migrations table exists.");

    const migrationsPath = path.join(process.cwd(), "migrations");
    const files = fs.readdirSync(migrationsPath).sort();

    for (const file of files) {
      if (!file.endsWith(".sql")) {
        continue;
      }

      const migrationName = file;
      const result = await pool.request()
        .input('migrationName', migrationName)
        .query('SELECT COUNT(*) as count FROM Migrations WHERE name = @migrationName');

      if (result.recordset[0].count > 0) {
        console.log(`Migration ${migrationName} already applied. Skipping.`);
        continue;
      }

      const filePath = path.join(migrationsPath, file);
      const sqlQuery = fs.readFileSync(filePath, "utf8");

      try {
        await pool.request().query(sqlQuery);
        await pool.request()
          .input('migrationName', migrationName)
          .query('INSERT INTO Migrations (name) VALUES (@migrationName)');
        console.log(`Migration ${migrationName} executed successfully.`);
      } catch (error) {
        console.error(`Error executing migration ${migrationName}:`, error);
        process.exit(1);
      }
    }
    console.log("All migrations processed.");
  } catch (error) {
    console.error("Database connection or migration error:", error);
    process.exit(1);
  }
}

runMigrations();