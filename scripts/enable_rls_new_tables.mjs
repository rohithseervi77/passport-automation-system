import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const sql = `
    ALTER TABLE "Grievance" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "AppointmentHistory" ENABLE ROW LEVEL SECURITY;
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role Full Access Grievance') THEN
        CREATE POLICY "Service Role Full Access Grievance" ON "Grievance" FOR ALL TO service_role USING (true) WITH CHECK (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role Full Access AppointmentHistory') THEN
        CREATE POLICY "Service Role Full Access AppointmentHistory" ON "AppointmentHistory" FOR ALL TO service_role USING (true) WITH CHECK (true);
      END IF;
    END
    $$;
  `;

  await pool.query(sql);
  console.log("✓ RLS enabled on Grievance and AppointmentHistory!");
  await pool.end();
}

main().catch(console.error);
