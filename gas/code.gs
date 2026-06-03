// Google Apps Script (code.gs)
// Deploy this script as a Web App:
// 1. Open Google Apps Script (script.google.com)
// 2. Paste this code.
// 3. Click "Deploy" -> "New deployment"
// 4. Select Type: Web App
// 5. Execute as: Me (your-account)
// 6. Who has access: Anyone
// 7. Click Deploy, authorize permissions, and copy the Web App URL.
// 8. Put this URL in the settings panel (GAS Connection URL).

function doGet(e) {
  const action = e.parameter.action;
  const properties = PropertiesService.getScriptProperties();
  
  if (action === 'getConfig') {
    const config = {
      supabaseUrl: properties.getProperty('SUPABASE_URL') || '',
      supabaseAnonKey: properties.getProperty('SUPABASE_ANON_KEY') || '',
      cloudinaryCloudName: properties.getProperty('CLOUDINARY_CLOUD_NAME') || '',
      cloudinaryUploadPreset: properties.getProperty('CLOUDINARY_UPLOAD_PRESET') || '',
      cloudinaryApiKey: properties.getProperty('CLOUDINARY_API_KEY') || '',
      cloudinaryApiSecret: properties.getProperty('CLOUDINARY_API_SECRET') || '',
      promptpayId: properties.getProperty('PROMPTPAY_ID') || '0880699227',
      adminPin: properties.getProperty('ADMIN_PIN') || '1234'
    };
    
    // Support CORS for client-side fetches
    return ContentService.createTextOutput(JSON.stringify(config))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Return configuration UI editor for the admin
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ตั้งค่าระบบคีย์เชื่อมต่อ — ร้านแม่น้อย</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Noto Sans Thai', sans-serif; }
      </style>
    </head>
    <body class="bg-slate-50 text-slate-800 p-4 sm:p-6 flex items-center justify-center min-h-screen">
      <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl">⚙️</div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">ตั้งค่าคีย์เชื่อมต่อฐานข้อมูลและรูปภาพ</h2>
            <p class="text-xs text-slate-500">ข้อมูลนี้จะบันทึกใน Google Apps Script อย่างปลอดภัย</p>
          </div>
        </div>
        
        <form action="${ScriptApp.getService().getUrl()}" method="POST" class="space-y-4 text-sm">
          <input type="hidden" name="action" value="saveConfig" />
          
          <div>
            <label class="block font-semibold text-slate-700">Supabase URL</label>
            <input type="url" required name="supabaseUrl" value="${properties.getProperty('SUPABASE_URL') || ''}" placeholder="https://xxxx.supabase.co" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700">Supabase Anon Key</label>
            <input type="text" required name="supabaseAnonKey" value="${properties.getProperty('SUPABASE_ANON_KEY') || ''}" placeholder="eyJhbGciOi..." class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div class="border-t border-slate-100 pt-4">
            <label class="block font-semibold text-slate-700">Cloudinary Cloud Name</label>
            <input type="text" required name="cloudinaryCloudName" value="${properties.getProperty('CLOUDINARY_CLOUD_NAME') || ''}" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700">Cloudinary Upload Preset</label>
            <input type="text" required name="cloudinaryUploadPreset" value="${properties.getProperty('CLOUDINARY_UPLOAD_PRESET') || ''}" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700">Cloudinary API Key</label>
              <input type="text" name="cloudinaryApiKey" value="${properties.getProperty('CLOUDINARY_API_KEY') || ''}" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700">Cloudinary API Secret</label>
              <input type="password" name="cloudinaryApiSecret" value="${properties.getProperty('CLOUDINARY_API_SECRET') || ''}" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div class="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700">PromptPay ID</label>
              <input type="text" required name="promptpayId" value="${properties.getProperty('PROMPTPAY_ID') || ''}" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700">PIN หลังบ้าน (สำรอง)</label>
              <input type="text" required name="adminPin" value="${properties.getProperty('ADMIN_PIN') || '1234'}" class="w-full p-2.5 border border-slate-200 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          
          <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl mt-2 transition-colors shadow-lg shadow-emerald-600/20">บันทึกข้อมูลเข้าระบบคีย์ (GAS)</button>
        </form>
      </div>
    </body>
    </html>
  `;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const params = e.parameter;
  if (params.action === 'saveConfig') {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty('SUPABASE_URL', params.supabaseUrl);
    properties.setProperty('SUPABASE_ANON_KEY', params.supabaseAnonKey);
    properties.setProperty('CLOUDINARY_CLOUD_NAME', params.cloudinaryCloudName);
    properties.setProperty('CLOUDINARY_UPLOAD_PRESET', params.cloudinaryUploadPreset);
    properties.setProperty('CLOUDINARY_API_KEY', params.cloudinaryApiKey || '');
    properties.setProperty('CLOUDINARY_API_SECRET', params.cloudinaryApiSecret || '');
    properties.setProperty('PROMPTPAY_ID', params.promptpayId);
    properties.setProperty('ADMIN_PIN', params.adminPin || '1234');
    
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Noto Sans Thai', sans-serif; }</style>
      </head>
      <body class="bg-slate-50 p-6 flex flex-col items-center justify-center min-h-screen text-center">
        <div class="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-4">
          <div class="text-5xl">🎉</div>
          <h2 class="text-xl font-bold text-emerald-600">บันทึกข้อมูลสำเร็จ!</h2>
          <p class="text-sm text-slate-500">ข้อมูลของคุณถูกจัดเก็บใน Script Properties เรียบร้อยแล้ว</p>
          <p class="text-xs text-slate-400">คุณสามารถปิดหน้านี้ และโหลดหน้าเว็บหลักใหม่เพื่อใช้งานได้ทันที</p>
        </div>
      </body>
      </html>
    `;
    return HtmlService.createHtmlOutput(successHtml);
  }
}
