import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL / DIRECT_URL in environment.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function bootstrapAdmin() {
  console.log("==================================================");
  console.log("PAS — SECURE SERVER-SIDE ADMIN BOOTSTRAP");
  console.log("==================================================");

  // 1. Check if any admin already exists
  const checkRes = await pool.query(`
    SELECT u.id, u.username, u.email, u.role, a."adminCode"
    FROM "User" u
    INNER JOIN "Admin" a ON u.id = a."userId"
    WHERE u.role = 'ADMIN';
  `);

  if (checkRes.rows.length > 0) {
    console.log(`\n⚠️  ADMIN BOOTSTRAP LOCKED:`);
    console.log(`System already has ${checkRes.rows.length} registered Administrator(s):`);
    for (const a of checkRes.rows) {
      console.log(`  - [${a.adminCode}] ${a.username} (${a.email})`);
    }
    console.log("\nTo add additional administrators, log in as an existing administrator");
    console.log("and generate an invitation token via /admin/administrators.");
    await pool.end();
    process.exit(0);
  }

  console.log("\nNo Administrator accounts found. Proceeding with initial setup...");

  const adminEmail = process.argv[2] || "admin.system@pas.gov.in";
  const adminUsername = process.argv[3] || "admin_demo";
  const adminPassword = process.argv[4] || "Admin@123";
  const adminCode = "ADM-HQ-001";

  let authUserId = null;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_SERVICE_ROLE_KEY.includes("YOUR_")) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    console.log(`[Supabase Auth] Provisioning ${adminEmail}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: "ADMIN", username: adminUsername },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        console.log("[Supabase Auth] User exists in auth. Linking ID...");
        const { data: listData } = await supabase.auth.admin.listUsers();
        const found = listData?.users?.find((u) => u.email === adminEmail);
        authUserId = found?.id;
      } else {
        console.error("Supabase Auth error:", error.message);
        await pool.end();
        process.exit(1);
      }
    } else {
      authUserId = data.user.id;
      console.log(`[Supabase Auth] Created identity with ID: ${authUserId}`);
    }
  }

  // Insert User and Admin records
  const userInsertRes = await pool.query(
    `
    INSERT INTO "User" ("authUserId", "username", "email", "role", "isActive", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, 'ADMIN', true, NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET "role" = 'ADMIN', "isActive" = true
    RETURNING id;
  `,
    [authUserId, adminUsername, adminEmail]
  );

  const userId = userInsertRes.rows[0].id;

  await pool.query(
    `
    INSERT INTO "Admin" ("adminCode", "userId")
    VALUES ($1, $2)
    ON CONFLICT ("userId") DO UPDATE SET "adminCode" = $1;
  `,
    [adminCode, userId]
  );

  await pool.query(
    `
    INSERT INTO "AuditLog" ("userId", "action", "entityId", "details", "createdAt")
    VALUES ($1, 'INITIAL_ADMIN_BOOTSTRAP', $2, 'Server-side one-time administrator bootstrap executed', NOW());
  `,
    [userId, adminCode]
  );

  console.log("\n✅ INITIAL ADMINISTRATOR BOOTSTRAP COMPLETE!");
  console.log(`- Username: ${adminUsername}`);
  console.log(`- Email: ${adminEmail}`);
  console.log(`- Admin Code: ${adminCode}`);
  console.log("- Role: ADMIN");
  console.log("\nBootstrap is now permanently locked against further executions.");

  await pool.end();
}

bootstrapAdmin().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
