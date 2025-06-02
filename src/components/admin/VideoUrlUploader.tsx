import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Video, AlertCircle, Loader2 } from 'lucide-react';

interface VideoUrlUploaderProps {
  initialUrl?: string;
  onVideoUrlChange: (url: string) => void;
}

const VideoUrlUploader: React.FC<VideoUrlUploaderProps> = ({
  initialUrl = '',
  onVideoUrlChange
}) => {
  const [videoUrl, setVideoUrl] = useState<string>(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(isValidVideoUrl(initialUrl));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Validate if a string is a valid video URL
  function isValidVideoUrl(url: string): boolean {
    if (!url) return false;
    
    // Check if the URL is valid
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Check if the URL is from a known video platform
      return hostname.includes('youtube.com') || 
             hostname.includes('youtu.be') || 
             hostname.includes('vimeo.com') || 
             hostname.includes('dailymotion.com') || 
             hostname.includes('facebook.com') ||
             hostname.includes('streamable.com');
    } catch (e) {
      return false;
    }
  }

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    // Validate URL
    const valid = isValidVideoUrl(url);
    setIsValidUrl(valid);
    
    if (valid) {
      setError(null);
      onVideoUrlChange(url);
    } else if (url) {
      setError('الرابط غير صالح. يرجى إدخال رابط فيديو صالح من YouTube أو Vimeo أو غيرها.');
    } else {
      setError(null);
      onVideoUrlChange('');
    }
  };

  // Handle opening external video upload services
  const handleOpenUploader = (service: 'streamable' | 'youtube' | 'vimeo') => {
    setIsLoading(true);
    
    // Open the selected service
    switch (service) {
      case 'streamable':
        window.open('https://streamable.com/upload', '_blank');
        break;
      case 'youtube':
        window.open('https://www.youtube.com/upload', '_blank');
        break;
      case 'vimeo':
        window.open('https://vimeo.com/upload', '_blank');
        break;
    }
    
    // Set a timeout to hide the loading indicator after a few seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  // Clear the video URL
  const handleClear = () => {
    setVideoUrl('');
    setIsValidUrl(false);
    setError(null);
    onVideoUrlChange('');
  };

  // Extract video ID for embedding
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
      const match = url.match(youtubeRegex);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)(?:|\/\?)/;
      const match = url.match(vimeoRegex);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    
    // For other services, just return the original URL
    return url;
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium mb-1">
          رابط الفيديو
        </label>
        <div className="relative">
          <input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={handleUrlChange}
            placeholder="أدخل رابط الفيديو هنا"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-primary/50'
            } bg-background text-foreground`}
          />
          {videoUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
            >
              ×
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

      {/* Video Preview */}
      {isValidUrl && videoUrl && (
        <div className="border rounded-md p-2 bg-secondary/20">
          <div className="aspect-video relative rounded overflow-hidden bg-secondary/30">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div>
        <p className="text-sm text-foreground/70 mb-2">
          يمكنك رفع الفيديو على أحد المواقع التالية والحصول على الرابط:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleOpenUploader('streamable')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Streamable
          </button>
          <button
            type="button"
            onClick={() => handleOpenUploader('youtube')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            YouTube
          </button>
          <button
            type="button"
            onClick={() => handleOpenUploader('vimeo')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-sm transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Vimeo
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-foreground/70 bg-secondary/20 p-3 rounded-md">
        <h4 className="font-medium mb-1 flex items-center">
          <Video className="w-4 h-4 mr-1" />
          كيفية رفع الفيديو:
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>انقر على أحد أزرار الرفع أعلاه لفتح موقع استضافة الفيديو.</li>
          <li>قم بإنشاء حساب إذا لم يكن لديك حساب بالفعل.</li>
          <li>ارفع الفيديو على الموقع باتباع التعليمات.</li>
          <li>بعد الرفع، انسخ رابط الفيديو.</li>
          <li>الصق الرابط في حقل "رابط الفيديو" أعلاه.</li>
        </ol>
      </div>
    </div>
  );
};

export default VideoUrlUploader;