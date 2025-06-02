import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  contentType: string;
  size: number;
}

/**
 * Compresses an image file before upload
 * @param imageFile The image file to compress
 * @returns A promise that resolves to the compressed image file
 */
export const compressImage = async (imageFile: File): Promise<File> => {
  try {
    // Check if the file is an image
    if (!imageFile.type.startsWith('image/')) {
      return imageFile; // Return the original file if it's not an image
    }

    // Options for compression
    const options = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height in pixels
      useWebWorker: true,
      fileType: imageFile.type
    };

    // Compress the image
    const compressedFile = await imageCompression(imageFile, options);
    
    // Create a new file with the compressed data
    return new File([compressedFile], imageFile.name, {
      type: imageFile.type,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return imageFile; // Return the original file if compression fails
  }
};

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in Firebase Storage to upload to
 * @param onProgress Optional callback for upload progress
 * @returns A promise that resolves to the download URL
 */
export const uploadFile = async (
  file: File,
  path: string = 'uploads',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  try {
    // Compress the file if it's an image
    const fileToUpload = file.type.startsWith('image/') 
      ? await compressImage(file) 
      : file;
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = fileToUpload.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    // Start the upload
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
    
    // Return a promise that resolves when the upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Return the result
          resolve({
            url: downloadURL,
            path: `${path}/${fileName}`,
            fileName,
            contentType: fileToUpload.type,
            size: fileToUpload.size
          });
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

/**
 * Uploads multiple files to Firebase Storage
 * @param files Array of files to upload
 * @param path The path in Firebase Storage to upload to
 * @param onProgress Optional callback for overall upload progress
 * @returns A promise that resolves to an array of download URLs
 */
export const uploadMultipleFiles = async (
  files: File[],
  path: string = 'uploads',
  onProgress?: UploadProgressCallback
): Promise<UploadResult[]> => {
  try {
    const totalFiles = files.length;
    const results: UploadResult[] = [];
    
    // Upload each file and track overall progress
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      // Create a progress callback that reports overall progress
      const fileProgressCallback = onProgress 
        ? (progress: number) => {
            const overallProgress = ((i / totalFiles) * 100) + (progress / totalFiles);
            onProgress(overallProgress);
          }
        : undefined;
      
      // Upload the file
      const result = await uploadFile(file, path, fileProgressCallback);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error in uploadMultipleFiles:', error);
    throw error;
  }
};

/**
 * Generates a data URL from a file
 * @param file The file to generate a data URL for
 * @returns A promise that resolves to the data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validates a file based on type and size
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSizeMB Maximum file size in MB
 * @returns An object with validation result and error message
 */
export const validateFile = (
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
  maxSizeMB: number = 10
): { valid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `حجم الملف كبير جدًا. الحد الأقصى هو ${maxSizeMB} ميجابايت.`
    };
  }
  
  return { valid: true };
};