-- ====================================================================
-- PASSPORT AUTOMATION SYSTEM (PAS)
-- Supabase PostgreSQL Schema, Row Level Security (RLS), & Storage Setup
-- NOTE: ZERO PASSWORDS STORED IN APPLICATION DATABASE.
-- Authentication, passwords, and sessions are governed exclusively by Supabase Auth.
-- ====================================================================

-- 1. Create Storage Bucket for Passport Supporting Documents (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'passport-documents',
  'passport-documents',
  false, -- STRICTLY PRIVATE BUCKET
  5242880, -- 5 MB Max File Size
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Storage Security Policies
CREATE POLICY "Server Service Role Full Access on passport-documents"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'passport-documents')
WITH CHECK (bucket_id = 'passport-documents');

-- 2. Performance Indexes (Compound & Single-column)
-- User / Profile
CREATE INDEX IF NOT EXISTS "User_authUserId_idx" ON "User"("authUserId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Login History (Authentication Activity Audit)
CREATE INDEX IF NOT EXISTS "LoginHistory_authUserId_idx" ON "LoginHistory"("authUserId");
CREATE INDEX IF NOT EXISTS "LoginHistory_email_idx" ON "LoginHistory"("email");
CREATE INDEX IF NOT EXISTS "LoginHistory_loginTime_idx" ON "LoginHistory"("loginTime");
CREATE INDEX IF NOT EXISTS "LoginHistory_success_idx" ON "LoginHistory"("success");

-- Applicant, Officer, Police
CREATE INDEX IF NOT EXISTS "Applicant_userId_idx" ON "Applicant"("userId");
CREATE INDEX IF NOT EXISTS "PassportOfficer_userId_idx" ON "PassportOfficer"("userId");
CREATE INDEX IF NOT EXISTS "Police_userId_idx" ON "Police"("userId");
CREATE INDEX IF NOT EXISTS "Admin_userId_idx" ON "Admin"("userId");

-- Application
CREATE INDEX IF NOT EXISTS "Application_applicantId_idx" ON "Application"("applicantId");
CREATE INDEX IF NOT EXISTS "Application_officerId_idx" ON "Application"("officerId");
CREATE INDEX IF NOT EXISTS "Application_status_idx" ON "Application"("status");
CREATE INDEX IF NOT EXISTS "Application_serviceType_idx" ON "Application"("serviceType");
CREATE INDEX IF NOT EXISTS "Application_applicationCategory_idx" ON "Application"("applicationCategory");
CREATE INDEX IF NOT EXISTS "Application_submissionDate_idx" ON "Application"("submissionDate");
CREATE INDEX IF NOT EXISTS "Application_status_category_idx" ON "Application"("status", "applicationCategory");

-- ApplicationStatusHistory
CREATE INDEX IF NOT EXISTS "ApplicationStatusHistory_applicationId_idx" ON "ApplicationStatusHistory"("applicationId");
CREATE INDEX IF NOT EXISTS "ApplicationStatusHistory_changedAt_idx" ON "ApplicationStatusHistory"("changedAt");

-- Document Metadata
CREATE INDEX IF NOT EXISTS "Document_applicationId_idx" ON "Document"("applicationId");
CREATE INDEX IF NOT EXISTS "Document_documentType_idx" ON "Document"("documentType");
CREATE INDEX IF NOT EXISTS "Document_verificationStatus_idx" ON "Document"("verificationStatus");

-- Appointment
CREATE INDEX IF NOT EXISTS "Appointment_applicationId_idx" ON "Appointment"("applicationId");
CREATE INDEX IF NOT EXISTS "Appointment_date_slot_idx" ON "Appointment"("date", "timeSlot");
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");

-- Payment
CREATE INDEX IF NOT EXISTS "Payment_applicationId_idx" ON "Payment"("applicationId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx" ON "Payment"("transactionId");

-- Police Report
CREATE INDEX IF NOT EXISTS "PoliceReport_applicationId_idx" ON "PoliceReport"("applicationId");
CREATE INDEX IF NOT EXISTS "PoliceReport_policeId_idx" ON "PoliceReport"("policeId");
CREATE INDEX IF NOT EXISTS "PoliceReport_clearanceStatus_idx" ON "PoliceReport"("clearanceStatus");

-- Passport
CREATE INDEX IF NOT EXISTS "Passport_applicationId_idx" ON "Passport"("applicationId");
CREATE INDEX IF NOT EXISTS "Passport_officerId_idx" ON "Passport"("officerId");
CREATE INDEX IF NOT EXISTS "Passport_dispatchStatus_idx" ON "Passport"("dispatchStatus");

-- Notifications & Audit Logs
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- 3. Row Level Security (RLS) Enablement
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Applicant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PassportOfficer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Police" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApplicationStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PoliceReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Passport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoginHistory" ENABLE ROW LEVEL SECURITY;

-- 4. Server-Side Service Role Full Access (Next.js Application Backend)
CREATE POLICY "Service Role Full Access User" ON "User" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Applicant" ON "Applicant" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access PassportOfficer" ON "PassportOfficer" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Police" ON "Police" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Admin" ON "Admin" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Application" ON "Application" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access ApplicationStatusHistory" ON "ApplicationStatusHistory" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Document" ON "Document" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Appointment" ON "Appointment" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Payment" ON "Payment" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access PoliceReport" ON "PoliceReport" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Passport" ON "Passport" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Notification" ON "Notification" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access AuditLog" ON "AuditLog" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access PasswordResetToken" ON "PasswordResetToken" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access LoginHistory" ON "LoginHistory" FOR ALL TO service_role USING (true) WITH CHECK (true);
