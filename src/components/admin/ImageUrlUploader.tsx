import React, { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';

interface ImageUrlUploaderProps {
  initialImages?: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUrlUploader: React.FC<ImageUrlUploaderProps> = ({
  initialImages = [],
  onImagesChange
}) => {
  const [images, setImages] = useState<string[]>(initialImages);

  // Add a new image URL
  const handleAddImageUrl = (url: string) => {
    if (!url) return;
    
    const newImages = [...images, url];
    setImages(newImages);
    onImagesChange(newImages);
    toast.success('تم إضافة الصورة بنجاح');
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Display existing images */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">الصور الحالية:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                    رئيسية
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload Component */}
      <div>
        <p className="text-sm font-medium mb-2">إضافة صورة جديدة:</p>
        <ImageUpload 
          onImageUrlChange={handleAddImageUrl}
          initialUrl=""
        />
      </div>
    </div>
  );
};

export default ImageUrlUploader;