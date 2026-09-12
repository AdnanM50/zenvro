import { httpDelete } from '@/lib/http-client';

export interface UploadResponse {
  url: string;
  publicId: string;
}

const UPLOAD_URL = '/api/upload';

export async function uploadFile(file: File, folder: string = 'velour'): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'File upload failed');
  }

  const json = await response.json();
  return json.data || json;
}

export function deleteFile(publicId: string) {
  return httpDelete<null>(UPLOAD_URL, {
    body: JSON.stringify({ publicId }),
  });
}
