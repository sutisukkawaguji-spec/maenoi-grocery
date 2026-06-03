// ระบบจัดการการเชื่อมต่อ Supabase และ Cloudinary
const AppConfig = {
  get() {
    return {
      supabaseUrl: localStorage.getItem('MN_SUPABASE_URL') || 'https://ufeeekylxtnfxrcduobq.supabase.co/rest/v1/',
      supabaseAnonKey: localStorage.getItem('MN_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZWVla3lseHRuZnhyY2R1b2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTY2OTIsImV4cCI6MjA5NjAzMjY5Mn0.MHFU5Pd_bvgnO27YeweXtYbSJCOygfFQgfUfa2AdsxY',
      cloudinaryCloudName: localStorage.getItem('MN_CLOUDINARY_CLOUD_NAME') || 'dsi3g3dix',
      cloudinaryUploadPreset: localStorage.getItem('MN_CLOUDINARY_UPLOAD_PRESET') || 'ml_default',
      cloudinaryApiKey: localStorage.getItem('MN_CLOUDINARY_API_KEY') || '722894334646583',
      cloudinaryApiSecret: localStorage.getItem('MN_CLOUDINARY_API_SECRET') || '0V9c_hMD78FEXmPyQkdlFFMV5pY',
      adminPin: localStorage.getItem('MN_ADMIN_PIN') || '1234',
      promptpayId: localStorage.getItem('MN_PROMPTPAY_ID') || '0880699227'
    };
  },

  save(data) {
    if (data.supabaseUrl) localStorage.setItem('MN_SUPABASE_URL', data.supabaseUrl.trim());
    if (data.supabaseAnonKey) localStorage.setItem('MN_SUPABASE_ANON_KEY', data.supabaseAnonKey.trim());
    if (data.cloudinaryCloudName) localStorage.setItem('MN_CLOUDINARY_CLOUD_NAME', data.cloudinaryCloudName.trim());
    if (data.cloudinaryUploadPreset) localStorage.setItem('MN_CLOUDINARY_UPLOAD_PRESET', data.cloudinaryUploadPreset.trim());
    if (data.cloudinaryApiKey) localStorage.setItem('MN_CLOUDINARY_API_KEY', data.cloudinaryApiKey.trim());
    if (data.cloudinaryApiSecret) localStorage.setItem('MN_CLOUDINARY_API_SECRET', data.cloudinaryApiSecret.trim());
    if (data.adminPin) localStorage.setItem('MN_ADMIN_PIN', data.adminPin.trim());
    if (data.promptpayId) localStorage.setItem('MN_PROMPTPAY_ID', data.promptpayId.trim());
  },

  isConfigured() {
    const c = this.get();
    return c.supabaseUrl && c.supabaseAnonKey;
  }
};

window.AppConfig = AppConfig;
