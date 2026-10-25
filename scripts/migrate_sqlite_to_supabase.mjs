/**
 * Passport Automation System (PAS)
 * Data Migration Script: Local SQLite (dev.db) -> Supabase PostgreSQL
 * 
 * Usage:
 *   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" node scripts/migrate_sqlite_to_supabase.mjs
 */

import Database from "better-sqlite3";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { Pool } = pg;

const sqlitePath = path.resolve(process.cwd(), "dev.db");
const postgresUrl = process.env.DATABASE_URL;

if (!postgresUrl || postgresUrl.startsWith("file:")) {
  console.error("❌ ERROR: DATABASE_URL must be a valid PostgreSQL connection string (Supabase).");
  console.error("Example: DATABASE_URL=\"postgresql://postgres:password@db.xxx.supabase.co:5432/postgres\"");
  process.exit(1);
}

if (!fs.existsSync(sqlitePath)) {
  console.error(`❌ ERROR: Source SQLite database not found at ${sqlitePath}`);
  process.exit(1);
}

const sqlite = new Database(sqlitePath, { readonly: true });
const pool = new Pool({
  connectionString: postgresUrl,
  ssl: postgresUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
  console.log("==================================================");
  console.log("PAS — Migrating SQLite Data to Supabase PostgreSQL");
  console.log("==================================================");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Order of tables respecting foreign key constraints
    const tables = [
      { name: "User", seq: "User_id_seq" },
      { name: "Admin", seq: "Admin_id_seq" },
      { name: "Applicant", seq: "Applicant_id_seq" },
      { name: "PassportOfficer", seq: "PassportOfficer_id_seq" },
      { name: "Police", seq: "Police_id_seq" },
      { name: "Application", seq: "Application_id_seq" },
      { name: "ApplicationStatusHistory", seq: "ApplicationStatusHistory_id_seq" },
      { name: "Document", seq: "Document_id_seq" },
      { name: "Appointment", seq: "Appointment_id_seq" },
      { name: "Payment", seq: "Payment_id_seq" },
      { name: "PoliceReport", seq: "PoliceReport_id_seq" },
      { name: "Passport", seq: "Passport_id_seq" },
      { name: "Notification", seq: "Notification_id_seq" },
      { name: "AuditLog", seq: "AuditLog_id_seq" },
      { name: "PasswordResetToken", seq: "PasswordResetToken_id_seq" },
    ];

    for (const { name: table, seq } of tables) {
      // Check if table exists in SQLite
      const tableCheck = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table);
      if (!tableCheck) {
        console.log(`⚠️  Table ${table} does not exist in SQLite, skipping.`);
        continue;
      }

      const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
      console.log(`\n📦 Migrating ${rows.length} records for "${table}"...`);

      if (rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const quotedCols = columns.map((c) => `"${c}"`).join(", ");

      for (const row of rows) {
        const values = columns.map((col) => {
          let val = row[col];
          // Handle SQLite boolean representations (0 / 1 -> false / true)
          if (
            typeof val === "number" &&
            (col.startsWith("is") || col.startsWith("has") || col === "confirmedDeclaration" || col === "isRead" || col === "isUsed")
          ) {
            val = Boolean(val);
          }
          // Parse date strings if ISO
          if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
            val = new Date(val);
          }
          return val;
        });

        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const insertQuery = `
          INSERT INTO "${table}" (${quotedCols})
          VALUES (${placeholders})
          ON CONFLICT (id) DO NOTHING;
        `;
        await client.query(insertQuery, values);
      }

      // Reset auto-increment sequence in PostgreSQL
      if (seq) {
        try {
          await client.query(`
            SELECT setval(
              pg_get_serial_sequence('"${table}"', 'id'),
              COALESCE((SELECT MAX(id) FROM "${table}"), 1)
            );
          `);
        } catch {
          // Sequence adjustment fallback
        }
      }

      console.log(`✓ Completed ${table}`);
    }

    await client.query("COMMIT");
    console.log("\n==================================================");
    console.log("🎉 MIGRATION COMPLETED SUCCESSFULLY TO SUPABASE!");
    console.log("==================================================");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed with rollback:", err);
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

migrate();
