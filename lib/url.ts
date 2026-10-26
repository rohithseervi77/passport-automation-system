/**
 * Resolves the canonical base URL for the application.
 * Follows the strict priority:
 * 1. APP_URL (preferred server-side configuration)
 * 2. NEXT_PUBLIC_SITE_URL
 * 3. NEXT_PUBLIC_BASE_URL
 * 4. VERCEL_PROJECT_PRODUCTION_URL
 * 5. Production fallback: https://passport-automation-system-psi.vercel.app
 * 6. Development fallback: http://localhost:3000
 *
 * Guarantees NO trailing slash to prevent double-slash errors.
 */
export function getAppUrl(): string {
  // 1. Explicit server-side APP_URL
  if (process.env.APP_URL && process.env.APP_URL.trim() !== "") {
    return process.env.APP_URL.trim().replace(/\/+$/, "");
  }

  // 2. Client/Server NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, "");
  }

  // 3. Client/Server NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_BASE_URL.trim().replace(/\/+$/, "");
  }

  // 4. Vercel deployment production domain
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/+$/, "")}`;
  }

  // 5. If running in production mode, return canonical deployed URL
  if (process.env.NODE_ENV === "production") {
    return "https://passport-automation-system-psi.vercel.app";
  }

  // 6. Local development default
  return "http://localhost:3000";
}

/**
 * Builds the canonical password-reset link for an email or user flow.
 * Format: ${APP_URL}/reset-password?token=${token}
 */
export function getPasswordResetUrl(token: string): string {
  const baseUrl = getAppUrl();
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}
