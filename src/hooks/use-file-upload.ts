import { useState, useCallback } from 'react';
import { uploadFile, uploadMultipleFiles, validateFile, UploadResult } from '@/lib/fileUpload';

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export interface MultipleFileUploadState {
  [key: string]: FileUploadState;
}

export interface UseFileUploadOptions {
  path?: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useCompression?: boolean;
  allowedTypes?: string[];
}

/**
 * Hook for handling single file uploads
 */
export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    path = 'uploads',
    maxSizeMB = 1,
    allowedTypes = []
  } = options;

  const [state, setState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null
  });

  const uploadSingleFile = useCallback(
    async (file: File): Promise<string | null> => {
      // Validate file
      const validation = validateFile(file, allowedTypes, maxSizeMB);
      if (!validation.valid) {
        setState({
          uploading: false,
          progress: 0,
          error: validation.error || 'Invalid file',
          url: null
        });
        return null;
      }

      // Reset state
      setState({
        uploading: true,
        progress: 0,
        error: null,
        url: null
      });

      try {
        // Create progress callback
        const onProgress = (progress: number) => {
          setState((prev) => ({ ...prev, progress }));
        };

        // Upload the file
        const result = await uploadFile(file, path, onProgress);

        // Update state with the result
        setState({
          uploading: false,
          progress: 100,
          error: null,
          url: result.url
        });

        return result.url;
      } catch (error) {
        setState({
          uploading: false,
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed',
          url: null
        });
        return null;
      }
    },
    [path, maxSizeMB, allowedTypes]
  );

  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      url: null
    });
  }, []);

  return {
    ...state,
    uploadFile: uploadSingleFile,
    reset
  };
};

/**
 * Hook for handling multiple file uploads
 */
export const useMultipleFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    path = 'uploads',
    maxSizeMB = 1,
    allowedTypes = []
  } = options;

  const [files, setFiles] = useState<MultipleFileUploadState>({});
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);

  const uploadFiles = useCallback(
    async (filesToUpload: File[]): Promise<string[]> => {
      // Initialize state for each file
      const newFiles: MultipleFileUploadState = {};
      
      for (const file of filesToUpload) {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Validate file
        const validation = validateFile(file, allowedTypes, maxSizeMB);
        if (!validation.valid) {
          newFiles[fileId] = {
            uploading: false,
            progress: 0,
            error: validation.error || 'Invalid file',
            url: null
          };
          continue;
        }
        
        newFiles[fileId] = {
          uploading: true,
          progress: 0,
          error: null,
          url: null
        };
      }
      
      setFiles(newFiles);
      setUploading(true);
      
      const fileIds = Object.keys(newFiles);
      const validFiles = fileIds
        .filter(id => !newFiles[id].error)
        .map((id, index) => filesToUpload[index]);
      
      try {
        // Create progress callback
        const onProgress = (progress: number) => {
          // This is a simplified approach - in reality, you'd want to track progress per file
          setFiles(prev => {
            const updated = { ...prev };
            fileIds.forEach(id => {
              if (!updated[id].error) {
                updated[id] = { ...updated[id], progress };
              }
            });
            return updated;
          });
        };
        
        // Upload the files
        const results = await uploadMultipleFiles(validFiles, path, onProgress);
        
        // Extract URLs from results
        const uploadedUrls = results.map(result => result.url);
        
        // Update state with URLs
        setFiles(prev => {
          const updated = { ...prev };
          let urlIndex = 0;
          
          fileIds.forEach(id => {
            if (!updated[id].error) {
              updated[id] = {
                uploading: false,
                progress: 100,
                error: null,
                url: uploadedUrls[urlIndex++] || null
              };
            }
          });
          
          return updated;
        });
        
        setUploading(false);
        setUrls(uploadedUrls);
        return uploadedUrls;
      } catch (error) {
        setUploading(false);
        console.error('Error uploading multiple files:', error);
        return [];
      }
    },
    [path, maxSizeMB, allowedTypes]
  );

  const reset = useCallback(() => {
    setFiles({});
    setUploading(false);
    setUrls([]);
  }, []);

  return {
    files,
    uploading,
    urls,
    uploadFiles,
    reset
  };
};

export default useFileUpload;