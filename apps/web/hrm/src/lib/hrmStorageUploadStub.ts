import { ApiClientError } from '@/lib/apiError';
import { uploadHrmFile } from '@/integrations/hrmApi';

/** Nest multipart upload — returns public URL (no Supabase). */
export async function hrmStorageUploadStub(file: File, feature: string): Promise<string | null> {
  try {
    return await uploadHrmFile(file, feature);
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError({
      status: 0,
      code: 'HRM-FILE-UPLOAD',
      message: error instanceof Error ? error.message : 'Upload failed',
    });
  }
}

export function hrmStorageRemoveStub(_feature: string): void {
  // Object URLs from upload are served by API; no client-side bucket delete in pilot.
}
