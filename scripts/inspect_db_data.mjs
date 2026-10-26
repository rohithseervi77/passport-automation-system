import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function inspect() {
  const client = await pool.connect();
  try {
    console.log("=========================================");
    console.log("PAS DATABASE AUDIT & INSPECTION (SUPABASE)");
    console.log("=========================================");

    // Check all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("\n[EXISTING DATABASE TABLES]:");
    console.log(tablesRes.rows.map(r => r.table_name).join(", "));

    // 1. Notice table audit
    const noticeCountRes = await client.query(`SELECT count(*) as count FROM "Notice"`);
    console.log(`\n[NOTICES] Total rows: ${noticeCountRes.rows[0].count}`);

    const noticesRes = await client.query(`
      SELECT id, "noticeId", slug, title, status, "publishedAt", 
             EXTRACT(YEAR FROM "publishedAt")::int as pub_year
      FROM "Notice"
      ORDER BY "publishedAt" DESC
    `);
    console.log("[NOTICES LIST]:");
    for (const r of noticesRes.rows) {
      console.log(`  #${r.id} [${r.noticeId}] Year: ${r.pub_year} | (${r.status}) | ${r.title.slice(0, 60)}...`);
    }

    const noticeYearsRes = await client.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM "publishedAt")::int as year, count(*) as count
      FROM "Notice"
      WHERE "publishedAt" IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM "publishedAt")
      ORDER BY year DESC;
    `);
    console.log("\n[DISTINCT NOTICE YEARS]:", noticeYearsRes.rows);

    // 2. Application table audit
    const appCountRes = await client.query(`SELECT count(*) as count FROM "Application"`);
    const appYearsRes = await client.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM "createdAt")::int as year, count(*) as count
      FROM "Application"
      GROUP BY EXTRACT(YEAR FROM "createdAt")
      ORDER BY year DESC;
    `);
    console.log(`\n[APPLICATIONS] Total: ${appCountRes.rows[0].count}`);
    console.log("[APPLICATION YEARS]:", appYearsRes.rows);

    // 3. User & Audit table audit
    const userCountRes = await client.query(`SELECT count(*) as count FROM "User"`);
    const feeCountRes = await client.query(`SELECT count(*) as count FROM "FeeSchedule"`);
    const centreCountRes = await client.query(`SELECT count(*) as count FROM "PassportCenter"`);
    const grvCountRes = await client.query(`SELECT count(*) as count FROM "Grievance"`);
    const auditCountRes = await client.query(`SELECT count(*) as count FROM "AuditLog"`);

    console.log(`\n[ROW COUNTS ACROSS SYSTEM]:`);
    console.log(`- Users: ${userCountRes.rows[0].count}`);
    console.log(`- Fee Schedules: ${feeCountRes.rows[0].count}`);
    console.log(`- Passport Centres: ${centreCountRes.rows[0].count}`);
    console.log(`- Grievance Tickets: ${grvCountRes.rows[0].count}`);
    console.log(`- Audit Log Entries: ${auditCountRes.rows[0].count}`);

    // Check if any table in the entire database has records from 2025
    console.log("\n[CHECKING FOR 2025 RECORDS IN DATABASE]:");
    const notice2025 = await client.query(`
      SELECT count(*) as count FROM "Notice" WHERE EXTRACT(YEAR FROM "publishedAt") = 2025;
    `);
    console.log(`- Notice rows with year 2025: ${notice2025.rows[0].count}`);

    const app2025 = await client.query(`
      SELECT count(*) as count FROM "Application" WHERE EXTRACT(YEAR FROM "createdAt") = 2025;
    `);
    console.log(`- Application rows with year 2025: ${app2025.rows[0].count}`);

    const audit2025 = await client.query(`
      SELECT count(*) as count FROM "AuditLog" WHERE EXTRACT(YEAR FROM "createdAt") = 2025;
    `);
    console.log(`- AuditLog rows with year 2025: ${audit2025.rows[0].count}`);

  } catch (err) {
    console.error("Inspect error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
