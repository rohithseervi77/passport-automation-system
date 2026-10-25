import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { execSync } from "child_process";

const vars = [
  { name: "DATABASE_URL", val: process.env.DATABASE_URL },
  { name: "DIRECT_URL", val: process.env.DIRECT_URL },
  { name: "AUTH_SECRET", val: process.env.AUTH_SECRET },
  { name: "NEXT_PUBLIC_SUPABASE_URL", val: process.env.NEXT_PUBLIC_SUPABASE_URL },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  { name: "SUPABASE_SERVICE_ROLE_KEY", val: process.env.SUPABASE_SERVICE_ROLE_KEY },
  { name: "NEXT_PUBLIC_BASE_URL", val: "https://passport-automation-system-psi.vercel.app" },
];

for (const v of vars) {
  if (!v.val) continue;
  console.log(`Setting ${v.name} on Vercel (production,preview,development)...`);
  try {
    execSync(
      `npx.cmd vercel env add ${v.name} --environment production,preview,development --value "${v.val}" --force --yes`,
      { stdio: "inherit" }
    );
    console.log(`✓ Set ${v.name}`);
  } catch (e) {
    console.error(`Error adding ${v.name}:`, e.message);
  }
}

console.log("All environment variables synced to Vercel!");
