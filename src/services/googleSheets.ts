// src/services/googleSheets.ts
// Service chạy TRÊN TRÌNH DUYỆT (Vite) → dùng import.meta.env
// Hỗ trợ 2 sheet tách biệt: 'newsletter' & 'survey'.
// Tự động xử lý CORS khi endpoint là Apps Script (script.google.com).

type NewsletterPayload = {
  name?: string;
  email: string;
  timestamp?: string;
  source?: string;
};

type SurveyPayload = {
  role?: string;
  goals?: string[] | string; // chấp nhận string, sẽ convert về array
  budget?: string;
  pain?: string;
  name?: string;
  email?: string;
  consent?: boolean;
  ua?: string;
  path?: string;
  timestamp?: string;
};
VITE_SHEETS_API_ENDPOINT=https://script.google.com/macros/s/AKfycbzZQAxAzsenmrtf_vp6pn7EevldbBhe4z0pEZeu4_BBtg7b1_TVfIipAkLDp1HPT5Sg/exec
const ENDPOINT: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    VITE_SHEETS_API_ENDPOINT ||
  '/api/google-sheets'; // dùng khi bạn có proxy /api

const isGAS = (url: string) => /script\.google\.com|apps-script/i.test(url);

async function postToSheets(payload: { sheet: string; data: Record<string, any> }) {
  const url = ENDPOINT;
  const body = JSON.stringify(payload);
  const useNoCors = isGAS(url);

  // Gọi Apps Script trực tiếp → dùng no-cors, bỏ Content-Type (trình duyệt sẽ set text/plain)
  const resp = await fetch(url, {
    method: 'POST',
    ...(useNoCors ? ({ mode: 'no-cors' } as RequestInit) : {}),
    headers: useNoCors ? undefined : { 'Content-Type': 'application/json' },
    body,
  });

  // no-cors → response opaque, không đọc được status/json nhưng request vẫn gửi OK
  if (useNoCors) return { ok: true, opaque: true };

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `HTTP ${resp.status}`);
  }
  return resp.json().catch(() => ({}));
}

export async function submitNewsletterToSheet(
  payload: NewsletterPayload,
  sheetName = 'newsletter'
) {
  const data = {
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
  return postToSheets({ sheet: sheetName, data });
}

export async function appendSurveyToSheet(
  payload: SurveyPayload,
  sheetName = 'survey'
) {
  const goals =
    Array.isArray(payload.goals)
      ? payload.goals
      : String(payload.goals || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

  const data = {
    ...payload,
    goals,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
  return postToSheets({ sheet: sheetName, data });
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
