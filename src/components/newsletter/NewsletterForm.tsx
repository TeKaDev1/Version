import React, { useState } from 'react';
import { Send, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
// import { sendNewsletterSubscription } from '@/lib/emailjs'; // We'll handle subscription directly with Firebase
import { getDatabase, ref, push, serverTimestamp, query, orderByChild, equalTo, get } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase';

interface NewsletterFormProps {
  className?: string;
  showNameField?: boolean;
  variant?: 'default' | 'compact';
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({
  className = '',
  showNameField = false,
  variant = 'default'
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const db = getDatabase(firebaseApp);
      const subscribersRef = ref(db, 'newsletterSubscribers');

      // Check if email already exists
      const emailQuery = query(subscribersRef, orderByChild('email'), equalTo(formData.email));
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        toast.info('أنت مشترك بالفعل!', {
          description: 'هذا البريد الإلكتروني مسجل بالفعل في قائمتنا البريدية.'
        });
        setIsSuccess(true); // Consider it a success if already subscribed
        setFormData({ email: '', name: '' });
        setIsSubmitting(false);
        return;
      }

      // If not subscribed, add to Firebase
      await push(subscribersRef, {
        email: formData.email,
        name: formData.name || '',
        subscribedAt: serverTimestamp()
      });
      
      // Optionally, you can still call sendNewsletterSubscription if it serves another purpose (e.g., welcome email via EmailJS)
      // await sendNewsletterSubscription({
      //   email: formData.email,
      //   name: formData.name || undefined
      // });

      // Show success state
      setIsSuccess(true);
      toast.success('تم الاشتراك بنجاح!', {
        description: 'سيتم إرسال آخر التحديثات والعروض إلى بريدك الإلكتروني'
      });

      // Reset form after success
      setFormData({ email: '', name: '' });
    } catch (error) {
      console.error('خطأ في الاشتراك:', error);
      toast.error('حدث خطأ أثناء الاشتراك', {
        description: 'يرجى المحاولة مرة أخرى لاحقًا'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="بريدك الإلكتروني"
          className="flex-1 px-4 py-2 text-sm bg-background rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="اشتراك"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    );
  }

  return (
    <div className={`bg-secondary/20 rounded-xl p-6 ${className}`}>
      <h3 className="font-medium text-lg text-foreground mb-4">النشرة الإخبارية</h3>
      <p className="text-sm text-foreground/70 mb-6">
        اشترك في نشرتنا الإخبارية لتلقي التحديثات حول المنتجات الجديدة والعروض الخاصة والترويجات.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {showNameField && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              الاسم
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك"
              className="w-full px-4 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            البريد الإلكتروني <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="أدخل بريدك الإلكتروني"
            className="w-full px-4 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الاشتراك...
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-5 h-5" />
              تم الاشتراك بنجاح
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              اشتراك
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewsletterForm; 