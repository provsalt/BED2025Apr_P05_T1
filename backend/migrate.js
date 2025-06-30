import sql from "mssql";
import {dbConfig} from "./config/db.js";
import * as path from "node:path";
import * as fs from "node:fs";

const db = sql.connect(dbConfig);

const migrationsPath = path.join(process.cwd(), "migrations");
fs.readdir(migrationsPath, (err, files) => {
    if (err) {
        console.error("Error reading migrations directory:", err);
        return;
    }

    files.forEach(async (file) => {
        const filePath = path.join(migrationsPath, file);
        const sqlQuery = fs.readFileSync(filePath, "utf8");

        try {
            const pool = await db;
            await pool.request().query(sqlQuery);
            console.log(`Migration ${file} executed successfully.`);
        } catch (error) {
            console.error(`Error executing migration ${file}:`, error);
        }
    });
});