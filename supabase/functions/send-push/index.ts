import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import webpush from "npm:web-push";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  // จัดการ CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, body, url, targetLineId, groupCode } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ดึงข้อมูล Subscriptions
    let query = supabase.from('UserSubscriptions').select('*');
    
    // ตรวจสอบเงื่อนไขผู้รับปลายทาง
    if (targetLineId === 'admin') {
      // ค้นหา LineID ของผู้ดูแลระบบในบ้าน/กลุ่มเดียวกัน
      let adminQuery = supabase
        .from('Users')
        .select('LineID')
        .or('Role.ilike.%admin%,Role.ilike.%ผู้ดูแลระบบ%,Role.ilike.%manager%,Role.ilike.%ผู้บริหาร%');
      
      if (groupCode) {
        adminQuery = adminQuery.eq('GroupCode', groupCode);
      }
      
      const { data: admins, error: adminError } = await adminQuery;
      if (adminError) throw adminError;
      
      const adminLineIds = (admins || []).map((a: any) => a.LineID).filter(Boolean);
      if (adminLineIds.length > 0) {
        query = query.in('LineID', adminLineIds);
      } else {
        return new Response(JSON.stringify({ success: true, sentCount: 0, message: 'No admins found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    } else if (targetLineId && targetLineId !== 'all') {
      // ส่งเฉพาะรายบุคคล
      query = query.eq('LineID', targetLineId);
    } else if (groupCode) {
      // ส่งทุกคนเฉพาะสมาชิกในกลุ่มเดียวกัน
      const { data: users, error: userError } = await supabase
        .from('Users')
        .select('LineID')
        .eq('GroupCode', groupCode);
      
      if (userError) throw userError;
      
      const userLineIds = (users || []).map((u: any) => u.LineID).filter(Boolean);
      if (userLineIds.length > 0) {
        query = query.in('LineID', userLineIds);
      } else {
        return new Response(JSON.stringify({ success: true, sentCount: 0, message: 'No users found in this group' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    const { data: subs, error: subError } = await query;
    if (subError) throw subError;

    const results = [];
    const pushPayload = JSON.stringify({ title, body, url });

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys are not configured in Supabase Secrets.');
    }

    // กำหนดค่า VAPID Credentials
    webpush.setVapidDetails(
      'mailto:admin@example.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    if (subs && subs.length > 0) {
      for (const sub of subs) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            }
          }, pushPayload);
          results.push({ id: sub.id, status: 'success' });
        } catch (err: any) {
          console.error(`Failed to send to endpoint: ${sub.endpoint}`, err);
          results.push({ id: sub.id, status: 'failed', error: err.message });
          
          // ลบ Subscription ที่หมดอายุ / เบราว์เซอร์ยกเลิกสิทธิ์ ออกทันที
          if (err.statusCode === 410 || err.statusCode === 404 || (err.message && err.message.includes('expired'))) {
            await supabase.from('UserSubscriptions').delete().eq('id', sub.id);
            console.log(`Deleted invalid subscription: ${sub.id}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sentCount: results.filter(r => r.status === 'success').length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error('Error in send-push function:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
