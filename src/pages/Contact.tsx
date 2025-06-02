import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, MessageSquare, User, AtSign, Map } from 'lucide-react';
import { sendContactFormEmail } from '@/lib/emailjs';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const [showMap, setShowMap] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await sendContactFormEmail({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      
      setSubmitStatus({
        success: true,
        message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus({
        success: false,
        message: 'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-background pt-16">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl opacity-70"></div>
        
        <div className="relative container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">اتصل بنا</h1>
            <p className="text-lg text-foreground/80 mb-8">
              نحن هنا للإجابة على أسئلتك ومساعدتك في أي استفسارات. لا تتردد في التواصل معنا.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary/20 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">العنوان</h3>
              <p className="text-foreground/70">
                حي الانتصار , طرابلس،<br />
                ليبيا
              </p>
              <button
                onClick={() => setShowMap(!showMap)}
                className="mt-3 text-sm text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Map className="w-4 h-4" />
                <span>{showMap ? 'إخفاء الخريطة' : 'عرض الخريطة'}</span>
              </button>
              
              {showMap && (
                <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.123456789012!2d13.12345678901234!3d32.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA3JzI0LjQiTiAxM8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sly!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              )}
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">الهاتف</h3>
              <p className="text-foreground/70">
                <a href="tel:+218123456789" className="hover:text-primary transition-colors">
                  <span dir="ltr" style={{ unicodeBidi: 'bidi-override', direction: 'ltr' }}>+218 092 2078595</span>
                </a>
              </p>
              <p className="text-foreground/70 mt-1">
                <a href="tel:+218987654321" className="hover:text-primary transition-colors">
                  <span dir="ltr" style={{ unicodeBidi: 'bidi-override', direction: 'ltr' }}>+218 091 1396826</span>
                </a>
              </p>
            </div>
            
            <div className="bg-secondary/20 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">البريد الإلكتروني</h3>
              <p className="text-foreground/70">
                <a href="mailto:info@elegance.com" className="hover:text-primary transition-colors">
                  info@dkhil.com
                </a>
              </p>
              <p className="text-foreground/70 mt-1">
                <a href="mailto:support@elegance.com" className="hover:text-primary transition-colors">
                  support@dkhil.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">أرسل لنا رسالة</h2>
              <p className="text-foreground/80 mb-8">
                نحن نقدر ملاحظاتك واستفساراتك. يرجى ملء النموذج أدناه وسنرد عليك في أقرب وقت ممكن.
              </p>
              
              {/* Status Message */}
              {submitStatus && (
                <div className={`p-4 mb-6 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">الاسم</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-foreground/50">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                        placeholder="أدخل اسمك"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-foreground/50">
                        <AtSign className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">رقم الهاتف (اختياري)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-foreground/50">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground text-right"
                        placeholder="أدخل رقم هاتفك"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">الموضوع</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-foreground/50">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground appearance-none"
                        required
                      >
                        <option value="" disabled>اختر موضوعًا</option>
                        <option value="استفسار عام">استفسار عام</option>
                        <option value="استفسار عن منتج">استفسار عن منتج</option>
                        <option value="استفسار عن طلب">استفسار عن طلب</option>
                        <option value="اقتراح">اقتراح</option>
                        <option value="شكوى">شكوى</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">الرسالة</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                    placeholder="اكتب رسالتك هنا..."
                    required
                  ></textarea>
                  <p className="text-xs text-foreground/60 mt-1">
                    يمكنك كتابة أي استفسارات أو اقتراحات أو شكاوى هنا
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 w-5 h-5" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Map or Image */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-full h-full bg-primary/10 rounded-xl transform -rotate-3"></div>
              <div className="relative z-10 rounded-xl shadow-lg overflow-hidden aspect-[4/3]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.123456789012!2d13.12345678901234!3d32.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA3JzI0LjQiTiAxM8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sly!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">الأسئلة الشائعة</h2>
            <p className="text-foreground/80">
              إليك بعض الإجابات على الأسئلة الشائعة التي قد تكون لديك.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">ما هي طرق الدفع المتاحة؟</h3>
              <p className="text-foreground/70">
                نحن نقبل الدفع عند الاستلام لجميع الطلبات في الوقت الحالي. نعمل على إضافة طرق دفع إلكترونية قريبًا.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">كم تستغرق عملية التوصيل؟</h3>
              <p className="text-foreground/70">
                يتم توصيل الطلبات عادةً خلال 2-5 أيام عمل، اعتمادًا على موقعك. يمكنك الاطلاع على تفاصيل التوصيل لمدينتك عند إتمام الطلب.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">هل يمكنني إرجاع المنتج إذا لم يعجبني؟</h3>
              <p className="text-foreground/70">
                نعم، نحن نقدم سياسة إرجاع لمدة 14 يومًا. يجب أن يكون المنتج في حالته الأصلية وغير مستخدم. يرجى الاتصال بنا قبل إرجاع أي منتج.
              </p>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">هل تقدمون خدمة الشحن الدولي؟</h3>
              <p className="text-foreground/70">
                في الوقت الحالي، نحن نقدم خدمة التوصيل داخل ليبيا فقط. نعمل على توسيع خدماتنا لتشمل دول أخرى في المستقبل.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;