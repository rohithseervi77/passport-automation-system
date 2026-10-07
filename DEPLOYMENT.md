# 🌐 Passport Automation System (PAS) — Multi-PC & Cloud Deployment Guide

This guide explains how to access the **Passport Automation System** from any PC, phone, or tablet, and how to deploy it live to the public internet for free.

---

## Option 1: Access on Any PC in the Same Local Network / Wi-Fi (Instant, No Cloud Needed)

The development server is configured with `-H 0.0.0.0`, allowing any device connected to your local network (Wi-Fi or Ethernet) to access the system immediately:

1. **Host Computer IP Address:** `http://172.17.177.249:3000`
2. **On any other PC, Laptop, Mac, iPad, or Smartphone:**
   - Open any web browser (Chrome, Edge, Safari, Firefox).
   - Go to: **`http://172.17.177.249:3000`**
3. You can log in, submit applications, verify documents, and track status live across devices in real-time!

---

## Option 2: Deploy to the Public Internet via Vercel (Free 1-Click Deployment)

You can deploy the application to Vercel so that anyone in the world can access it via a public URL (e.g. `https://passport-automation-system.vercel.app`):

### Method A: Deploy via GitHub (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Complete Passport Automation System"
   git push origin main
   ```
2. Go to **[https://vercel.com](https://vercel.com)** and sign in with GitHub.
3. Click **"Add New Project"** and select `passport-automation-system`.
4. In **Environment Variables**, add:
   - `DATABASE_URL`: `file:./dev.db` (or a cloud PostgreSQL / Prisma Postgres URL)
   - `AUTH_SECRET`: (Your 32-character secret key)
5. Click **Deploy**. Vercel will build and give you a live production URL!

### Method B: Deploy via Vercel CLI directly from Terminal
Run the following command in the project folder:
```bash
npx vercel
```
Follow the interactive prompts to deploy in seconds.

---

## Option 3: Deploy via Render / Railway (Free Node.js Hosting)

### Deploying to Render:
1. Go to **[https://render.com](https://render.com)** and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables:
   - `DATABASE_URL`: `file:./dev.db`
   - `AUTH_SECRET`: `...`
5. Click **Create Web Service**.

---

## 🔑 Pre-Seeded Demo Accounts for Evaluation

| Role | Username | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **👤 Applicant** | `applicant_demo` (or `rohith_test2`) | `Applicant@123` | `/applicant/dashboard` |
| **🧑‍💼 Passport Officer** | `officer_demo` | `Officer@123` | `/officer/dashboard` |
| **👮 Police Authority** | `police_demo` | `Police@123` | `/police/dashboard` |
| **🔍 Public Tracker** | *(No login required)* | *(No password)* | `/track` |
