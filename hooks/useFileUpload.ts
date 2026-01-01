import { useState } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getAccessToken = (): string | null => {
  const localData = localStorage.getItem('supabase.auth.token');
  const sessionData = sessionStorage.getItem('supabase.auth.token');
  const data = localData || sessionData;
  
  if (!data) return null;
  
  try {
    const { currentSession } = JSON.parse(data);
    return currentSession?.access_token || null;
  } catch {
    return null;
  }
};

const getUserId = (): string | null => {
  const localData = localStorage.getItem('supabase.auth.token');
  const sessionData = sessionStorage.getItem('supabase.auth.token');
  const data = localData || sessionData;
  
  if (!data) return null;
  
  try {
    const { currentSession } = JSON.parse(data);
    return currentSession?.user?.id || null;
  } catch {
    return null;
  }
};

interface UseFileUploadReturn {
  uploadFile: (file: File, folder?: string) => Promise<{ url: string | null; error?: string }>;
  uploading: boolean;
  progress: number;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, folder: string = 'submisions'): Promise<{ url: string | null; error?: string }> => {
    const token = getAccessToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      return { url: null, error: 'Not authenticated' };
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const randomString = Math.random().toString(36).substring(2, 8);
      const ext = file.name.split('.').pop();
      const uniqueFilename = `${userId}/${timestamp}_${randomString}.${ext}`;
      const filePath = `${folder}/${uniqueFilename}`;

      // Upload to Supabase Storage
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': file.type,
            'x-upsert': 'true',
          },
          body: file,
        }
      );

      setProgress(100);

      if (response.ok) {
        // Get public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${filePath}`;
        setUploading(false);
        return { url: publicUrl };
      } else {
        const errorData = await response.json();
        setUploading(false);
        return { url: null, error: errorData.message || 'Upload failed' };
      }
    } catch (err: any) {
      setUploading(false);
      return { url: null, error: err.message || 'Upload error' };
    }
  };

  return { uploadFile, uploading, progress };
};
