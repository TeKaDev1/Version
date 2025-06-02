import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFileUpload, useMultipleFileUpload } from '@/hooks/use-file-upload';
import { fileToDataURL } from '@/lib/fileUpload';

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  accept?: string;
  maxSizeMB?: number;
  path?: string;
  useCompression?: boolean;
  maxWidthOrHeight?: number;
  className?: string;
  buttonText?: string;
  dropzoneText?: string;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  accept = 'image/*',
  maxSizeMB = 1,
  path = 'uploads',
  useCompression = true,
  maxWidthOrHeight = 1920,
  className = '',
  buttonText = 'اختر ملفًا',
  dropzoneText = 'اسحب وأفلت الملف هنا أو انقر للاختيار',
  showPreview = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const allowedTypes = accept.split(',').map(type => type.trim());
  
  const { uploading, progress, error, url, uploadFile, reset } = useFileUpload({
    path,
    maxSizeMB,
    maxWidthOrHeight,
    useCompression,
    allowedTypes
  });
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Generate preview
    if (showPreview) {
      try {
        const dataUrl = await fileToDataURL(file);
        setPreview(dataUrl);
      } catch (err) {
        console.error('Error generating preview:', err);
      }
    }
    
    // Upload file
    if (onUploadStart) onUploadStart();
    
    const uploadedUrl = await uploadFile(file);
    
    if (uploadedUrl) {
      if (onUploadComplete) onUploadComplete(uploadedUrl);
    } else if (error && onUploadError) {
      onUploadError(error);
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check if file type is allowed
    if (allowedTypes.length > 0 && !allowedTypes.some(type => {
      // Handle wildcards like image/* or */
      if (type.includes('*')) {
        const [category] = type.split('/');
        return category === '*' || file.type.startsWith(`${category}/`);
      }
      return type === file.type;
    })) {
      if (onUploadError) onUploadError(`نوع الملف غير مسموح به. الأنواع المسموح بها: ${allowedTypes.join(', ')}`);
      return;
    }
    
    // Generate preview
    if (showPreview) {
      try {
        const dataUrl = await fileToDataURL(file);
        setPreview(dataUrl);
      } catch (err) {
        console.error('Error generating preview:', err);
      }
    }
    
    // Upload file
    if (onUploadStart) onUploadStart();
    
    const uploadedUrl = await uploadFile(file);
    
    if (uploadedUrl) {
      if (onUploadComplete) onUploadComplete(uploadedUrl);
    } else if (error && onUploadError) {
      onUploadError(error);
    }
  }, [allowedTypes, error, onUploadComplete, onUploadError, onUploadStart, showPreview, uploadFile]);
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleReset = () => {
    reset();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const isImage = url && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp'));
  
  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={uploading}
      />
      
      {!url && !uploading && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary/50'
          }`}
          onClick={handleButtonClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="w-10 h-10 text-foreground/60 mb-2" />
            <p className="text-sm text-foreground/80 mb-1">{dropzoneText}</p>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-secondary/50 rounded-md flex items-center justify-center overflow-hidden relative mr-3">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-foreground/60" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">جاري الرفع...</span>
                <span className="text-xs text-foreground/60">{progress}%</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && !uploading && (
        <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {url && !uploading && !error && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary/50 rounded-md flex items-center justify-center overflow-hidden relative mr-3">
              {isImage ? (
                <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
              ) : (
                <FileIcon className="w-6 h-6 text-foreground/60" />
              )}
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium truncate max-w-[200px]">تم الرفع بنجاح</p>
              <p className="text-xs text-foreground/60 truncate max-w-[200px]">{url}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-foreground/60 hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface MultipleFileUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  accept?: string;
  maxSizeMB?: number;
  path?: string;
  useCompression?: boolean;
  maxWidthOrHeight?: number;
  className?: string;
  buttonText?: string;
  dropzoneText?: string;
  maxFiles?: number;
}

export const MultipleFileUpload: React.FC<MultipleFileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  accept = 'image/*',
  maxSizeMB = 1,
  path = 'uploads',
  useCompression = true,
  maxWidthOrHeight = 1920,
  className = '',
  buttonText = 'اختر ملفات',
  dropzoneText = 'اسحب وأفلت الملفات هنا أو انقر للاختيار',
  maxFiles = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<{[key: string]: string}>({});
  
  const allowedTypes = accept.split(',').map(type => type.trim());
  
  const { files, uploading, urls, uploadFiles, reset } = useMultipleFileUpload({
    path,
    maxSizeMB,
    maxWidthOrHeight,
    useCompression,
    allowedTypes
  });
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    
    // Check if number of files exceeds maxFiles
    if (selectedFiles.length > maxFiles) {
      if (onUploadError) onUploadError(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }
    
    // Generate previews
    const newPreviews: {[key: string]: string} = {};
    for (const file of selectedFiles) {
      try {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const dataUrl = await fileToDataURL(file);
        newPreviews[fileId] = dataUrl;
      } catch (err) {
        console.error('Error generating preview:', err);
      }
    }
    setPreviews(newPreviews);
    
    // Upload files
    if (onUploadStart) onUploadStart();
    
    const uploadedUrls = await uploadFiles(selectedFiles);
    
    if (uploadedUrls.length > 0) {
      if (onUploadComplete) onUploadComplete(uploadedUrls);
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length === 0) return;
    
    // Check if number of files exceeds maxFiles
    if (droppedFiles.length > maxFiles) {
      if (onUploadError) onUploadError(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }
    
    // Check if all file types are allowed
    const invalidFiles = droppedFiles.filter(file => {
      return !allowedTypes.some(type => {
        // Handle wildcards like image/* or */
        if (type.includes('*')) {
          const [category] = type.split('/');
          return category === '*' || file.type.startsWith(`${category}/`);
        }
        return type === file.type;
      });
    });
    
    if (invalidFiles.length > 0) {
      if (onUploadError) onUploadError(`بعض الملفات من نوع غير مسموح به. الأنواع المسموح بها: ${allowedTypes.join(', ')}`);
      return;
    }
    
    // Generate previews
    const newPreviews: {[key: string]: string} = {};
    for (const file of droppedFiles) {
      try {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const dataUrl = await fileToDataURL(file);
        newPreviews[fileId] = dataUrl;
      } catch (err) {
        console.error('Error generating preview:', err);
      }
    }
    setPreviews(newPreviews);
    
    // Upload files
    if (onUploadStart) onUploadStart();
    
    const uploadedUrls = await uploadFiles(droppedFiles);
    
    if (uploadedUrls.length > 0) {
      if (onUploadComplete) onUploadComplete(uploadedUrls);
    }
  }, [allowedTypes, maxFiles, onUploadComplete, onUploadError, onUploadStart, uploadFiles]);
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleReset = () => {
    reset();
    setPreviews({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple
        className="hidden"
        disabled={uploading}
      />
      
      {Object.keys(files).length === 0 && !uploading && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary/50'
          }`}
          onClick={handleButtonClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="w-10 h-10 text-foreground/60 mb-2" />
            <p className="text-sm text-foreground/80 mb-1">{dropzoneText}</p>
            <p className="text-xs text-foreground/60 mb-2">
              {`الحد الأقصى: ${maxFiles} ملفات`}
            </p>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}
      
      {Object.keys(files).length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">الملفات المرفوعة</h3>
            {!uploading && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-primary hover:text-primary/80"
              >
                إعادة تعيين
              </button>
            )}
          </div>
          
          {Object.entries(files).map(([fileId, fileState]) => {
            const isImage = fileState.url && (
              fileState.url.includes('.jpg') || 
              fileState.url.includes('.jpeg') || 
              fileState.url.includes('.png') || 
              fileState.url.includes('.gif') || 
              fileState.url.includes('.webp')
            );
            
            return (
              <div key={fileId} className="border rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary/50 rounded-md flex items-center justify-center overflow-hidden relative mr-3">
                    {(fileState.url && isImage) ? (
                      <img src={fileState.url} alt="Uploaded" className="w-full h-full object-cover" />
                    ) : previews[fileId] ? (
                      <img src={previews[fileId]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon className="w-5 h-5 text-foreground/60" />
                    )}
                    
                    {fileState.error && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                    
                    {fileState.url && !fileState.error && (
                      <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs truncate max-w-[200px] text-foreground/80">
                        {fileState.error ? 'خطأ في الرفع' : fileState.url ? 'تم الرفع بنجاح' : 'جاري الرفع...'}
                      </span>
                      <span className="text-xs text-foreground/60">
                        {fileState.uploading ? `${fileState.progress}%` : fileState.error ? 'فشل' : fileState.url ? 'تم' : ''}
                      </span>
                    </div>
                    
                    {fileState.uploading && (
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fileState.error ? 'bg-red-500' : 'bg-primary'
                          }`}
                          style={{ width: `${fileState.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {fileState.error && (
                      <p className="text-xs text-red-500 mt-1">{fileState.error}</p>
                    )}
                    
                    {fileState.url && (
                      <p className="text-xs text-foreground/60 truncate max-w-[200px] mt-1">{fileState.url}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;