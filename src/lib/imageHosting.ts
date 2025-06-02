/**
 * Utility functions for uploading images to free image hosting services
 * This implementation uses ImgBB as the hosting service
 */

/**
 * Upload an image to ImgBB and get the URL
 * @param file The image file to upload
 * @param onProgress Optional callback for upload progress
 * @returns A promise that resolves to the image URL
 */
export const uploadImageToImgBB = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', file);
    
    // Create an XMLHttpRequest to track progress
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    // Handle response
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.data && response.data.url) {
            resolve(response.data.url);
          } else {
            reject(new Error('Invalid response from ImgBB'));
          }
        } catch (error) {
          reject(new Error('Failed to parse ImgBB response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    
    // Handle errors
    xhr.onerror = function() {
      reject(new Error('Network error during upload'));
    };
    
    // Open and send the request
    xhr.open('POST', 'https://api.imgbb.com/1/upload?key=c1c9df2e8b9b2a7e0e7d8e3c5f9a8d7b', true);
    xhr.send(formData);
  });
};

/**
 * Open ImgBB in a new tab for manual image upload
 * This is a fallback method when API upload is not available
 */
export const openImgBBUploader = (): void => {
  window.open('https://imgbb.com/upload', '_blank');
};

/**
 * Open FileMF in a new tab for manual image upload
 * This is an alternative to ImgBB
 */
export const openFileMFUploader = (): void => {
  window.open('https://file.fm/upload', '_blank');
};

/**
 * Open Postimages in a new tab for manual image upload
 * This is another alternative
 */
export const openPostimagesUploader = (): void => {
  window.open('https://postimages.org/', '_blank');
};

/**
 * Validate if a string is a valid image URL
 * @param url The URL to validate
 * @returns True if the URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if the URL is valid
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Check if the URL points to an image
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) || 
         url.includes('imgur.com') || 
         url.includes('imgbb.com') || 
         url.includes('postimg.cc') || 
         url.includes('file.fm');
};