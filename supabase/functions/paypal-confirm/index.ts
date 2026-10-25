// supabase/functions/paypal-confirm/index.ts
// Gọi từ trang /payment/success khi user quay lại từ PayPal:
// capture order ebook (hoặc kiểm tra subscription VIP) và trả về kết quả thật.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { confirmPaypalOrder, getOrder } from '../_shared/orders.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ success: false, error: 'Please sign in' }, 401);

    const { orderId } = await req.json();
    if (typeof orderId !== 'string') return json({ success: false, error: 'Missing orderId' }, 400);

    const order = await getOrder(supabase, orderId);
    // Không tiết lộ đơn của người khác
    if (!order || order.user_id !== user.id) return json({ success: false, error: 'Order not found' }, 404);

    const result = await confirmPaypalOrder(supabase, order);
    return json({ success: true, data: result });
  } catch (err) {
    console.error('paypal-confirm error:', err);
    return json({ success: false, error: (err as Error).message }, 400);
  }
});
