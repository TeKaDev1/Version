import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, ArrowRight, Send, Mail, Phone, MapPin } from 'lucide-react';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const Footer = () => {
  const { config } = useSiteConfig();
  const { footer } = config;
  
  return (
    <footer className="bg-secondary pt-16 pb-6 text-foreground/80">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand & About */}
          <div>
            <Link to="/" className="font-display font-bold text-2xl text-foreground">
              متجر إلكتروني
            </Link>
            <p className="mt-4 text-sm/relaxed">
              {footer.about}
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href={footer.socialLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-background/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="تابعنا على فيسبوك"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={footer.socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-background/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="تابعنا على انستغرام"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={footer.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-background/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="تابعنا على تويتر"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-lg text-foreground mb-5">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="group flex items-center text-sm hover:text-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-primary/60 group-hover:translate-x-1 transition-transform" />
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="group flex items-center text-sm hover:text-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-primary/60 group-hover:translate-x-1 transition-transform" />
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/about" className="group flex items-center text-sm hover:text-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-primary/60 group-hover:translate-x-1 transition-transform" />
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="group flex items-center text-sm hover:text-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-primary/60 group-hover:translate-x-1 transition-transform" />
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link to="/faq" className="group flex items-center text-sm hover:text-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-primary/60 group-hover:translate-x-1 transition-transform" />
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="group flex items-center text-sm hover:text-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-primary/60 group-hover:translate-x-1 transition-transform" />
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="font-medium text-lg text-foreground mb-5">اتصل بنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">
                  {footer.contactInfo.address}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary shrink-0" />
                <a href={`tel:${footer.contactInfo.phone}`} className="text-sm hover:text-primary transition-colors">
                  <span dir="ltr" style={{ unicodeBidi: 'bidi-override', direction: 'ltr' }}>{footer.contactInfo.phone}</span>
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary shrink-0" />
                <a href={`mailto:${footer.contactInfo.email}`} className="text-sm hover:text-primary transition-colors">
                  {footer.contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-medium text-lg text-foreground mb-5">النشرة الإخبارية</h3>
            <p className="text-sm mb-4">
              اشترك في نشرتنا الإخبارية لتلقي التحديثات حول المنتجات الجديدة والعروض الخاصة والترويجات.
            </p>
            <NewsletterForm variant="compact" />
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-foreground/60 mb-4 md:mb-0">
            {footer.copyrightText}
          </p>
          <div className="flex gap-4 text-xs text-foreground/60">
            <Link to="/terms" className="hover:text-primary transition-colors">
              شروط الخدمة
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              سياسة الخصوصية
            </Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">
              سياسة ملفات تعريف الارتباط
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
