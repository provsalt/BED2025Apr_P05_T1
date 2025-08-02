#!/usr/bin/env node

import fs from "fs";
import path from "path";

const generateMigration = (name) => {
  if (!name) {
    console.error("Error: Migration name is required");
    console.log("Usage: pnpm migrate:create <migration_name>");
    console.log("Example: pnpm migrate:create add_user_table");
    process.exit(1);
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const filename = `${timestamp}_${name}.sql`;
  const filepath = path.join("migrations", filename);

  const template = `-- Migration: ${filename}
-- Created: ${now.toISOString()}

`;

  if (!fs.existsSync("migrations")) {
    fs.mkdirSync("migrations");
  }

  fs.writeFileSync(filepath, template);
  console.log(`Migration file created: ${filepath}`);
};

const migrationName = process.argv[2];
generateMigration(migrationName);