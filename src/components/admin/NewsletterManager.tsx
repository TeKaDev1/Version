import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, serverTimestamp } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase';
import { toast } from 'sonner';
import { Mail, Users, Send, Loader2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: number;
}

interface NewsletterContent {
  subject: string;
  body: string;
}

const NewsletterManager: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [newsletter, setNewsletter] = useState<NewsletterContent>({ subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);

  // Load subscribers
  useEffect(() => {
    setLoadingSubscribers(true);
    const db = getDatabase(firebaseApp);
    const subscribersRef = ref(db, 'newsletterSubscribers');

    const unsubscribe = onValue(subscribersRef, (snapshot) => {
      const data = snapshot.val();
      const subsList: Subscriber[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          subsList.push({ id: key, ...data[key] });
        });
        // Sort by subscribedAt, newest first
        subsList.sort((a, b) => b.subscribedAt - a.subscribedAt);
      }
      setSubscribers(subsList);
      setLoadingSubscribers(false);
    }, (error) => {
      console.error("Error fetching newsletter subscribers:", error);
      toast.error("حدث خطأ أثناء تحميل قائمة المشتركين.");
      setLoadingSubscribers(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewsletter(prev => ({ ...prev, [name]: value }));
  };

  const handleSendNewsletter = async () => {
    if (!newsletter.subject.trim() || !newsletter.body.trim()) {
      toast.error("الرجاء إدخال موضوع ومحتوى الرسالة الإخبارية.");
      return;
    }
    if (subscribers.length === 0) {
      toast.info("لا يوجد مشتركين لإرسال الرسالة إليهم.");
      return;
    }

    setIsSending(true);
    // In a real application, you would integrate with an email sending service (e.g., SendGrid, Mailgun, or Firebase Cloud Functions with Nodemailer)
    // For this example, we'll simulate sending and save the newsletter content to Firebase.
    try {
      const db = getDatabase(firebaseApp);
      const sentNewslettersRef = ref(db, 'sentNewsletters');
      await push(sentNewslettersRef, {
        ...newsletter,
        sentAt: serverTimestamp(),
        recipientCount: subscribers.length
      });

      toast.success(`تم "إرسال" الرسالة الإخبارية إلى ${subscribers.length} مشترك.`);
      setNewsletter({ subject: '', body: '' }); // Reset form
    } catch (error) {
      console.error("Error sending newsletter:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة الإخبارية.");
    } finally {
      setIsSending(false);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ar-LY', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Compose Newsletter */}
      <div className="lg:col-span-2 bg-secondary rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">إنشاء رسالة إخبارية</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
              الموضوع
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={newsletter.subject}
              onChange={handleNewsletterChange}
              placeholder="موضوع الرسالة الإخبارية"
              className="w-full px-4 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium mb-1.5">
              محتوى الرسالة
            </label>
            <textarea
              id="body"
              name="body"
              value={newsletter.body}
              onChange={handleNewsletterChange}
              rows={10}
              placeholder="اكتب محتوى رسالتك هنا..."
              className="w-full px-4 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleSendNewsletter}
            disabled={isSending}
            className="w-full bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال النشرة (محاكاة)
              </>
            )}
          </button>
          <p className="text-xs text-center text-foreground/60">
            ملاحظة: هذا الإرسال هو محاكاة. لتمكين الإرسال الفعلي، ستحتاج إلى ربط خدمة إرسال بريد إلكتروني.
          </p>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-secondary rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">قائمة المشتركين ({subscribers.length})</h2>
        </div>
        {loadingSubscribers ? (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-foreground/60">جاري تحميل المشتركين...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <p className="text-center text-foreground/60 py-10">لا يوجد مشتركين حاليًا.</p>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-3">
            {subscribers.map(sub => (
              <div key={sub.id} className="bg-background p-3 rounded-md border border-border">
                <p className="font-medium text-sm truncate">{sub.email}</p>
                {sub.name && <p className="text-xs text-foreground/70 truncate">الاسم: {sub.name}</p>}
                <p className="text-xs text-foreground/60">تاريخ الاشتراك: {formatDate(sub.subscribedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManager;