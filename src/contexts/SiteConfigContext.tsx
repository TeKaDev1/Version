import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase';
import { toast } from 'sonner';

// Define the site configuration structure
interface SiteConfig {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    features: Array<{
      icon: string;
      text: string;
    }>;
  };
  footer: {
    about: string;
    contactInfo: {
      address: string;
      phone: string;
      email: string;
    };
    socialLinks: {
      facebook: string;
      instagram: string;
      twitter: string;
    };
    copyrightText: string;
  };
  about: {
    title: string;
    subtitle: string;
    content: string;
    image: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Version history interface
interface ConfigVersion {
  id: string;
  timestamp: number;
  config: SiteConfig;
  label: string;
}

interface SiteConfigContextType {
  config: SiteConfig;
  versions: ConfigVersion[];
  isLoading: boolean;
  isSaving: boolean;
  previewMode: boolean;
  previewConfig: SiteConfig | null;
  updateConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  saveVersion: (label: string) => Promise<void>;
  restoreVersion: (versionId: string) => Promise<void>;
  togglePreviewMode: () => void;
  updatePreviewConfig: (newConfig: Partial<SiteConfig>) => void;
  publishPreview: () => Promise<void>;
  discardPreview: () => void;
}

// Default configuration
const defaultConfig: SiteConfig = {
  hero: {
    title: 'تسوق بكل سهولة',
    subtitle: 'من أي مكان',
    description: 'اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار مناسبة',
    backgroundImage: '/images/hero-bg.jpg',
    primaryButtonText: 'تسوق الآن',
    secondaryButtonText: 'تعرف علينا',
    features: [
      { icon: 'ShoppingBag', text: 'توصيل سريع' },
      { icon: 'Star', text: 'جودة ممتازة' },
      { icon: 'Info', text: 'دعم على مدار الساعة' }
    ]
  },
  footer: {
    about: 'نقدم منتجات استثنائية تجمع بين الأناقة والوظائف العملية والتصميم الخالد. اكتشف تجربة تسوق تحتفي بالبساطة والجودة.',
    contactInfo: {
      address: 'حي الانتصار,طرابلس، ليبيا',
      phone: '+218 092 207 8595',
      email: 'itzhapy@gmail.com'
    },
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com'
    },
    copyrightText: `© ${new Date().getFullYear()} إيليجانس. جميع الحقوق محفوظة.`
  },
  about: {
    title: 'من نحن',
    subtitle: 'قصتنا',
    content: 'نحن متجر إلكتروني متخصص في توفير منتجات عالية الجودة بأسعار مناسبة.',
    image: '/placeholder.svg'
  },
  colors: {
    primary: '#10b981',
    secondary: '#e6f7f2',
    accent: '#f43f5e'
  }
};

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<SiteConfig | null>(null);

  // Load configuration from Firebase
  useEffect(() => {
    const db = getDatabase(firebaseApp);
    const configRef = ref(db, 'siteConfig');
    
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.val());
      } else {
        // Initialize with default config if none exists
        set(configRef, defaultConfig);
        setConfig(defaultConfig);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading site configuration:', error);
      toast.error('حدث خطأ أثناء تحميل إعدادات الموقع');
      setIsLoading(false);
    });

    // Load version history
    const versionsRef = ref(db, 'siteConfigVersions');
    const unsubscribeVersions = onValue(versionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const versionsData = snapshot.val();
        const versionsList = Object.keys(versionsData).map(key => ({
          id: key,
          ...versionsData[key]
        }));
        // Sort by timestamp, newest first
        versionsList.sort((a, b) => b.timestamp - a.timestamp);
        setVersions(versionsList);
      } else {
        setVersions([]);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeVersions();
    };
  }, []);

  // Update configuration
  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    try {
      setIsSaving(true);
      const db = getDatabase(firebaseApp);
      const configRef = ref(db, 'siteConfig');
      
      const updatedConfig = { ...config, ...newConfig };
      await set(configRef, updatedConfig);
      
      // Update CSS variables for colors
      if (newConfig.colors) {
        updateCssVariables(newConfig.colors);
      }
      
      toast.success('تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error updating site configuration:', error);
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  // Save current configuration as a version
  const saveVersion = async (label: string) => {
    try {
      setIsSaving(true);
      const db = getDatabase(firebaseApp);
      const versionsRef = ref(db, 'siteConfigVersions');
      
      const newVersion = {
        timestamp: Date.now(),
        config: { ...config },
        label
      };
      
      await push(versionsRef, newVersion);
      toast.success('تم حفظ النسخة بنجاح');
    } catch (error) {
      console.error('Error saving version:', error);
      toast.error('حدث خطأ أثناء حفظ النسخة');
    } finally {
      setIsSaving(false);
    }
  };

  // Restore a previous version
  const restoreVersion = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) {
      toast.error('النسخة غير موجودة');
      return;
    }
    
    try {
      setIsSaving(true);
      const db = getDatabase(firebaseApp);
      const configRef = ref(db, 'siteConfig');
      
      await set(configRef, version.config);
      
      // Update CSS variables for colors
      if (version.config.colors) {
        updateCssVariables(version.config.colors);
      }
      
      toast.success('تم استعادة النسخة بنجاح');
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('حدث خطأ أثناء استعادة النسخة');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    if (!previewMode) {
      // Entering preview mode - create a copy of current config
      setPreviewConfig({ ...config });
    } else {
      // Exiting preview mode
      setPreviewConfig(null);
    }
    setPreviewMode(!previewMode);
  };

  // Update preview configuration
  const updatePreviewConfig = (newConfig: Partial<SiteConfig>) => {
    if (previewConfig) {
      setPreviewConfig({ ...previewConfig, ...newConfig });
      
      // Update CSS variables for preview
      if (newConfig.colors) {
        updateCssVariables(newConfig.colors, true);
      }
    }
  };

  // Publish preview changes
  const publishPreview = async () => {
    if (!previewConfig) return;
    
    try {
      setIsSaving(true);
      const db = getDatabase(firebaseApp);
      const configRef = ref(db, 'siteConfig');
      
      await set(configRef, previewConfig);
      setConfig(previewConfig);
      
      // Update CSS variables
      if (previewConfig.colors) {
        updateCssVariables(previewConfig.colors);
      }
      
      setPreviewMode(false);
      setPreviewConfig(null);
      toast.success('تم نشر التغييرات بنجاح');
    } catch (error) {
      console.error('Error publishing changes:', error);
      toast.error('حدث خطأ أثناء نشر التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard preview changes
  const discardPreview = () => {
    setPreviewMode(false);
    setPreviewConfig(null);
    
    // Restore original CSS variables
    if (config.colors) {
      updateCssVariables(config.colors);
    }
    
    toast.info('تم تجاهل التغييرات');
  };

  // Helper function to update CSS variables
  const updateCssVariables = (colors: Partial<SiteConfig['colors']>, isPreview = false) => {
    const root = document.documentElement;
    
    if (colors.primary) {
      const primaryRgb = hexToRgb(colors.primary);
      if (primaryRgb) {
        root.style.setProperty('--primary', primaryRgb);
      }
    }
    
    if (colors.secondary) {
      const secondaryRgb = hexToRgb(colors.secondary);
      if (secondaryRgb) {
        root.style.setProperty('--secondary', secondaryRgb);
      }
    }
    
    if (colors.accent) {
      const accentRgb = hexToRgb(colors.accent);
      if (accentRgb) {
        root.style.setProperty('--accent', accentRgb);
      }
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : null;
  };

  return (
    <SiteConfigContext.Provider
      value={{
        config: previewMode && previewConfig ? previewConfig : config,
        versions,
        isLoading,
        isSaving,
        previewMode,
        previewConfig,
        updateConfig,
        saveVersion,
        restoreVersion,
        togglePreviewMode,
        updatePreviewConfig,
        publishPreview,
        discardPreview
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};