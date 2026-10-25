// supabase/functions/send-download-link/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PAID_EBOOKS } from '../_shared/pricing.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const fromEmail = Deno.env.get('FROM_EMAIL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  // Chỉ server nội bộ (webhook / paypal-confirm) được gọi function này
  if (req.headers.get('Authorization') !== `Bearer ${supabaseServiceKey}`) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error('Missing orderId');

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, amount, currency, status, metadata')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');
    if (order.status !== 'COMPLETED') throw new Error('Order is not paid');
    if (order.metadata?.download_sent) {
      return new Response(JSON.stringify({ success: true, emailSent: false, reason: 'already sent' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(order.user_id);
    const userEmail = user?.email;
    if (!userEmail) throw new Error('User has no email');

    const ebook = PAID_EBOOKS[String(order.metadata?.ebook_id)];
    if (!ebook?.deliveryUrl) throw new Error('Ebook has no delivery link');
    const ebookTitle = ebook.title;
    const downloadUrl = ebook.deliveryUrl;

    const emailHtml = generateEmailHtml(ebookTitle, orderId, downloadUrl, order.amount, order.currency);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [userEmail], subject: `Your download: ${ebookTitle}`, html: emailHtml }),
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
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function generateEmailHtml(title: string, orderId: string, downloadUrl: string, amount: number, currency: string) {
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() })
    .format(currency === 'vnd' ? amount : amount / 100);
  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(downloadUrl);

  return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111827;">
  <h2 style="color:#2563eb;">Thanks for purchasing <strong>${safeTitle}</strong>!</h2>
  <p>Order: <strong>${escapeHtml(orderId)}</strong></p>
  <p>Amount paid: <strong>${formattedAmount}</strong></p>
  <div style="margin:30px 0;text-align:center;">
    <a href="${safeUrl}" style="background:#2563eb;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Download your ebook</a>
  </div>
  <p style="color:#6b7280;font-size:14px;">If the button doesn't work, copy this link into your browser:<br>${safeUrl}</p>
  <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;">AIThubs — AI tools, courses &amp; ebooks</p>
</body></html>`;
}
