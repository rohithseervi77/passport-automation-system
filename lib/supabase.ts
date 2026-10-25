import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const PASSPORT_DOCUMENTS_BUCKET = "passport-documents";

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Returns the trusted server-side Supabase client initialized with the Service Role key.
 * Never exposed to the browser or client-side bundles.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseAdmin;
  }

  return null;
}

/**
 * Checks if the Supabase Storage credentials are configured.
 */
export function isSupabaseStorageConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Ensures the private passport-documents bucket exists.
 */
export async function ensurePassportDocumentsBucket(): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client) return false;

  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      console.warn("[Supabase Storage] List buckets warning:", error.message);
      return false;
    }

    const exists = buckets.some((b) => b.name === PASSPORT_DOCUMENTS_BUCKET);
    if (!exists) {
      const { error: createError } = await client.storage.createBucket(
        PASSPORT_DOCUMENTS_BUCKET,
        {
          public: false, // Private bucket - strictly protected
          fileSizeLimit: 5242880, // 5MB limit
          allowedMimeTypes: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
        }
      );
      if (createError) {
        console.warn("[Supabase Storage] Create bucket warning:", createError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn("[Supabase Storage] Bucket check error:", err);
    return false;
  }
}

/**
 * Sanitizes a filename to prevent path traversal or invalid characters.
 */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Uploads a document to Supabase Storage under structured path:
 * {applicationId}/{documentType}/{timestamp}-{fileName}
 */
export async function uploadDocumentToStorage(params: {
  applicationId: string;
  documentType: string;
  fileName: string;
  fileBuffer: Buffer | Uint8Array;
  mimeType: string;
}): Promise<{ storagePath: string; error?: string }> {
  const { applicationId, documentType, fileName, fileBuffer, mimeType } = params;
  const client = getSupabaseAdmin();

  const cleanDocType = documentType.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const cleanName = sanitizeFileName(fileName);
  const storagePath = `${applicationId}/${cleanDocType}/${Date.now()}-${cleanName}`;

  if (!client) {
    // Fallback mode if Supabase credentials are not yet configured in local development
    return {
      storagePath: `local-fallback/${storagePath}`,
    };
  }

  try {
    await ensurePassportDocumentsBucket();

    const { error } = await client.storage
      .from(PASSPORT_DOCUMENTS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      return { storagePath, error: error.message };
    }

    return { storagePath };
  } catch (err: any) {
    return { storagePath, error: err.message || "Failed to upload document" };
  }
}

/**
 * Generates a short-lived (default 5 minutes) signed URL for an authorized user.
 */
export async function createDocumentSignedUrl(
  storagePath: string | null | undefined,
  expiresInSeconds: number = 300
): Promise<string | null> {
  if (!storagePath) return null;

  const client = getSupabaseAdmin();

  // If local fallback simulation
  if (!client || storagePath.startsWith("local-fallback/")) {
    return `/uploads/simulated-document.pdf?path=${encodeURIComponent(storagePath)}`;
  }

  try {
    const { data, error } = await client.storage
      .from(PASSPORT_DOCUMENTS_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data) {
      console.warn("[Supabase Storage] Signed URL warning:", error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn("[Supabase Storage] Signed URL exception:", err);
    return null;
  }
}

/**
 * Deletes a document from Supabase Storage.
 */
export async function deleteDocumentFromStorage(storagePath: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  if (!client || storagePath.startsWith("local-fallback/")) return true;

  try {
    const { error } = await client.storage
      .from(PASSPORT_DOCUMENTS_BUCKET)
      .remove([storagePath]);

    return !error;
  } catch {
    return false;
  }
}
