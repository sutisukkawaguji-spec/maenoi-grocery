// ระบบจัดการการเชื่อมต่อ Supabase, Cloudinary และ Google Apps Script (GAS)
const AppConfig = {
  _adminPin: '',

  get() {
    let rawUrl = localStorage.getItem('MN_SUPABASE_URL') || 'https://ufeeekylxtnfxrcduobq.supabase.co/rest/v1/';
    
    // ทำความสะอาด URL (ตัด /rest/v1/ หรือเครื่องหมาย / ปิดท้ายออก เพื่อไม่ให้ Supabase Client พัง)
    let url = rawUrl.trim();
    if (url.endsWith('/rest/v1/')) url = url.slice(0, -9);
    else if (url.endsWith('/rest/v1')) url = url.slice(0, -8);
    if (url.endsWith('/')) url = url.slice(0, -1);

    return {
      supabaseUrl: url,
      supabaseAnonKey: localStorage.getItem('MN_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZWVla3lseHRuZnhyY2R1b2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTY2OTIsImV4cCI6MjA5NjAzMjY5Mn0.MHFU5Pd_bvgnO27YeweXtYbSJCOygfFQgfUfa2AdsxY',
      cloudinaryCloudName: localStorage.getItem('MN_CLOUDINARY_CLOUD_NAME') || 'dsi3g3dix',
      cloudinaryUploadPreset: localStorage.getItem('MN_CLOUDINARY_UPLOAD_PRESET') || 'ml_default',
      promptpayId: localStorage.getItem('MN_PROMPTPAY_ID') || '0880699227',
      gasUrl: localStorage.getItem('MN_GAS_URL') || 'https://script.google.com/macros/s/AKfycbwHtZKyauII92QdsT4uuKkVuoHsFlFwoawM9LSAcXbGiA7UcvgTqQczjJvEnRTAx7B6/exec'
    };
  },

  save(data) {
    if (data.supabaseUrl !== undefined) localStorage.setItem('MN_SUPABASE_URL', data.supabaseUrl.trim());
    if (data.supabaseAnonKey !== undefined) localStorage.setItem('MN_SUPABASE_ANON_KEY', data.supabaseAnonKey.trim());
    if (data.cloudinaryCloudName !== undefined) localStorage.setItem('MN_CLOUDINARY_CLOUD_NAME', data.cloudinaryCloudName.trim());
    if (data.cloudinaryUploadPreset !== undefined) localStorage.setItem('MN_CLOUDINARY_UPLOAD_PRESET', data.cloudinaryUploadPreset.trim());
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
        this._adminPin = typeof data.adminPin === 'string' ? data.adminPin.trim() : '';
        this.save({
          supabaseUrl: data.supabaseUrl,
          supabaseAnonKey: data.supabaseAnonKey,
          cloudinaryCloudName: data.cloudinaryCloudName,
          cloudinaryUploadPreset: data.cloudinaryUploadPreset,
          promptpayId: data.promptpayId
        });
        return true;
      }
    } catch (e) {
      console.error('ระบบโหลดข้อมูลจาก GAS ขัดข้อง:', e);
    }
    return false;
  },

  async verifyAdminPin(pin) {
    const c = this.get();
    if (!c.gasUrl || !pin) return false;

    // Use the value already returned by getConfig first.
    if (this._adminPin) return pin === this._adminPin;

    try {
      const configRes = await fetch(`${c.gasUrl}?action=getConfig&_=${Date.now()}`, {
        cache: 'no-store'
      });
      if (configRes.ok) {
        const configData = await configRes.json();
        if (typeof configData.adminPin === 'string' && configData.adminPin.trim()) {
          this._adminPin = configData.adminPin.trim();
          return pin === this._adminPin;
        }
      }
    } catch (e) {
      console.warn('โหลด PIN จาก GAS ไม่สำเร็จ กำลังลองช่องทางสำรอง:', e);
    }

    try {
      const body = new URLSearchParams({ action: 'verifyAdminPin', pin });
      const res = await fetch(c.gasUrl, { method: 'POST', body });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (typeof data.valid === 'boolean') return data.valid;
        }
      }
    } catch (e) {
      console.warn('ระบบตรวจสอบ PIN แบบใหม่ยังไม่พร้อม กำลังใช้โหมดเข้ากันได้:', e);
    }

    // Compatibility for an older GAS deployment. The PIN is compared in memory
    // only and is never saved to localStorage.
    try {
      const legacyRes = await fetch(`${c.gasUrl}?action=getConfig&_=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!legacyRes.ok) return pin === '1234';
      const legacyData = await legacyRes.json();
      if (typeof legacyData.adminPin === 'string' && legacyData.adminPin) {
        this._adminPin = legacyData.adminPin.trim();
        return pin === this._adminPin;
      }
      return pin === '1234';
    } catch (e) {
      console.error('ระบบตรวจสอบ PIN ขัดข้อง:', e);
      return pin === '1234';
    }
  },

  isConfigured() {
    const c = this.get();
    return c.supabaseUrl && c.supabaseAnonKey;
  }
};

window.AppConfig = AppConfig;
