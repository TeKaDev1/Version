import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';
import { toast } from 'sonner';
import { X, Plus, ArrowLeft, Video, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface ProductFormData {
  name: string;
  description: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  featured: boolean;
  stock?: number;
  showStock?: boolean; // Add this field
  images?: string[];
  videoUrls?: string[];
  videoFiles?: File[];
  specifications?: Record<string, string>;
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  }>({ current: 0, total: 0, percentage: 0 });
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: undefined,
    category: '',
    featured: false,
    stock: undefined,
    showStock: true, // Add this field
    images: [],
    videoUrls: [],
    videoFiles: [],
    specifications: {}
  });
  
  // For direct image URL input
  const [imageUrl, setImageUrl] = useState('');
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // This function is no longer needed as we're using optimizeImage instead
  // Keeping this comment for reference

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else if (isEditMode) {
        // Load product data if in edit mode
        loadProductData();
      }
      
      // Load categories
      loadCategories();
    });
    
    return () => unsubscribe();
  }, [navigate, id, isEditMode]);
  
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field as keyof ProductFormData]);
    setFormErrors(prev => ({ ...prev, [field]: error || '' }));
  };
  
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    
    // Validate URL
    try {
      new URL(imageUrl);
    } catch (e) {
      toast.error('الرجاء إدخال رابط صحيح');
      return;
    }
    
    // Add URL to images array
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
    
    // Clear input
    setImageUrl('');
    toast.success('تمت إضافة الصورة بنجاح');
  };
  
  // Specification handling
  const addSpecification = () => {
    setFormData(prev => {
      const specs = prev.specifications || {};
      const newKey = `خاصية ${Object.keys(specs).length + 1}`;
      return {
        ...prev,
        specifications: {
          ...specs,
          [newKey]: ''
        }
      };
    });
  };
  
  const handleSpecificationChange = (oldKey: string, newKey: string, value: string) => {
    if (!newKey.trim()) return;
    
    setFormData(prev => {
      const specs = {...(prev.specifications || {})};
      delete specs[oldKey];
      return {
        ...prev,
        specifications: {
          ...specs,
          [newKey]: value
        }
      };
    });
  };
  
  const handleSpecificationValueChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value
      }
    }));
  };
  
  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const specs = {...(prev.specifications || {})};
      delete specs[key];
      return {
        ...prev,
        specifications: specs
      };
    });
  };
  
  const loadProductData = async () => {
    if (!id) return;
    
    setLoading(true);
    const db = getDatabase(firebaseApp);
    const productRef = ref(db, `products/${id}`);
    
    try {
      const snapshot = await get(productRef);
      if (snapshot.exists()) {
        const productData = snapshot.val();
        
        // Ensure images is always an array
        if (!productData.images || !Array.isArray(productData.images)) {
          productData.images = [];
        }
        
        // Ensure specifications is always an object
        if (!productData.specifications) {
          productData.specifications = {};
        }
        
        // Ensure showStock has a default value if not present
        if (productData.showStock === undefined) {
          productData.showStock = true;
        }
        
        setFormData(productData);
      } else {
        toast.error('المنتج غير موجود');
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات المنتج:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات المنتج');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    const db = getDatabase(firebaseApp);
    const categoriesRef = ref(db, 'categories');
    
    try {
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesList = Object.values(categoriesData).map((cat: any) => cat.name);
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error('خطأ في تحميل الفئات:', error);
    }
  };
  
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        return value.trim() === '' ? 'اسم المنتج مطلوب' : '';
      case 'description':
        return value.trim() === '' ? 'وصف المنتج مطلوب' : '';
      case 'price':
        return value <= 0 ? 'يجب أن يكون السعر أكبر من صفر' : '';
      case 'originalPrice':
        // Only validate if a value is provided
        if (value && value <= formData.price) {
          return 'يجب أن يكون السعر الأصلي أكبر من السعر الحالي';
        }
        return '';
      case 'category':
        return value.trim() === '' ? 'الفئة مطلوبة' : '';
      case 'stock':
        return value < 0 ? 'يجب أن يكون المخزون صفر أو أكثر' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      newValue = target.checked;
      setFormData({
        ...formData,
        [name]: newValue
      });
    } else if (type === 'number') {
      newValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: newValue
      });
    } else {
      newValue = value;
      setFormData({
        ...formData,
        [name]: newValue
      });
    }
    
    // Validate the field
    const error = validateField(name, newValue);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // Calculate discount if original price and price are set
    if (name === 'originalPrice' || name === 'price') {
      const originalPrice = name === 'originalPrice'
        ? parseFloat(value) || 0
        : formData.originalPrice || 0;
      
      const price = name === 'price'
        ? parseFloat(value) || 0
        : formData.price;
      
      if (originalPrice > 0 && price > 0 && originalPrice > price) {
        const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        setFormData(prev => ({
          ...prev,
          discount
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          discount: undefined
        }));
      }
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Limit to 6 images total
      const totalImages = imageFiles.length + formData.images.length;
      if (totalImages + files.length > 6) {
        toast.error('يمكنك تحميل 6 صور كحد أقصى');
        return;
      }
      
      setImageFiles(prev => [...prev, ...files]);
    }
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if we already have 3 videos
      if (formData.videoFiles.length + formData.videoUrls.length >= 3) {
        toast.error('يمكنك إضافة 3 فيديوهات كحد أقصى');
        return;
      }
      
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('حجم الفيديو كبير جدًا. الحد الأقصى هو 100 ميجابايت');
        return;
      }
      
      // Create preview URL
      const videoUrl = URL.createObjectURL(file);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        videoFiles: [...prev.videoFiles, file]
      }));
      
      // Add to previews
      setVideoPreviews(prev => [...prev, videoUrl]);
    }
  };
  
  // For video URL input
  const [videoUrl, setVideoUrl] = useState('');
  
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };
  
  const handleAddVideoUrl = () => {
    const url = videoUrl.trim();
    
    if (!url) return;
    
    // Check if we already have 3 videos
    if (formData.videoFiles.length + formData.videoUrls.length >= 3) {
      toast.error('يمكنك إضافة 3 فيديوهات كحد أقصى');
      return;
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      toast.error('الرجاء إدخال رابط صحيح');
      return;
    }
    
    // Add URL to videos array
    setFormData(prev => ({
      ...prev,
      videoUrls: [...prev.videoUrls, url]
    }));
    
    // Clear input
    setVideoUrl('');
    toast.success('تمت إضافة رابط الفيديو بنجاح');
  };
  
  const removeVideo = (index: number, type: 'file' | 'url') => {
    if (type === 'file') {
      // Remove from files and previews
      setFormData(prev => ({
        ...prev,
        videoFiles: prev.videoFiles.filter((_, i) => i !== index)
      }));
      
      // Also remove the preview
      setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from URLs
      setFormData(prev => ({
        ...prev,
        videoUrls: prev.videoUrls.filter((_, i) => i !== index)
      }));
    }
  };
  
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Optimize image before upload using browser-image-compression
  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    // If file is smaller than 500KB, don't optimize
    if (file.size < 500 * 1024) {
      console.log(`File ${file.name} is already small (${file.size} bytes), skipping optimization`);
      return file;
    }
    
    try {
      const options = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1200, // Max width/height in pixels
        useWebWorker: true, // Use web worker for better performance
        fileType: 'image/jpeg', // Output format
        initialQuality: 0.8, // Initial quality (0-1)
      };
      
      console.log(`Optimizing image: ${file.name} (${file.size} bytes)`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Optimized image: ${file.size} bytes -> ${compressedFile.size} bytes`);
      
      return compressedFile;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return file; // Return original file if optimization fails
    }
  }, []);

  const uploadImages = useCallback(async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImages(true);
    setUploadProgress({ current: 0, total: imageFiles.length, percentage: 0 });
    
    // Create a toast ID for updating progress
    const toastId = toast.loading(
      <div className="cursor-pointer">
        <div className="font-medium mb-1">جاري تحضير الصور...</div>
        <div className="text-sm">0 من {imageFiles.length} ({0}%)</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>,
      {
        duration: 100000, // Long duration
      }
    );
    
    const storage = getStorage(firebaseApp);
    
    try {
      console.log(`Starting upload of ${imageFiles.length} images`);
      
      // Optimize images first (in parallel)
      toast.loading(
        <div className="cursor-pointer">
          <div className="font-medium mb-1">جاري تحسين جودة الصور...</div>
          <div className="text-sm">يرجى الانتظار...</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>,
        { id: toastId }
      );
      
      // Optimize images in parallel
      const optimizationPromises = imageFiles.map(file => optimizeImage(file));
      const optimizedFiles = await Promise.all(optimizationPromises);
      
      toast.loading(
        <div className="cursor-pointer">
          <div className="font-medium mb-1">جاري رفع الصور...</div>
          <div className="text-sm">0 من {imageFiles.length} ({0}%)</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '20%' }}></div>
          </div>
        </div>,
        { id: toastId }
      );
      
      // Upload images one by one for better error handling
      const results: string[] = [];
      
      for (let i = 0; i < optimizedFiles.length; i++) {
        try {
          const file = optimizedFiles[i];
          console.log(`Processing image ${i + 1}: ${file.name}, size: ${file.size} bytes`);
          
          // Use timestamp and random string to prevent filename collisions
          const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const storagePath = `products/${uniqueId}_${safeFileName}`;
          
          console.log(`Uploading to path: ${storagePath}`);
          const imageRef = storageRef(storage, storagePath);
          // Upload the file with progress tracking
          const uploadTask = uploadBytesResumable(imageRef, file);
          
          // Create a promise to track the upload
          const uploadPromise = new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                // Track progress
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                console.log(`Upload progress for ${file.name}: ${progress}%`);
                
                // Update progress in UI
                const current = i + 1;
                const percentage = Math.round(20 + (current / optimizedFiles.length) * 80 * (progress / 100));
                setUploadProgress({ current, total: optimizedFiles.length, percentage });
                
                // Update toast with progress
                toast.loading(
                  <div className="cursor-pointer">
                    <div className="font-medium mb-1">جاري رفع الصور...</div>
                    <div className="text-sm">{current} من {optimizedFiles.length} ({percentage}%)</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>,
                  { id: toastId }
                );
              },
              (error) => {
                // Handle error
                console.error(`Error uploading ${file.name}:`, error);
                reject(error);
              },
              async () => {
                // Upload completed successfully
                console.log(`Upload successful, size: ${file.size} bytes`);
                
                try {
                  // Get the download URL
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log(`Got download URL: ${downloadURL}`);
                  resolve(downloadURL);
                } catch (error) {
                  console.error('Error getting download URL:', error);
                  reject(error);
                }
              }
            );
          });
          
          // Wait for the upload to complete
          const downloadURL = await uploadPromise;
          results.push(downloadURL);
          results.push(downloadURL);
          
          // Update progress
          const current = i + 1;
          const percentage = Math.round(20 + (current / optimizedFiles.length) * 80); // Start at 20%, go to 100%
          setUploadProgress({ current, total: optimizedFiles.length, percentage });
          
          // Update toast with progress
          toast.loading(
            <div className="cursor-pointer">
              <div className="font-medium mb-1">جاري رفع الصور...</div>
              <div className="text-sm">{current} من {optimizedFiles.length} ({percentage}%)</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>,
            { id: toastId }
          );
        } catch (error) {
          console.error(`خطأ في رفع الصورة ${i + 1}:`, error);
          
          // Update toast with error for this image
          toast.error(
            <div>
              <div className="font-medium mb-1">خطأ في رفع الصورة {i + 1}</div>
              <div className="text-sm">{(error as Error).message}</div>
            </div>
          );
        }
      }
      
      // Update toast with success message
      if (results.length > 0) {
        toast.success(
          <div>
            <div className="font-medium mb-1">تم رفع الصور بنجاح</div>
            <div className="text-sm">تم رفع {results.length} من {optimizedFiles.length} صور</div>
          </div>,
          { id: toastId }
        );
      } else {
        toast.error(
          <div>
            <div className="font-medium mb-1">فشل رفع الصور</div>
            <div className="text-sm">لم يتم رفع أي صورة</div>
          </div>,
          { id: toastId }
        );
      }
      
      console.log(`Upload completed. Successfully uploaded ${results.length} of ${optimizedFiles.length} images`);
      return results;
    } catch (error) {
      console.error('خطأ في معالجة الصور:', error);
      
      // Update toast with error
      toast.error(
        <div>
          <div className="font-medium mb-1">خطأ في معالجة الصور</div>
          <div className="text-sm">{(error as Error).message}</div>
        </div>,
        { id: toastId }
      );
      
      return [];
    } finally {
      setUploadingImages(false);
      setUploadProgress({ current: 0, total: 0, percentage: 0 });
    }
  }, [imageFiles, optimizeImage]);
  
  const uploadVideos = async (): Promise<string[]> => {
    if (formData.videoFiles.length === 0) return formData.videoUrls || [];
    
    setUploadingVideo(true);
    
    // Create a toast ID for updating progress
    const toastId = toast.loading(
      <div className="cursor-pointer">
        <div className="font-medium mb-1">جاري رفع الفيديوهات...</div>
        <div className="text-sm">0 من {formData.videoFiles.length} (0%)</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>,
      {
        duration: 100000, // Long duration
      }
    );
    
    const storage = getStorage(firebaseApp);
    const videoUrls: string[] = [];
    
    try {
      // Upload videos one by one
      for (let i = 0; i < formData.videoFiles.length; i++) {
        const file = formData.videoFiles[i];
        console.log(`Starting video upload ${i+1}/${formData.videoFiles.length}: ${file.name}, size: ${file.size} bytes`);
        
        // Clean the filename to avoid storage path issues
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const storagePath = `products/videos/${uniqueId}_${safeFileName}`;
        
        console.log(`Uploading video to path: ${storagePath}`);
        const videoRef = storageRef(storage, storagePath);
        
        // Update toast with progress
        toast.loading(
          <div className="cursor-pointer">
            <div className="font-medium mb-1">جاري رفع الفيديو {i+1} من {formData.videoFiles.length}...</div>
            <div className="text-sm">0%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>,
          { id: toastId }
        );
        
        // Upload the file with progress tracking
        const uploadTask = uploadBytesResumable(videoRef, file);
        
        // Create a promise to track the upload
        try {
          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                // Track progress
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                console.log(`Video ${i+1} upload progress: ${progress}%`);
                
                // Calculate overall progress
                const overallProgress = Math.round(((i + (progress / 100)) / formData.videoFiles.length) * 100);
                
                // Update toast with progress
                toast.loading(
                  <div className="cursor-pointer">
                    <div className="font-medium mb-1">جاري رفع الفيديو {i+1} من {formData.videoFiles.length}...</div>
                    <div className="text-sm">{progress}% (الإجمالي: {overallProgress}%)</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>,
                  { id: toastId }
                );
              },
              (error) => {
                // Handle error
                console.error(`Error uploading video ${i+1}:`, error);
                reject(error);
              },
              async () => {
                // Upload completed successfully
                console.log(`Video ${i+1} upload successful`);
                
                try {
                  // Get the download URL
                  const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log(`Got video ${i+1} download URL: ${videoUrl}`);
                  videoUrls.push(videoUrl);
                  resolve();
                } catch (error) {
                  console.error(`Error getting video ${i+1} download URL:`, error);
                  reject(error);
                }
              }
            );
          });
        } catch (error) {
          console.error(`Error processing video ${i+1}:`, error);
          toast.error(`فشل في رفع الفيديو ${i+1}`);
          // Continue with next video
          continue;
        }
      }
      
      // Update toast with success
      if (videoUrls.length > 0) {
        toast.success(
          <div>
            <div className="font-medium mb-1">تم رفع الفيديوهات بنجاح</div>
            <div className="text-sm">تم رفع {videoUrls.length} من {formData.videoFiles.length} فيديوهات</div>
          </div>,
          { id: toastId }
        );
      } else {
        toast.error(
          <div>
            <div className="font-medium mb-1">فشل رفع الفيديوهات</div>
            <div className="text-sm">لم يتم رفع أي فيديو</div>
          </div>,
          { id: toastId }
        );
      }
      
      return [...formData.videoUrls, ...videoUrls];
    } catch (error) {
      console.error('خطأ في رفع الفيديوهات:', error);
      
      // Update toast with error
      toast.error(
        <div>
          <div className="font-medium mb-1">خطأ في رفع الفيديوهات</div>
          <div className="text-sm">{(error as Error).message}</div>
        </div>,
        { id: toastId }
      );
      
      return formData.videoUrls;
    } finally {
      setUploadingVideo(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['name', 'description', 'price', 'originalPrice', 'category', 'stock'];
    const newTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setTouched(newTouched);
    
    // Validate all fields
    const errors: {[key: string]: string} = {};
    allFields.forEach(field => {
      // Skip validation for originalPrice if it's not provided
      if (field === 'originalPrice' && !formData.originalPrice) {
        return;
      }
      
      const error = validateField(field, formData[field as keyof ProductFormData]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setFormErrors(errors);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      toast.error('يرجى تصحيح الأخطاء في النموذج', {
        className: 'form-error-toast',
        position: 'top-center',
        duration: 3000,
        icon: <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V9M8 11V11.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      });
      
      // Scroll to the first error
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      
      return;
    }
    
    if (formData.images.length === 0 && imageFiles.length === 0) {
      toast.error('يجب إضافة صورة واحدة على الأقل', {
        className: 'form-error-toast',
        position: 'top-center',
        duration: 3000,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // First save the product data without waiting for image uploads
      const db = getDatabase(firebaseApp);
      
      // Create a temporary product object with existing images
      const initialProductData = {
        name: formData.name,
        description: formData.description,
        price: formData.price || 0,
        originalPrice: formData.originalPrice,
        discount: formData.discount,
        category: formData.category,
        featured: formData.featured,
        stock: formData.stock || 0,
        showStock: formData.showStock, // Add this field
        images: formData.images || [],
        videoUrls: formData.videoUrls || [],
        specifications: formData.specifications || {},
        updatedAt: Date.now()
      };
      
      let productKey: string;
      
      if (isEditMode) {
        // Update existing product
        productKey = id as string;
        const productRef = ref(db, `products/${productKey}`);
        await update(productRef, initialProductData);
        toast.success('تم حفظ بيانات المنتج', {
          description: 'جاري رفع الصور...'
        });
      } else {
        // Add new product
        const productsRef = ref(db, 'products');
        const newProductRef = await push(productsRef, initialProductData);
        productKey = newProductRef.key as string;
        toast.success('تم إضافة المنتج بنجاح', {
          description: 'جاري رفع الصور...'
        });
      }
      
      // Upload images and video before navigating
      try {
        // Upload new images
        let uploadedImageUrls: string[] = [];
        if (imageFiles.length > 0) {
          uploadedImageUrls = await uploadImages();
        }
        
        // Upload videos if provided
        let finalVideoUrls = [...(formData.videoUrls || [])];
        if (formData.videoFiles.length > 0) {
          finalVideoUrls = await uploadVideos();
        }
        
        // Combine existing and new image URLs
        const allImages = [...(formData.images || []), ...uploadedImageUrls];
        
        // Update the product with the final image URLs and videos
        const productRef = ref(db, `products/${productKey}`);
        await update(productRef, {
          images: allImages,
          videoUrls: finalVideoUrls
        });
        
        console.log('Product updated with new images and video');
        toast.success('تم رفع الصور والفيديو بنجاح');
        
        // Navigate to dashboard after everything is complete
        navigate('/admin-dashboard');
      } catch (error) {
        console.error('خطأ في رفع الصور:', error);
        toast.error('حدث خطأ أثناء رفع الصور');
      }
      
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      toast.error('حدث خطأ أثناء حفظ المنتج');
      setLoading(false);
    }
  };

  // Add a new category
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('الرجاء إدخال اسم الفئة');
      return;
    }

    try {
      const db = getDatabase(firebaseApp);
      const categoriesRef = ref(db, 'categories');
      const newCategoryRef = await push(categoriesRef, {
        name: newCategory,
        arabicName: newCategory
      });

      // Add to local categories list
      setCategories(prev => [...prev, newCategory]);
      
      // Set as current category
      setFormData(prev => ({
        ...prev,
        category: newCategory
      }));

      // Reset input
      setNewCategory('');
      setShowCategoryInput(false);
      
      toast.success('تمت إضافة الفئة بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      toast.error('حدث خطأ أثناء إضافة الفئة');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {isEditMode ? 'تعديل منتج' : 'إضافة منتج جديد'}
          </h1>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-md px-3 py-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </button>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-foreground/60">جاري التحميل...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form bg-secondary/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-3 py-2 border ${touched.name && formErrors.name ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل اسم المنتج"
                  dir="rtl"
                />
                {touched.name && formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Product Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-1">وصف المنتج *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  rows={4}
                  className={`w-full px-3 py-2 border ${touched.description && formErrors.description ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل وصف المنتج"
                  dir="rtl"
                />
                {touched.description && formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">السعر *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('price')}
                  className={`w-full px-3 py-2 border ${touched.price && formErrors.price ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل السعر"
                  min="0"
                  step="0.01"
                />
                {touched.price && formErrors.price && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>

              {/* Original Price */}
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium mb-1">
                  السعر الأصلي {formData.price && <span className="text-xs text-foreground/60">(للخصم فقط)</span>}
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                  placeholder="أدخل السعر الأصلي للخصم"
                  min="0"
                  step="0.01"
                />
                {formData.discount !== undefined && formData.discount > 0 && (
                  <p className="mt-1 text-sm text-green-600 font-medium">خصم: {formData.discount}%</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium mb-1">المخزون *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock || ''}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('stock')}
                  className={`w-full px-3 py-2 border ${touched.stock && formErrors.stock ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل كمية المخزون"
                  min="0"
                />
                {touched.stock && formErrors.stock && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.stock}</p>
                )}
              </div>

              {/* Featured */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm font-medium">منتج مميز</label>
                </div>
                <p className="mt-1 text-xs text-foreground/60">المنتجات المميزة تظهر في الصفحة الرئيسية</p>
              </div>

              {/* Show Stock */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showStock"
                    name="showStock"
                    checked={formData.showStock}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary/50"
                  />
                  <label htmlFor="showStock" className="ml-2 block text-sm font-medium">عرض المخزون للعملاء</label>
                </div>
                <p className="mt-1 text-xs text-foreground/60">إظهار كمية المخزون المتبقية في صفحة المنتج</p>
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium mb-1">الفئة *</label>
                {showCategoryInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                      placeholder="أدخل اسم الفئة الجديدة"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      إضافة
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryInput(false)}
                      className="px-3 py-2 bg-secondary-foreground/10 text-secondary-foreground rounded-md hover:bg-secondary-foreground/20 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('category')}
                      className={`flex-1 px-3 py-2 border ${touched.category && formErrors.category ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                      dir="rtl"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryInput(true)}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {touched.category && formErrors.category && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              {/* Specifications */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">المواصفات (اختياري)</label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة مواصفة
                  </button>
                </div>
                
                {Object.entries(formData.specifications || {}).length === 0 ? (
                  <p className="text-sm text-foreground/60 italic">لا توجد مواصفات. انقر على "إضافة مواصفة" لإضافة مواصفات للمنتج.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(formData.specifications || {}).map(([key, value], index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => handleSpecificationChange(key, e.target.value, value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                          placeholder="اسم المواصفة"
                          dir="rtl"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleSpecificationValueChange(key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                          placeholder="قيمة المواصفة"
                          dir="rtl"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">صور المنتج *</label>
                <p className="text-sm text-foreground/60 mb-2">يمكنك تحميل حتى 6 صور. الصورة الأولى إلزامية وستكون الصورة الرئيسية.</p>
                
                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">الصور الحالية:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
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
                
                {/* Image Upload */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">تحميل صور جديدة:</p>
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-foreground/60 mb-2" />
                        <p className="mb-2 text-sm text-foreground/80">
                          <span className="font-medium">انقر لتحميل الصور</span> أو اسحب وأفلت
                        </p>
                        <p className="text-xs text-foreground/60">PNG, JPG, WEBP حتى 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                    
                    {/* Preview of selected files */}
                    {imageFiles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">الصور المحددة:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Image URL Input */}
                <div>
                  <p className="text-sm font-medium mb-2">أو أضف صورة عبر رابط:</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                      placeholder="أدخل رابط الصورة"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Videos */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">فيديوهات المنتج (اختياري)</label>
                  <span className="text-xs text-foreground/60">يمكنك إضافة حتى 3 فيديوهات</span>
                </div>
                
                {/* Current Videos */}
                {(formData.videoUrls.length > 0 || formData.videoFiles.length > 0) && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">الفيديوهات الحالية:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* URL Videos */}
                      {formData.videoUrls.map((url, index) => (
                        <div key={`url-${index}`} className="relative group">
                          <div className="aspect-video bg-secondary/50 rounded-md overflow-hidden border border-border">
                            <iframe
                              src={url.includes('youtube') ? url.replace('watch?v=', 'embed/') : url}
                              className="w-full h-full"
                              title={`فيديو ${index + 1}`}
                              allowFullScreen
                            ></iframe>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(index, 'url')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* File Videos */}
                      {formData.videoFiles.map((_, index) => (
                        <div key={`file-${index}`} className="relative group">
                          <div className="aspect-video bg-secondary/50 rounded-md overflow-hidden border border-border">
                            <video
                              src={videoPreviews[index]}
                              controls
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(index, 'file')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Video Upload */}
                {formData.videoUrls.length + formData.videoFiles.length < 3 && (
                  <div className="mb-4">
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Video className="w-8 h-8 text-foreground/60 mb-2" />
                          <p className="mb-2 text-sm text-foreground/80">
                            <span className="font-medium">انقر لتحميل فيديو</span> أو اسحب وأفلت
                          </p>
                          <p className="text-xs text-foreground/60">MP4, WEBM حتى 100MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoChange}
                        />
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Video URL Input */}
                {formData.videoUrls.length + formData.videoFiles.length < 3 && (
                  <div>
                    <p className="text-sm font-medium mb-2">أو أضف فيديو عبر رابط:</p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="videoUrl"
                        className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                        placeholder="أدخل رابط الفيديو (YouTube, Vimeo, إلخ)"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideoUrl}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || uploadingImages || uploadingVideo}
                className="btn-hover bg-primary text-primary-foreground rounded-md py-3 px-6 font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading || uploadingImages || uploadingVideo ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    {isEditMode ? 'جاري التحديث...' : 'جاري الإضافة...'}
                  </span>
                ) : (
                  isEditMode ? 'تحديث المنتج' : 'إضافة المنتج'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProductForm;
