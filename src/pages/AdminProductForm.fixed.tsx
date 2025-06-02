import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, update, get } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase';
import { toast } from 'sonner';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { MultipleFileUpload } from '@/components/ui/file-upload';

interface ProductFormData {
  name: string;
  description: string;
  price?: number;
  category: string;
  featured: boolean;
  stock?: number;
  images?: string[];
  specifications?: Record<string, string>;
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: undefined,
    category: '',
    featured: false,
    stock: undefined,
    images: [],
    specifications: {}
  });
  
  // Categories state
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Track uploaded image URLs
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  
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
  
  // Handle image uploads
  const handleImagesUploaded = (urls: string[]) => {
    console.log('Images uploaded:', urls);
    
    // Add URLs to form data
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...urls]
    }));
    
    // Add to our tracking array
    setUploadedImageUrls(prev => [...prev, ...urls]);
    
    toast.success(`تم رفع ${urls.length} صورة بنجاح`);
  };
  
  // Remove an existing image
  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images && prev.images.length > 0 
        ? prev.images.filter((_, i) => i !== index)
        : []
    }));
  };
  
  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    // Add to categories list
    setCategories(prev => [...prev, newCategory]);
    
    // Set as current category
    setFormData(prev => ({
      ...prev,
      category: newCategory
    }));
    
    // Reset input and hide
    setNewCategory('');
    setShowCategoryInput(false);
    
    // Save to database
    const db = getDatabase(firebaseApp);
    const categoriesRef = ref(db, 'categories');
    
    get(categoriesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const newCategoryRef = push(categoriesRef);
        update(newCategoryRef, { name: newCategory });
      } else {
        const newCategoryRef = push(categoriesRef);
        update(newCategoryRef, { name: newCategory });
      }
    });
  };
  
  // Load product data in edit mode
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
  
  // Load categories
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
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
    }
    
    // Handle number inputs
    let newValue: string | number | undefined = value;
    if (type === 'number') {
      if (value === '') {
        newValue = undefined;
      } else {
        newValue = parseFloat(value);
        if (isNaN(newValue)) {
          newValue = undefined;
        }
      }
      
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
  };
  
  // Field validation
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        return !value || value.trim() === '' ? 'اسم المنتج مطلوب' : '';
      case 'description':
        return !value || value.trim() === '' ? 'وصف المنتج مطلوب' : '';
      case 'price':
        return value === undefined || value <= 0 ? 'السعر يجب أن يكون أكبر من صفر' : '';
      case 'category':
        return !value || value.trim() === '' ? 'الفئة مطلوبة' : '';
      case 'stock':
        return value !== undefined && value < 0 ? 'المخزون يجب أن يكون صفر أو أكبر' : '';
      default:
        return '';
    }
  };
  
  // Handle form blur for validation
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field as keyof ProductFormData]);
    setFormErrors(prev => ({ ...prev, [field]: error || '' }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['name', 'description', 'price', 'category', 'stock'];
    const newTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setTouched(newTouched);
    
    // Validate all fields
    const errors: {[key: string]: string} = {};
    allFields.forEach(field => {
      const error = validateField(field, formData[field as keyof ProductFormData]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setFormErrors(errors);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    if (!formData.images || formData.images.length === 0) {
      toast.error('يجب إضافة صورة واحدة على الأقل');
      return;
    }
    
    setLoading(true);
    
    try {
      const db = getDatabase(firebaseApp);
      
      // Create product data object
      const productData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      if (isEditMode) {
        // Update existing product
        const productRef = ref(db, `products/${id}`);
        await update(productRef, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        // Add new product
        const productsRef = ref(db, 'products');
        const newProductRef = push(productsRef);
        await update(newProductRef, {
          ...productData,
          createdAt: new Date().toISOString()
        });
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      // Navigate back to dashboard
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 ml-1" />
          <span>العودة إلى لوحة التحكم</span>
        </button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'تعديل منتج' : 'إضافة منتج جديد'}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-secondary/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                اسم المنتج <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                className={`w-full p-2 rounded-md border ${
                  touched.name && formErrors.name ? 'border-red-500' : 'border-border'
                } bg-background`}
              />
              {touched.name && formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                السعر <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price === undefined ? '' : formData.price}
                onChange={handleChange}
                onBlur={() => handleBlur('price')}
                min="0"
                step="0.01"
                className={`w-full p-2 rounded-md border ${
                  touched.price && formErrors.price ? 'border-red-500' : 'border-border'
                } bg-background`}
              />
              {touched.price && formErrors.price && (
                <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                الفئة <span className="text-red-500">*</span>
              </label>
              {showCategoryInput ? (
                <div className="flex">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 p-2 rounded-r-md border border-border bg-background"
                    placeholder="اسم الفئة الجديدة"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-l-md"
                  >
                    إضافة
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={() => handleBlur('category')}
                    className={`flex-1 p-2 rounded-r-md border ${
                      touched.category && formErrors.category ? 'border-red-500' : 'border-border'
                    } bg-background`}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryInput(true)}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-l-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
              {touched.category && formErrors.category && (
                <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
              )}
            </div>
            
            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-1">
                المخزون
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock === undefined ? '' : formData.stock}
                onChange={handleChange}
                onBlur={() => handleBlur('stock')}
                min="0"
                step="1"
                className={`w-full p-2 rounded-md border ${
                  touched.stock && formErrors.stock ? 'border-red-500' : 'border-border'
                } bg-background`}
              />
              {touched.stock && formErrors.stock && (
                <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              وصف المنتج <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              rows={5}
              className={`w-full p-2 rounded-md border ${
                touched.description && formErrors.description ? 'border-red-500' : 'border-border'
              } bg-background`}
            ></textarea>
            {touched.description && formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>
          
          {/* Featured */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                className="w-4 h-4 text-primary border-border rounded bg-background"
              />
              <label htmlFor="featured" className="ml-2 block text-sm">
                منتج مميز (يظهر في الصفحة الرئيسية)
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">صور المنتج</h3>
            
            {/* Existing Images */}
            {formData.images && formData.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">الصور الحالية:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.images && formData.images.map((image, index) => (
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
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Image Upload Component */}
            <div className="mb-4">
              <MultipleFileUpload
                onUploadComplete={handleImagesUploaded}
                onUploadError={(error) => toast.error(error)}
                path="products"
                accept="image/*"
                maxSizeMB={2}
                maxFiles={6}
                buttonText="اختر الصور"
                dropzoneText="اسحب وأفلت الصور هنا أو انقر للاختيار"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="px-4 py-2 border border-border rounded-md mr-2 hover:bg-secondary transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${
                loading && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {loading ? 'جاري الحفظ...' : isEditMode ? 'تحديث المنتج' : 'إضافة المنتج'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminProductForm;