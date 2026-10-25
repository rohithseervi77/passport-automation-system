import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const { Pool } = pg;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const usersToEnsure = [
  { email: "applicant.demo@pas.gov.in", password: "Applicant@123", username: "applicant_demo", role: "APPLICANT" },
  { email: "officer.central@pas.gov.in", password: "Officer@123", username: "officer_demo", role: "OFFICER" },
  { email: "police.central@pas.gov.in", password: "Police@123", username: "police_demo", role: "POLICE" },
  { email: "admin.system@pas.gov.in", password: "Admin@123", username: "admin_demo", role: "ADMIN" },
];

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  for (const u of usersToEnsure) {
    console.log("Ensuring Supabase Auth user:", u.email);
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { username: u.username, role: u.role },
    });

    let authId = data?.user?.id;
    if (error) {
      if (error.message.includes("already registered") || error.status === 422) {
        console.log("User already registered, fetching existing Auth ID...");
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find((x) => x.email === u.email);
        authId = existing?.id;
      } else {
        console.error("Error creating user:", u.email, error.message);
      }
    }

    if (authId) {
      console.log("Supabase Auth ID for", u.email, "is", authId);
      await pool.query(
        `UPDATE "User" SET "authUserId" = $1 WHERE email = $2 OR username = $3`,
        [authId, u.email, u.username]
      );
      console.log("✓ Successfully mapped User record to Supabase Auth ID:", authId);
    }
  }

  await pool.end();
  console.log("🎉 All Supabase Auth demo users created and linked successfully!");
}

main().catch(console.error);
