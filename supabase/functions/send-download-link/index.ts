// supabase/functions/send-download-link/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const fromEmail = Deno.env.get('FROM_EMAIL')!;
const siteUrl = Deno.env.get('SITE_URL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error('Missing orderId');

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, amount, currency, metadata, profiles!inner(email, full_name)')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');

    const userEmail = order.profiles?.email;
    const ebookId = order.metadata?.ebook_id;
    const ebookTitle = order.metadata?.ebook_title || 'Ebook';
    const downloadUrl = `${siteUrl}/download/${ebookId}?order=${orderId}&token=${generateToken(orderId)}`;

    const emailHtml = generateEmailHtml(ebookTitle, orderId, downloadUrl, order.amount, order.currency);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [userEmail], subject: `📚 Link download: ${ebookTitle}`, html: emailHtml }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Resend error: ${JSON.stringify(err)}`);
    }

    await supabase.from('orders').update({
      metadata: { ...order.metadata, download_sent: true, download_sent_at: new Date().toISOString() },
    }).eq('id', orderId);

    return new Response(JSON.stringify({ success: true, emailSent: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Send download link error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function generateToken(orderId: string) {
  return btoa(`${orderId}:${Date.now()}:${Deno.env.get('DOWNLOAD_TOKEN_SECRET')}`).slice(0, 32);
}

function generateEmailHtml(title: string, orderId: string, downloadUrl: string, amount: number, currency: string) {
  const formattedAmount = currency === 'vnd'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);

  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#2563eb;">🎉 Cảm ơn bạn đã mua <strong>${title}</strong>!</h2>
  <p>Đơn hàng: <strong>${orderId}</strong></p>
  <p>Số tiền: <strong>${formattedAmount}</strong></p>
  <p>Link download sẽ hết hạn sau 7 ngày. Vui lòng tải về sớm.</p>
  <div style="margin:30px 0;text-align:center;">
    <a href="${downloadUrl}" style="background:#2563eb;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">📥 Tải xuống Ebook ngay</a>
  </div>
  <p style="color:#6b7280;font-size:14px;">Nếu nút không hoạt động, copy link sau vào trình duyệt:<br>${downloadUrl}</p>
  <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;">AIThubs - Khám phá công cụ AI, khóa học & Ebook</p>
</body></html>`;
}