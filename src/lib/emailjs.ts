import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('B6EzNeSIjQOTyWOLO');

interface OrderEmailData {
  shop_name: string;
  shop_url: string;
  support_email: string;
  current_year: string;
  order_id: string;
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  items_html: string;
  subtotal_amount: string;
  delivery_fee: string;
  order_total: string;
  currency: string;
  dashboard_link: string;
  notes?: string;
}

interface NewsletterSubscriptionData {
  email: string;
  name?: string;
}

/**
 * Send order confirmation email to the store owner
 */
export const sendOrderConfirmationEmail = async (orderData: OrderEmailData): Promise<void> => {
  try {
    console.log('Preparing to send order confirmation email with data:', orderData);
    
    const currentDate = new Date();
    
    const templateParams = {
      to_email: 'itzhapy@gmail.com',
      subject: `طلب جديد #${orderData.order_id}`,
      customer_name: orderData.customer_name,
      customer_phone: orderData.phone_number,
      customer_address: orderData.delivery_address,
      order_id: orderData.order_id,
      order_date: currentDate.toLocaleDateString('ar-LY'),
      order_time: currentDate.toLocaleTimeString('ar-LY'),
      order_items: orderData.items_html,
      subtotal: `${orderData.subtotal_amount} ${orderData.currency}`,
      delivery_fee: `${orderData.delivery_fee} ${orderData.currency}`,
      total_amount: `${orderData.order_total} ${orderData.currency}`,
      order_status: 'طلب جديد',
      current_year: currentDate.getFullYear().toString(),
      shop_name: orderData.shop_name,
      notes: orderData.notes || 'لا توجد ملاحظات'
    };
    
    console.log('Sending admin notification email with order details:', templateParams);
    console.log('Using service ID: itzhapy@gmail.com');
    console.log('Using template ID: template_f5rh7n9');
    
    // Send email to admin
    const response = await emailjs.send(
      'itzhapy@gmail.com',
      'template_f5rh7n9',
      templateParams,
      'B6EzNeSIjQOTyWOLO'
    );
    
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send newsletter subscription confirmation
 */
export const sendNewsletterSubscription = async (data: NewsletterSubscriptionData): Promise<void> => {
  try {
    const templateParams = {
      subscriber_email: data.email,
      subscriber_name: data.name || 'مشترك جديد',
      subscription_date: new Date().toLocaleDateString('ar-LY'),
      subscription_time: new Date().toLocaleTimeString('ar-LY'),
      to_email: 'itzhapy@gmail.com',
      email_subject: 'اشتراك جديد في النشرة الإخبارية',
      email_preview: `اشتراك جديد من ${data.email}`,
      welcome_message: `مرحباً ${data.name || 'عزيزي المشترك'}،\n\nنشكرك على اشتراكك في نشرتنا الإخبارية! ستصلك آخر التحديثات والعروض الخاصة مباشرة إلى بريدك الإلكتروني.\n\nمع تحيات،\nفريق دخيل`
    };
    
    await emailjs.send(
      'itzhapy@gmail.com',
      'template_newsletter',
      templateParams,
      'B6EzNeSIjQOTyWOLO'
    );
    
    console.log('Newsletter subscription email sent successfully');
  } catch (error) {
    console.error('Error sending newsletter subscription email:', error);
    throw error;
  }
};

/**
 * Send contact form submission
 */
export const sendContactFormEmail = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}): Promise<void> => {
  try {
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      from_phone: data.phone || 'غير متوفر',
      subject: data.subject,
      message: data.message,
      submission_date: new Date().toLocaleDateString('ar-LY'),
      submission_time: new Date().toLocaleTimeString('ar-LY'),
      email_subject: `رسالة جديدة: ${data.subject}`,
      email_preview: `رسالة جديدة من ${data.name} بخصوص ${data.subject}`,
      response_message: `مرحباً ${data.name}،\n\nشكراً لتواصلك معنا. لقد استلمنا رسالتك وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.\n\nتفاصيل رسالتك:\nالموضوع: ${data.subject}\nالرسالة: ${data.message}\n\nمع تحيات،\nفريق دخيل`,
      to_email: 'itzhapy@gmail.com'
    };
    
    await emailjs.send(
      'itzhapy@gmail.com',
      'template_contact',
      templateParams,
      'B6EzNeSIjQOTyWOLO'
    );
    
    console.log('Contact form email sent successfully');
  } catch (error) {
    console.error('Error sending contact form email:', error);
    throw error;
  }
};
