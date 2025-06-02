import React, { useState } from 'react';
import { Upload, X, ExternalLink, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { openImgBBUploader, openFileMFUploader, openPostimagesUploader, isValidImageUrl } from '@/lib/imageHosting';

interface ImageUploadProps {
  onImageUrlChange: (url: string) => void;
  initialUrl?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUrlChange,
  initialUrl = '',
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(isValidImageUrl(initialUrl));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Validate URL
    const valid = isValidImageUrl(url);
    setIsValidUrl(valid);
    
    if (valid) {
      setError(null);
      onImageUrlChange(url);
    } else if (url) {
      setError('الرابط غير صالح. يرجى إدخال رابط صورة صالح.');
    } else {
      setError(null);
    }
  };

  // Handle opening external image upload services
  const handleOpenUploader = (service: 'imgbb' | 'filefm' | 'postimages') => {
    setIsLoading(true);
    
    // Open the selected service
    switch (service) {
      case 'imgbb':
        openImgBBUploader();
        break;
      case 'filefm':
        openFileMFUploader();
        break;
      case 'postimages':
        openPostimagesUploader();
        break;
    }
    
    // Set a timeout to hide the loading indicator after a few seconds
    // This is just for UX, as we can't track when the user has completed the upload
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  // Clear the image URL
  const handleClear = () => {
    setImageUrl('');
    setIsValidUrl(false);
    setError(null);
    onImageUrlChange('');
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            رابط الصورة
          </label>
          <div className="relative">
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="أدخل رابط الصورة هنا"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                error ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-primary/50'
              } bg-background text-foreground`}
            />
            {imageUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="border rounded-md p-2 bg-secondary/20">
            <div className="aspect-video relative rounded overflow-hidden bg-secondary/30">
              <img
                src={imageUrl}
                alt="معاينة الصورة"
                className="w-full h-full object-contain"
                onError={() => {
                  setIsValidUrl(false);
                  setError('تعذر تحميل الصورة. يرجى التحقق من الرابط.');
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Options */}
        <div>
          <p className="text-sm text-foreground/70 mb-2">
            يمكنك رفع الصورة على أحد المواقع التالية والحصول على الرابط:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleOpenUploader('imgbb')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              ImgBB
            </button>
            <button
              type="button"
              onClick={() => handleOpenUploader('filefm')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              File.fm
            </button>
            <button
              type="button"
              onClick={() => handleOpenUploader('postimages')}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              PostImages
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-foreground/70 bg-secondary/20 p-3 rounded-md">
          <h4 className="font-medium mb-1 flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            كيفية رفع الصورة:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>انقر على أحد أزرار الرفع أعلاه لفتح موقع استضافة الصور.</li>
            <li>ارفع الصورة على الموقع باتباع التعليمات.</li>
            <li>بعد الرفع، انسخ رابط الصورة المباشر (Direct link).</li>
            <li>الصق الرابط في حقل "رابط الصورة" أعلاه.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;