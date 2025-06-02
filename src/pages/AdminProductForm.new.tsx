import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, update, get } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase';
import { toast } from 'sonner';
import { X, Plus, ArrowLeft } from 'lucide-react';
import ImageUrlUploader from '@/components/admin/ImageUrlUploader';
import VideoUrlUploader from '@/components/admin/VideoUrlUploader';

interface ProductFormData {
  name: string;
  description: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  featured: boolean;
  stock?: number;
  showStock?: boolean;
  images?: string[];
  videoUrl?: string;
  specifications?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
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
    originalPrice: undefined,
    discount: undefined,
    category: '',
    featured: false,
    stock: undefined,
    showStock: true,
    images: [],
    videoUrl: '',
    specifications: {}
  });
  
  // Categories state
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Auth state
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadProductData();
    }
    loadCategories();
  }, [isEditMode]);
  
  const loadProductData = async () => {
    if (!id) return;
    
    setLoading(true);
    const db = getDatabase(firebaseApp);
    const productRef = ref(db, `products/${id}`);
    
    try {
      const snapshot = await get(productRef);
      if (snapshot.exists()) {
        const productData = snapshot.val();
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price,
          originalPrice: productData.originalPrice,
          discount: productData.discount,
          category: productData.category || '',
          featured: productData.featured || false,
          stock: productData.stock,
          showStock: productData.showStock !== undefined ? productData.showStock : true,
          images: productData.images || [],
          videoUrl: productData.videoUrl || '',
          specifications: productData.specifications || {}
        });
      } else {
        toast.error('المنتج غير موجود');
        navigate('/admin/products');
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
    
    // Handle different input types
    if (type === 'number') {
      newValue = value === '' ? undefined : Number(value);
    } else if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else {
      newValue = value;
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate field
    const error = validateField(name, newValue);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // Special case for price and original price - calculate discount automatically
    if (name === 'price' || name === 'originalPrice') {
      const price = name === 'price' ? newValue : formData.price;
      const originalPrice = name === 'originalPrice' ? newValue : formData.originalPrice;
      
      // If both price and original price are set, calculate discount
      if (price && originalPrice && originalPrice > price) {
        const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
        
        // Update discount in form data
        setFormData(prev => ({
          ...prev,
          discount: discountPercent
        }));
      }
    }
    
    // Special case for discount
    if (name === 'discount') {
      // If discount is set, original price is required
      if (newValue > 0 && !formData.originalPrice) {
        setFormErrors(prev => ({
          ...prev,
          originalPrice: 'السعر الأصلي مطلوب عند تحديد خصم'
        }));
      } else if (newValue > 0 && formData.originalPrice && formData.price) {
        // If discount is manually set and we have original price and price, adjust the price
        const newPrice = Math.round(formData.originalPrice * (1 - (newValue / 100)));
        setFormData(prev => ({
          ...prev,
          price: newPrice
        }));
      }
    }
    
    // Clear original price error if it's now valid
    if (name === 'originalPrice' && newValue > 0 && formData.discount > 0) {
      setFormErrors(prev => ({
        ...prev,
        originalPrice: ''
      }));
    }
  };
  
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    const value = formData[fieldName as keyof ProductFormData];
    const error = validateField(fieldName, value);
    
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('يرجى إدخال اسم الفئة');
      return;
    }
    
    if (categories.includes(newCategory)) {
      toast.error('الفئة موجودة بالفعل');
      return;
    }
    
    const db = getDatabase(firebaseApp);
    const categoriesRef = ref(db, 'categories');
    
    try {
      const newCategoryRef = push(categoriesRef);
      await update(newCategoryRef, {
        name: newCategory,
        createdAt: new Date().toISOString()
      });
      
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        category: newCategory
      }));
      setNewCategory('');
      setShowCategoryInput(false);
      toast.success('تمت إضافة الفئة بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      toast.error('حدث خطأ أثناء إضافة الفئة');
    }
  };
  
  const handleAddSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        ['خاصية جديدة']: 'القيمة'
      }
    }));
  };
  
  const handleSpecificationChange = (oldKey: string, newKey: string, value: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      
      // If the key has changed, delete the old key and add the new one
      if (oldKey !== newKey) {
        delete newSpecs[oldKey];
      }
      
      newSpecs[newKey] = value;
      
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };
  
  const handleRemoveSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };
  
  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };
  
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    errors.name = validateField('name', formData.name);
    errors.description = validateField('description', formData.description);
    errors.price = validateField('price', formData.price);
    errors.category = validateField('category', formData.category);
    
    // Original price is optional, no validation needed if discount is not set
    if (formData.discount && formData.discount > 0 && (!formData.originalPrice || formData.originalPrice <= 0)) {
      errors.originalPrice = 'السعر الأصلي مطلوب عند تحديد خصم';
    }
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    
    // Update form errors
    setFormErrors(errors);
    
    // Mark all fields as touched
    const allTouched: {[key: string]: boolean} = {};
    Object.keys(errors).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(prev => ({
      ...prev,
      ...allTouched
    }));
    
    return !hasErrors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    setLoading(true);
    const db = getDatabase(firebaseApp);
    
    try {
      // Prepare product data
      const productData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      if (!isEditMode) {
        productData.createdAt = new Date().toISOString();
      }
      
      // Save to Firebase
      if (isEditMode && id) {
        const productRef = ref(db, `products/${id}`);
        await update(productRef, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        const productsRef = ref(db, 'products');
        const newProductRef = push(productsRef);
        await update(newProductRef, productData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      // Navigate back to admin dashboard
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      toast.error('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard')}
          className="mr-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'تعديل منتج' : 'إضافة منتج جديد'}
        </h1>
      </div>
      
      <div className="max-w-4xl mx-auto">
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
                  value={formData.price === undefined ? '' : formData.price}
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
                  السعر الأصلي {formData.discount && formData.discount > 0 ? '*' : '(اختياري)'}
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice === undefined ? '' : formData.originalPrice}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('originalPrice')}
                  className={`w-full px-3 py-2 border ${touched.originalPrice && formErrors.originalPrice ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل السعر الأصلي"
                  min="0"
                  step="0.01"
                />
                {touched.originalPrice && formErrors.originalPrice && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.originalPrice}</p>
                )}
              </div>

              {/* Discount */}
              <div>
                <label htmlFor="discount" className="block text-sm font-medium mb-1">نسبة الخصم (اختياري)</label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount === undefined ? '' : formData.discount}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل نسبة الخصم"
                  min="0"
                  max="100"
                />
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium mb-1">المخزون (اختياري)</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock === undefined ? '' : formData.stock}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('stock')}
                  className={`w-full px-3 py-2 border ${touched.stock && formErrors.stock ? 'border-red-500' : 'border-border'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground`}
                  placeholder="أدخل المخزون"
                  min="0"
                />
                {touched.stock && formErrors.stock && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.stock}</p>
                )}
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
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50"
                  />
                  <label htmlFor="showStock" className="mr-2 text-sm font-medium">
                    عرض المخزون للعملاء
                  </label>
                </div>
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
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50"
                  />
                  <label htmlFor="featured" className="mr-2 text-sm font-medium">
                    منتج مميز
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">الفئة *</label>
                {showCategoryInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                      placeholder="أدخل اسم الفئة الجديدة"
                      dir="rtl"
                    />
                    <div className="flex gap-2">
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
                    onClick={handleAddSpecification}
                    className="px-3 py-1 bg-secondary-foreground/10 text-secondary-foreground rounded-md hover:bg-secondary-foreground/20 transition-colors text-sm"
                  >
                    إضافة خاصية
                  </button>
                </div>
                
                {Object.keys(formData.specifications).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(formData.specifications).map(([key, value], index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => handleSpecificationChange(key, e.target.value, value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                          placeholder="اسم الخاصية"
                          dir="rtl"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleSpecificationChange(key, key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                          placeholder="القيمة"
                          dir="rtl"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(key)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground/60">لا توجد مواصفات. انقر على "إضافة خاصية" لإضافة مواصفات للمنتج.</p>
                )}
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">صور المنتج</label>
                <ImageUrlUploader 
                  initialImages={formData.images}
                  onImagesChange={handleImagesChange}
                />
              </div>
              
              {/* Video URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">فيديو المنتج (اختياري)</label>
                <VideoUrlUploader
                  initialUrl={formData.videoUrl || ''}
                  onVideoUrlChange={(url) => {
                    setFormData(prev => ({
                      ...prev,
                      videoUrl: url
                    }));
                  }}
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                disabled={loading}
              >
                {loading ? 'جاري الحفظ...' : isEditMode ? 'تحديث المنتج' : 'إضافة المنتج'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProductForm;
