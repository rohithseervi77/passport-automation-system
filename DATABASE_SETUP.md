# Database & Storage Setup Guide

This guide provides step-by-step instructions for provisioning, configuring, and connecting the **Passport Automation System (PAS)** to **Supabase PostgreSQL** and **Supabase Storage**.

---

## 1. Prerequisites

- A [Supabase](https://supabase.com) account (Free or Pro tier)
- Node.js `20.19.0+` or `24.x`
- Git

---

## 2. Step 1: Create a Supabase Project

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Fill in the project configuration:
   - **Name**: `passport-automation-system`
   - **Database Password**: Choose a strong password (save this securely).
   - **Region**: Choose the closest region (e.g., `South Asia (Mumbai)` for Indian workflows).
4. Click **Create new project** and wait 1-2 minutes for provisioning.

---

## 3. Step 2: Retrieve Database Connection Strings & Keys

Navigate to **Project Settings** in your Supabase dashboard:

### A. Database Connection Strings (`Settings` -> `Database`)
1. Under **Connection Pooling**, copy the **Transaction** mode connection string (Port `6543`). This is your `DATABASE_URL`:
   ```
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
2. Under **Direct Connection**, copy the direct connection string (Port `5432`). This is your `DIRECT_URL`:
   ```
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

### B. API Keys (`Settings` -> `API`)
1. **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
2. **`anon` / `public` Key**: Used for client identification (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. **`service_role` Key**: Secret admin key used for backend storage uploads and RLS bypass (`SUPABASE_SERVICE_ROLE_KEY`).

---

## 4. Step 3: Configure Environment Variables

Create or update `.env.local` in your project root (copied from `.env.example`):

```env
# 1. Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 2. Authentication Secret (32+ character random string)
AUTH_SECRET="passport-automation-system-super-secret-key-32-chars"

# 3. Supabase Storage & SDK
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsIn..."

# 4. App URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 5. Step 4: Push Prisma Schema to Supabase

Run Prisma's push command to automatically create all tables and indexes in your Supabase PostgreSQL database:

```bash
npx prisma db push
```

Or generate and execute standard SQL migrations:

```bash
npx prisma migrate dev --name init_supabase_postgres
```

---

## 6. Step 5: Execute RLS & Storage SQL Script

1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation bar.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository.
3. Paste the contents into the SQL Editor and click **Run**.
4. This script will:
   - Create the private `passport-documents` storage bucket.
   - Set maximum file upload size to 5 MB with MIME type whitelisting.
   - Configure Row Level Security (RLS) on all system tables.
   - Create performance composite indexes for application lookups, status transitions, and audit trails.

---

## 7. Step 6: Populate Seed Data or Migrate from SQLite

### Option A: Seed Fresh Realistic Demo Data
To immediately populate your Supabase database with demo accounts (`applicant_demo`, `officer_demo`, `police_demo`) and realistic sample applications across every workflow stage:

```bash
npm run seed:supabase
```

### Option B: Migrate Existing SQLite (`dev.db`) Data
If you have existing application records in a local `dev.db` file and want to migrate them directly to Supabase:

```bash
npm run migrate:supabase
```

---

## 8. Step 7: Verify Seed Accounts & Workflow

Once seeded, you can log in immediately with the following pre-configured credentials:

| Role | Username | Password | Operational Purpose |
|---|---|---|---|
| **Applicant** | `applicant_demo` | `Applicant@123` | View application, book appointment, upload documents, make simulated payment. |
| **Passport Officer** | `officer_demo` | `Officer@123` | Review documents, grant approval, issue booklet, dispatch passport. |
| **Police Authority** | `police_demo` | `Police@123` | Inspect applicant details, submit residential enquiry report, clear/adverse flag. |

---

## 9. Step 8: Vercel Deployment Configuration

When deploying the application to Vercel:

1. In your Vercel Project Dashboard, navigate to **Settings** -> **Environment Variables**.
2. Add the following variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BASE_URL` (set to `https://passport-automation-system-psi.vercel.app`)
3. Trigger a redeploy:
   ```bash
   npx vercel --prod
   ```
4. Verify your live deployment at:
   `https://passport-automation-system-psi.vercel.app`
