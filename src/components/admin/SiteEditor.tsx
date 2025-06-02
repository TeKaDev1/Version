import React, { useState } from 'react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Eye, EyeOff, History, Save, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterConfig {
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
}

interface AboutConfig {
  title: string;
  subtitle: string;
  content: string;
  image: string;
}

interface SiteConfig {
  hero: {
    title: string;
    subtitle: string;
    features: Array<{ icon: string; text: string }>;
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
  about: AboutConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface Version {
  id: string;
  label: string;
  timestamp: string;
  config: SiteConfig;
}

const SiteEditor: React.FC = () => {
  const {
    config,
    versions,
    isLoading,
    isSaving,
    previewMode,
    updateConfig,
    saveVersion,
    restoreVersion,
    togglePreviewMode,
    updatePreviewConfig,
    publishPreview,
    discardPreview
  } = useSiteConfig();

  const [activeTab, setActiveTab] = useState('hero');
  const [versionLabel, setVersionLabel] = useState('');
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleSaveVersion = async () => {
    try {
      if (!config) {
        toast.error('لا يوجد تكوين لحفظه');
        return;
      }

      if (!versionLabel.trim()) {
        toast.error('الرجاء إدخال وصف للنسخة');
        return;
      }

      // التحقق من صحة البريد الإلكتروني
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(config.footer.contactInfo.email)) {
        toast.error('البريد الإلكتروني غير صالح');
        return;
      }

      // التحقق من صحة رقم الهاتف
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(config.footer.contactInfo.phone)) {
        toast.error('رقم الهاتف غير صالح');
        return;
      }

      // التحقق من صحة روابط التواصل الاجتماعي
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      const socialLinks = config.footer.socialLinks;
      if (!urlRegex.test(socialLinks.facebook)) {
        toast.error('رابط فيسبوك غير صالح');
        return;
      }
      if (!urlRegex.test(socialLinks.instagram)) {
        toast.error('رابط انستغرام غير صالح');
        return;
      }
      if (!urlRegex.test(socialLinks.twitter)) {
        toast.error('رابط تويتر غير صالح');
        return;
      }

      // التحقق من صحة رابط صورة صفحة من نحن
      if (config.about.image && !urlRegex.test(config.about.image)) {
        toast.error('رابط صورة صفحة من نحن غير صالح');
        return;
      }

      const version: Version = {
        id: Date.now().toString(),
        label: versionLabel,
        timestamp: new Date().toISOString(),
        config
      };

      await saveVersion(version.label);
      setVersionLabel('');
      setShowVersionDialog(false);
      toast.success('تم حفظ الإصدار بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الإصدار:', error);
      toast.error('حدث خطأ أثناء حفظ الإصدار');
    }
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    const colors = { ...config.colors, [colorType]: value };
    if (previewMode) {
      updatePreviewConfig({ colors });
    } else {
      updateConfig({ colors });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">محرر الموقع</h2>
          <p className="text-muted-foreground">تخصيص مظهر ومحتوى الموقع</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {previewMode ? (
            <>
              <Button variant="outline" size="sm" onClick={discardPreview}>
                <Trash className="w-4 h-4 mr-2" />
                تجاهل التغييرات
              </Button>
              <Button size="sm" onClick={publishPreview} disabled={isSaving}>
                {isSaving ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                نشر التغييرات
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(true)}
              >
                <History className="w-4 h-4 mr-2" />
                سجل النسخ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionDialog(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                حفظ نسخة
              </Button>
            </>
          )}
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={togglePreviewMode}
          >
            {previewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                إيقاف المعاينة
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                معاينة التغييرات
              </>
            )}
          </Button>
        </div>
      </div>

      {previewMode && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>وضع المعاينة</AlertTitle>
          <AlertDescription>
            أنت في وضع المعاينة. التغييرات التي تقوم بها لن يتم حفظها حتى تقوم بالنشر.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">القسم الرئيسي</TabsTrigger>
          <TabsTrigger value="footer">تذييل الصفحة</TabsTrigger>
          <TabsTrigger value="about">من نحن</TabsTrigger>
          <TabsTrigger value="colors">الألوان</TabsTrigger>
        </TabsList>

        {/* Hero Editor */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>القسم الرئيسي</CardTitle>
              <CardDescription>تعديل محتوى القسم الرئيسي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">العنوان الرئيسي</Label>
                <Input
                  id="hero-title"
                  value={config.hero.title}
                  onChange={(e) => {
                    const newHero = { ...config.hero, title: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ hero: newHero });
                    } else {
                      updateConfig({ hero: newHero });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">العنوان الفرعي</Label>
                <Input
                  id="hero-subtitle"
                  value={config.hero.subtitle}
                  onChange={(e) => {
                    const newHero = { ...config.hero, subtitle: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ hero: newHero });
                    } else {
                      updateConfig({ hero: newHero });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>الميزات</Label>
                {config.hero.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={feature.icon}
                      onChange={(e) => {
                        const newFeatures = [...config.hero.features];
                        newFeatures[index] = { ...feature, icon: e.target.value };
                        const newHero = { ...config.hero, features: newFeatures };
                        if (previewMode) {
                          updatePreviewConfig({ hero: newHero });
                        } else {
                          updateConfig({ hero: newHero });
                        }
                      }}
                      placeholder="أيقونة"
                      className="w-1/3"
                    />
                    <Input
                      value={feature.text}
                      onChange={(e) => {
                        const newFeatures = [...config.hero.features];
                        newFeatures[index] = { ...feature, text: e.target.value };
                        const newHero = { ...config.hero, features: newFeatures };
                        if (previewMode) {
                          updatePreviewConfig({ hero: newHero });
                        } else {
                          updateConfig({ hero: newHero });
                        }
                      }}
                      placeholder="نص"
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Editor */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تذييل الصفحة</CardTitle>
              <CardDescription>تعديل محتوى تذييل الصفحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer-about">نبذة عن المتجر</Label>
                <Textarea
                  id="footer-about"
                  value={config.footer.about}
                  onChange={(e) => {
                    const newFooter = { ...config.footer, about: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ footer: newFooter });
                    } else {
                      updateConfig({ footer: newFooter });
                    }
                  }}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>معلومات الاتصال</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-address">العنوان</Label>
                    <Input
                      id="contact-address"
                      value={config.footer.contactInfo.address}
                      onChange={(e) => {
                        const newContactInfo = { ...config.footer.contactInfo, address: e.target.value };
                        const newFooter = { ...config.footer, contactInfo: newContactInfo };
                        if (previewMode) {
                          updatePreviewConfig({ footer: newFooter });
                        } else {
                          updateConfig({ footer: newFooter });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">البريد الإلكتروني</Label>
                    <Input
                      id="contact-email"
                      value={config.footer.contactInfo.email}
                      onChange={(e) => {
                        const newContactInfo = { ...config.footer.contactInfo, email: e.target.value };
                        const newFooter = { ...config.footer, contactInfo: newContactInfo };
                        if (previewMode) {
                          updatePreviewConfig({ footer: newFooter });
                        } else {
                          updateConfig({ footer: newFooter });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">رقم الهاتف</Label>
                    <Input
                      id="contact-phone"
                      value={config.footer.contactInfo.phone}
                      onChange={(e) => {
                        const newContactInfo = { ...config.footer.contactInfo, phone: e.target.value };
                        const newFooter = { ...config.footer, contactInfo: newContactInfo };
                        if (previewMode) {
                          updatePreviewConfig({ footer: newFooter });
                        } else {
                          updateConfig({ footer: newFooter });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>روابط التواصل الاجتماعي</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social-facebook">فيسبوك</Label>
                    <Input
                      id="social-facebook"
                      value={config.footer.socialLinks.facebook}
                      onChange={(e) => {
                        const newSocialLinks = { ...config.footer.socialLinks, facebook: e.target.value };
                        const newFooter = { ...config.footer, socialLinks: newSocialLinks };
                        if (previewMode) {
                          updatePreviewConfig({ footer: newFooter });
                        } else {
                          updateConfig({ footer: newFooter });
                        }
                      }}
                      placeholder="رابط فيسبوك"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social-instagram">انستغرام</Label>
                    <Input
                      id="social-instagram"
                      value={config.footer.socialLinks.instagram}
                      onChange={(e) => {
                        const newSocialLinks = { ...config.footer.socialLinks, instagram: e.target.value };
                        const newFooter = { ...config.footer, socialLinks: newSocialLinks };
                        if (previewMode) {
                          updatePreviewConfig({ footer: newFooter });
                        } else {
                          updateConfig({ footer: newFooter });
                        }
                      }}
                      placeholder="رابط انستغرام"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social-twitter">تويتر</Label>
                    <Input
                      id="social-twitter"
                      value={config.footer.socialLinks.twitter}
                      onChange={(e) => {
                        const newSocialLinks = { ...config.footer.socialLinks, twitter: e.target.value };
                        const newFooter = { ...config.footer, socialLinks: newSocialLinks };
                        if (previewMode) {
                          updatePreviewConfig({ footer: newFooter });
                        } else {
                          updateConfig({ footer: newFooter });
                        }
                      }}
                      placeholder="رابط تويتر"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Page Editor */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>صفحة من نحن</CardTitle>
              <CardDescription>تعديل محتوى صفحة من نحن</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about-title">العنوان الرئيسي</Label>
                <Input
                  id="about-title"
                  value={config.about.title}
                  onChange={(e) => {
                    const newAbout = { ...config.about, title: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ about: newAbout });
                    } else {
                      updateConfig({ about: newAbout });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-subtitle">العنوان الفرعي</Label>
                <Input
                  id="about-subtitle"
                  value={config.about.subtitle}
                  onChange={(e) => {
                    const newAbout = { ...config.about, subtitle: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ about: newAbout });
                    } else {
                      updateConfig({ about: newAbout });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-content">المحتوى</Label>
                <Textarea
                  id="about-content"
                  value={config.about.content}
                  onChange={(e) => {
                    const newAbout = { ...config.about, content: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ about: newAbout });
                    } else {
                      updateConfig({ about: newAbout });
                    }
                  }}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-image">رابط الصورة</Label>
                <Input
                  id="about-image"
                  value={config.about.image}
                  onChange={(e) => {
                    const newAbout = { ...config.about, image: e.target.value };
                    if (previewMode) {
                      updatePreviewConfig({ about: newAbout });
                    } else {
                      updateConfig({ about: newAbout });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Editor */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ألوان الموقع</CardTitle>
              <CardDescription>تعديل ألوان الموقع الرئيسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">اللون الرئيسي</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={config.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={config.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">لون التمييز</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={config.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>سجل النسخ</DialogTitle>
            <DialogDescription>
              استعادة نسخة سابقة من تكوين الموقع
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {versions.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">لا توجد نسخ محفوظة</p>
            ) : (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{version.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(version.timestamp), 'PPpp', { locale: ar })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        restoreVersion(version.id);
                        setShowVersionHistory(false);
                      }}
                    >
                      استعادة
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Version Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>حفظ نسخة جديدة</DialogTitle>
            <DialogDescription>
              أدخل وصفًا للنسخة الجديدة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-label">وصف النسخة</Label>
              <Input
                id="version-label"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder="مثال: تحديث ألوان الموقع"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)}>إلغاء</Button>
            <Button onClick={handleSaveVersion} disabled={!versionLabel.trim()}>حفظ النسخة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteEditor;