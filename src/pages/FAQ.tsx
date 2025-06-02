import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-display font-semibold mb-8 text-center">الأسئلة الشائعة</h1>
          
          <div className="bg-card rounded-lg shadow-sm p-6 mb-12">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">كيف يمكنني تتبع طلبي؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  بعد تقديم طلبك، ستتلقى رسالة تأكيد بالبريد الإلكتروني تحتوي على رقم التتبع ورابط. يمكنك استخدام هذا الرابط لتتبع حالة طلبك في أي وقت. يمكنك أيضًا تسجيل الدخول إلى حسابك على موقعنا وعرض تفاصيل الطلب في قسم "طلباتي".
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">ما هي سياسة الإرجاع الخاصة بكم؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  نحن نقدم سياسة إرجاع لمدة 30 يومًا لمعظم المنتجات. إذا لم تكن راضيًا عن مشترياتك لأي سبب، يمكنك إعادتها في غضون 30 يومًا من تاريخ التسليم للحصول على استرداد كامل أو استبدال. يجب أن تكون المنتجات في حالتها الأصلية، غير مستخدمة وبعبواتها الأصلية. بعض المنتجات قد تخضع لشروط إرجاع خاصة، والتي سيتم تحديدها في وصف المنتج.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">كم تستغرق عملية التوصيل؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  تختلف أوقات التوصيل حسب موقعك وطريقة الشحن المختارة. بشكل عام، تستغرق عمليات التوصيل المحلية 2-5 أيام عمل، بينما قد تستغرق الشحنات الدولية 7-14 يوم عمل. ستتلقى تقديرًا أكثر دقة لوقت التوصيل أثناء عملية الدفع بناءً على عنوانك وتوافر المنتج.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">هل تقدمون شحن دولي؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  نعم، نحن نشحن إلى معظم البلدان حول العالم. تختلف رسوم الشحن والتوصيل حسب الوجهة والوزن وقيمة الطلب. يمكنك رؤية خيارات الشحن المتاحة وتكاليفها أثناء عملية الدفع. يرجى ملاحظة أن الطلبات الدولية قد تخضع لرسوم جمركية ورسوم استيراد إضافية، والتي تكون مسؤولية العميل.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">كيف يمكنني الاتصال بخدمة العملاء؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  يمكنك الاتصال بفريق خدمة العملاء لدينا من خلال عدة طرق:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>البريد الإلكتروني: support@elegance.com</li>
                    <li>الهاتف: +218 123 456 789 (متاح من الأحد إلى الخميس، 9 صباحًا - 5 مساءً)</li>
                    <li>نموذج الاتصال على موقعنا في صفحة "اتصل بنا"</li>
                    <li>الدردشة المباشرة على موقعنا (متاحة خلال ساعات العمل)</li>
                  </ul>
                  نحن نسعى للرد على جميع الاستفسارات في غضون 24 ساعة عمل.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">هل منتجاتكم تأتي مع ضمان؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  نعم، معظم منتجاتنا تأتي مع ضمان المصنّع القياسي. تختلف فترة الضمان ونطاقه حسب المنتج والشركة المصنعة. يمكنك العثور على معلومات الضمان المحددة في وصف المنتج أو في وثائق المنتج المرفقة. إذا واجهت أي مشكلات مع منتج خلال فترة الضمان، يرجى الاتصال بخدمة العملاء للحصول على المساعدة في عملية المطالبة بالضمان.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">هل يمكنني تغيير أو إلغاء طلبي بعد تقديمه؟</AccordionTrigger>
                <AccordionContent className="text-foreground/80 pt-2">
                  يمكنك تغيير أو إلغاء طلبك فقط إذا لم تتم معالجته بعد. للقيام بذلك، يرجى الاتصال بخدمة العملاء في أقرب وقت ممكن مع رقم طلبك. بمجرد بدء معالجة الطلب أو شحنه، لا يمكننا إلغاؤه، ولكن يمكنك إرجاع المنتجات بعد استلامها وفقًا لسياسة الإرجاع لدينا.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-xl font-medium mb-4">هل لديك سؤال آخر؟</h2>
            <p className="text-foreground/80 mb-6">لم تجد إجابة لسؤالك؟ لا تتردد في التواصل معنا مباشرة.</p>
            <a 
              href="/contact" 
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              اتصل بنا
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;