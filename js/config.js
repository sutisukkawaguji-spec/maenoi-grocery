// ระบบจัดการการเชื่อมต่อ Supabase, Cloudinary และ Google Apps Script (GAS)
const AppConfig = {
  get() {
    return {
      supabaseUrl: localStorage.getItem('MN_SUPABASE_URL') || 'https://ufeeekylxtnfxrcduobq.supabase.co',
      supabaseAnonKey: localStorage.getItem('MN_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZWVla3lseHRuZnhyY2R1b2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTY2OTIsImV4cCI6MjA5NjAzMjY5Mn0.MHFU5Pd_bvgnO27YeweXtYbSJCOygfFQgfUfa2AdsxY',
      cloudinaryCloudName: localStorage.getItem('MN_CLOUDINARY_CLOUD_NAME') || 'dsi3g3dix',
      cloudinaryUploadPreset: localStorage.getItem('MN_CLOUDINARY_UPLOAD_PRESET') || 'ml_default',
      cloudinaryApiKey: localStorage.getItem('MN_CLOUDINARY_API_KEY') || '722894334646583',
      cloudinaryApiSecret: localStorage.getItem('MN_CLOUDINARY_API_SECRET') || '0V9c_hMD78FEXmPyQkdlFFMV5pY',
      adminPin: localStorage.getItem('MN_ADMIN_PIN') || '1234',
      promptpayId: localStorage.getItem('MN_PROMPTPAY_ID') || '0880699227',
      gasUrl: localStorage.getItem('MN_GAS_URL') || ''
    };
  },

  save(data) {
    if (data.supabaseUrl !== undefined) localStorage.setItem('MN_SUPABASE_URL', data.supabaseUrl.trim());
    if (data.supabaseAnonKey !== undefined) localStorage.setItem('MN_SUPABASE_ANON_KEY', data.supabaseAnonKey.trim());
    if (data.cloudinaryCloudName !== undefined) localStorage.setItem('MN_CLOUDINARY_CLOUD_NAME', data.cloudinaryCloudName.trim());
    if (data.cloudinaryUploadPreset !== undefined) localStorage.setItem('MN_CLOUDINARY_UPLOAD_PRESET', data.cloudinaryUploadPreset.trim());
    if (data.cloudinaryApiKey !== undefined) localStorage.setItem('MN_CLOUDINARY_API_KEY', data.cloudinaryApiKey.trim());
    if (data.cloudinaryApiSecret !== undefined) localStorage.setItem('MN_CLOUDINARY_API_SECRET', data.cloudinaryApiSecret.trim());
    if (data.adminPin !== undefined) localStorage.setItem('MN_ADMIN_PIN', data.adminPin.trim());
    if (data.promptpayId !== undefined) localStorage.setItem('MN_PROMPTPAY_ID', data.promptpayId.trim());
    if (data.gasUrl !== undefined) localStorage.setItem('MN_GAS_URL', data.gasUrl.trim());
  },

  // Load configs dynamically from deployed Google Apps Script (Web App)
  async loadFromGas() {
    const c = this.get();
    if (!c.gasUrl) return false;
    try {
      const res = await fetch(`${c.gasUrl}?action=getConfig`);
      if (!res.ok) throw new Error('GAS endpoint error');
      const data = await res.json();
      if (data && data.supabaseUrl) {
        this.save({
          supabaseUrl: data.supabaseUrl,
          supabaseAnonKey: data.supabaseAnonKey,
          cloudinaryCloudName: data.cloudinaryCloudName,
          cloudinaryUploadPreset: data.cloudinaryUploadPreset,
          cloudinaryApiKey: data.cloudinaryApiKey,
          cloudinaryApiSecret: data.cloudinaryApiSecret,
          promptpayId: data.promptpayId,
          adminPin: data.adminPin
        });
        return true;
      }
    } catch (e) {
      console.error('ระบบโหลดข้อมูลจาก GAS ขัดข้อง:', e);
    }
    return false;
  },

  isConfigured() {
    const c = this.get();
    return (c.supabaseUrl && c.supabaseAnonKey) || c.gasUrl;
  }
};

window.AppConfig = AppConfig;
