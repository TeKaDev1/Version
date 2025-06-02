import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Heart, Clock, ShieldCheck, Truck } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const About = () => {
  const { config } = useSiteConfig();
  const { about } = config;
  
  return (
    <>
      <Navbar />
      <div className="bg-background pt-16">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl opacity-70"></div>
          
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{about.title}</h1>
              <p className="text-lg text-foreground/80 mb-8">
                {about.content}
              </p>
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">قيمنا</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                نحن نؤمن بتقديم تجربة تسوق استثنائية من خلال الالتزام بمجموعة من القيم الأساسية التي توجه كل ما نقوم به.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-secondary/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">الجودة</h3>
                <p className="text-foreground/70">
                  نحن ملتزمون بتقديم منتجات عالية الجودة تلبي توقعات عملائنا وتتجاوزها.
                </p>
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">خدمة العملاء</h3>
                <p className="text-foreground/70">
                  نضع عملاءنا في قلب كل ما نقوم به، ونسعى جاهدين لتقديم تجربة استثنائية في كل تفاعل.
                </p>
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">التميز</h3>
                <p className="text-foreground/70">
                  نسعى باستمرار للتحسين والابتكار في كل جانب من جوانب أعمالنا.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">لماذا تختارنا</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                نحن نقدم مجموعة من المزايا التي تجعلنا الخيار الأمثل لتسوقك عبر الإنترنت.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">توصيل سريع</h3>
                  <p className="text-foreground/70">
                    نقدم خدمة توصيل سريعة وموثوقة لجميع مناطق ليبيا، مع إمكانية تتبع طلبك في كل مرحلة.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">منتجات أصلية</h3>
                  <p className="text-foreground/70">
                    نضمن أن جميع منتجاتنا أصلية 100% ونقدم ضمانًا على جميع المنتجات.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">دعم على مدار الساعة</h3>
                  <p className="text-foreground/70">
                    فريق خدمة العملاء لدينا متاح للإجابة على استفساراتك ومساعدتك في أي وقت.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">سهولة الاستخدام</h3>
                  <p className="text-foreground/70">
                    موقعنا مصمم ليكون سهل الاستخدام، مما يجعل تجربة التسوق سلسة وممتعة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">ابدأ التسوق الآن</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto mb-8">
                استكشف مجموعتنا الواسعة من المنتجات عالية الجودة واستمتع بتجربة تسوق لا مثيل لها.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>تصفح المنتجات</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
