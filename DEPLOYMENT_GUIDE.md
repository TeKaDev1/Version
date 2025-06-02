# دليل نشر المشروع

هذا الدليل يشرح كيفية نشر مشروع متجر إلكتروني على GitHub وVercel.

## الخطوة 1: رفع المشروع إلى GitHub

### إنشاء مستودع GitHub جديد

1. قم بتسجيل الدخول إلى حسابك على [GitHub](https://github.com/)
2. انقر على زر "+" في الزاوية العلوية اليمنى واختر "New repository"
3. أدخل اسمًا للمستودع (مثل "vibrant-shop-experience")
4. اختر ما إذا كنت تريد أن يكون المستودع عامًا أو خاصًا
5. لا تقم بتحديد أي من خيارات التهيئة (مثل README أو .gitignore)
6. انقر على "Create repository"

### تهيئة Git المحلي ورفع المشروع

افتح موجه الأوامر (Command Prompt) في مجلد المشروع الخاص بك واكتب الأوامر التالية:

```bash
# تهيئة مستودع Git محلي إذا لم يكن موجودًا بالفعل
git init

# إضافة جميع الملفات إلى منطقة التحضير
git add .

# إنشاء commit أولي
git commit -m "Initial commit"

# إضافة الرابط إلى مستودع GitHub البعيد (استبدل USERNAME بإسم المستخدم الخاص بك واسم المستودع)
git remote add origin https://github.com/USERNAME/vibrant-shop-experience.git

# رفع المشروع إلى GitHub
git push -u origin main
```

إذا كان الفرع الرئيسي هو "master" بدلاً من "main"، استخدم:

```bash
git push -u origin master
```

## الخطوة 2: نشر المشروع على Vercel

### إنشاء حساب Vercel

1. قم بزيارة [Vercel](https://vercel.com/) وانقر على "Sign Up"
2. يمكنك التسجيل باستخدام حساب GitHub الخاص بك للتكامل السلس

### استيراد المشروع من GitHub

1. بعد تسجيل الدخول إلى Vercel، انقر على "Add New..." ثم "Project"
2. اختر مستودع GitHub الذي قمت بإنشائه للمشروع
3. إذا لم تر المستودع، قد تحتاج إلى تكوين تكامل GitHub في Vercel:
   - انقر على "Adjust GitHub App Permissions"
   - اختر الحساب الذي يحتوي على المستودع
   - حدد المستودعات التي تريد السماح لـ Vercel بالوصول إليها

### تكوين المشروع

1. بعد اختيار المستودع، ستظهر صفحة تكوين المشروع
2. Vercel سيكتشف تلقائيًا أن المشروع هو تطبيق React/Vite
3. تأكد من أن الإعدادات التالية صحيحة:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (يجب أن يكون هذا هو الافتراضي)
   - **Output Directory**: `dist` (يجب أن يكون هذا هو الافتراضي)
   - **Install Command**: `npm install` (يجب أن يكون هذا هو الافتراضي)

### إضافة متغيرات البيئة

إذا كان مشروعك يستخدم متغيرات بيئة (مثل مفاتيح API لـ Firebase)، يجب إضافتها في Vercel:

1. في صفحة تكوين المشروع، قم بالتمرير لأسفل إلى قسم "Environment Variables"
2. أضف جميع متغيرات البيئة المطلوبة (مثل `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, إلخ)
3. تأكد من إضافة جميع متغيرات Firebase المستخدمة في ملف `.env` الخاص بك

### نشر المشروع

1. انقر على زر "Deploy" في أسفل الصفحة
2. انتظر حتى يكتمل البناء والنشر
3. بمجرد الانتهاء، ستحصل على رابط لموقعك المنشور (مثل `https://vibrant-shop-experience.vercel.app`)

## الخطوة 3: تكوين Firebase للإنتاج

### تحديث قواعد الأمان في Firebase

1. انتقل إلى [وحدة تحكم Firebase](https://console.firebase.google.com/)
2. اختر مشروعك
3. انتقل إلى "Authentication" وتأكد من إضافة نطاق Vercel الخاص بك (مثل `vibrant-shop-experience.vercel.app`) إلى "Authorized domains"
4. انتقل إلى "Storage" و "Database" وتأكد من أن قواعد الأمان تسمح بالوصول المناسب للمستخدمين المصرح لهم

### تحديث CORS لـ Storage

إذا كنت تستخدم Firebase Storage، تأكد من تكوين CORS للسماح بالوصول من نطاق Vercel الخاص بك:

1. قم بتثبيت أدوات Firebase CLI إذا لم تكن مثبتة بالفعل:
   ```bash
   npm install -g firebase-tools
   ```

2. قم بتسجيل الدخول إلى Firebase:
   ```bash
   firebase login
   ```

3. قم بإنشاء ملف `cors.json` في مجلد المشروع الخاص بك:
   ```json
   [
     {
       "origin": ["https://vibrant-shop-experience.vercel.app"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

4. قم بتطبيق تكوين CORS:
   ```bash
   firebase storage:cors update cors.json
   ```

## الخطوة 4: تحديث المشروع

عندما تقوم بإجراء تغييرات على المشروع وتريد تحديث الموقع المنشور:

1. قم بإجراء التغييرات المطلوبة على الكود
2. أضف التغييرات وقم بعمل commit ودفعها إلى GitHub:
   ```bash
   git add .
   git commit -m "وصف التغييرات"
   git push
   ```

3. Vercel سيكتشف تلقائيًا التغييرات ويقوم بإعادة نشر موقعك

## الخطوة 5: تكوين اسم نطاق مخصص (اختياري)

إذا كنت ترغب في استخدام اسم نطاق مخصص بدلاً من نطاق Vercel الافتراضي:

1. في لوحة تحكم Vercel، انتقل إلى مشروعك
2. انقر على "Settings" ثم "Domains"
3. أدخل اسم النطاق الذي تملكه واتبع التعليمات لتكوين سجلات DNS

## ملاحظات هامة

- تأكد من عدم تضمين المعلومات الحساسة (مثل مفاتيح API) مباشرة في الكود. استخدم متغيرات البيئة بدلاً من ذلك.
- تأكد من أن جميع الروابط في تطبيقك تستخدم مسارات نسبية وليست مطلقة.
- إذا واجهت أي مشاكل أثناء النشر، راجع سجلات البناء في Vercel للحصول على معلومات حول الأخطاء.