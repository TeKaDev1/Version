import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, Info } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { LucideIcon } from 'lucide-react';

// Helper function to get icon component by name
const getIconByName = (iconName: string) => {
  const icons: Record<string, LucideIcon> = {
    ShoppingBag,
    Star,
    Info,
    // Add more icons as needed
  };
  
  return icons[iconName] || ShoppingBag;
};

const Hero = () => {
  const { config } = useSiteConfig();
  const { hero } = config;
  
  return (
    <section className="relative bg-gradient-to-b from-background to-secondary/5 pt-16">
      {/* Simple background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-right order-2 lg:order-1">
            <div className="space-y-6 max-w-xl mx-auto lg:mr-0 lg:ml-auto">
              <div className="inline-block bg-primary/10 px-4 py-1 rounded-full text-primary text-sm font-medium">
                أفضل المنتجات بأسعار مناسبة
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block">{hero.title}</span>
                <span className="text-primary">{hero.subtitle}</span>
              </h1>
              
              <p className="text-foreground/70 text-lg">
                {hero.description}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
                <Link
                  to="/products"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{hero.primaryButtonText}</span>
                </Link>
                
                <Link
                  to="/about"
                  className="bg-secondary/50 hover:bg-secondary/70 px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all"
                >
                  <span>{hero.secondaryButtonText}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/30 mt-8">
                {hero.features.map((feature, index) => {
                  const IconComponent = getIconByName(feature.icon);
                  return (
                    <div key={index} className="bg-background/50 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-medium">{feature.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative">
              {/* Main image */}
              <div className="relative bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={hero.backgroundImage} 
                  alt="تسوق أونلاين"
                  className="w-full h-auto object-cover mix-blend-overlay"
                  loading="eager"
                  width="600"
                  height="400"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                
                {/* Product cards */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="bg-background/80 backdrop-blur-md rounded-lg p-3 shadow-lg w-[45%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">منتجات متنوعة</div>
                        <div className="text-xs text-foreground/60">أحدث الموديلات</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/80 backdrop-blur-md rounded-lg p-3 shadow-lg w-[45%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">جودة عالية</div>
                        <div className="text-xs text-foreground/60">ضمان أصلي</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                <span className="font-bold">جديد</span>
              </div>
              
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary/30 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
