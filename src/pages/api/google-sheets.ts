// /pages/api/google-sheets.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Body = {
  sheet?: 'newsletter' | 'survey' | string;     // 'newsletter' | 'survey'
  data?: Record<string, any>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { sheet, data } = (req.body ?? {}) as Partial<Body>;
  if (!sheet || !data) return res.status(400).send('Missing sheet or data');

  try {
    // ===== CÁCH 1: Gọi Apps Script webhook =====
    if (!process.env.GAS_WEBHOOK_URL) throw new Error('Missing GAS_WEBHOOK_URL');
    const resp = await fetch(process.env.GAS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, data }),
    });
    if (!resp.ok) throw new Error(`GAS error: ${await resp.text()}`);

    // ===== CÁCH 2: Gọi trực tiếp Google Sheets API bằng Service Account =====
    // await appendToGoogleSheet({ sheet, data });

    // Tạm thời echo lại để test nhanh:
    return res.status(200).json({ ok: true, sheet, received: data });
  } catch (e: any) {
    console.error(e);
    return res.status(500).send(e?.message ?? 'Unknown error');
  }
}
