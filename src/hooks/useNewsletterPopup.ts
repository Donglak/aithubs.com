import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'newsletter_subscribed';
const POPUP_INTERVAL = 30000; // 30 seconds
const POPUP_DELAY_MS = 30_000;           // giữ delay mở ban đầu như hiện tại (30s)
const SUPPRESS_MS    = 30 * 24 * 60 * 60 * 1000; // 30 ngày

// Key mới: lưu thời điểm đã subscribe
const SUB_AT_KEY = 'newsletter_subscribed_at';

// Key cũ (legacy) bạn đang dùng: 'true' | undefined
const LEGACY_BOOL_KEY = STORAGE_KEY;

const getIsSuppressed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const legacy = localStorage.getItem(LEGACY_BOOL_KEY) === 'true';
  const atStr  = localStorage.getItem(SUB_AT_KEY);
  const at     = atStr ? Number(atStr) : 0;

  // Nếu trước đây chỉ lưu boolean, migrate sang timestamp để chặn 30 ngày từ bây giờ
  if (legacy && !at) {
    localStorage.setItem(SUB_AT_KEY, String(Date.now()));
    return true;
  }
  return at > 0 && (Date.now() - at) < SUPPRESS_MS;
};


export const useNewsletterPopup = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);


  useEffect(() => {
  const suppressed = getIsSuppressed();  // true nếu đã subscribe trong 30 ngày
  setIsSubscribed(suppressed);

  if (suppressed) return;                // -> KHÔNG đặt timer mở popup

  // Mở lần đầu sau 30s như cũ
  const t = setTimeout(() => setIsPopupOpen(true), POPUP_DELAY_MS);

  // (tuỳ bạn) nếu vẫn muốn thỉnh thoảng bật lại khi user đóng, có thể giữ interval:
  // const i = setInterval(() => setIsPopupOpen(true), POPUP_DELAY_MS);
  // return () => { clearTimeout(t); clearInterval(i); };

  return () => clearTimeout(t);
}, []);


  useEffect(() => {
    if (!isSubscribed && !isPopupOpen) {
      // Set up recurring popup every 30 seconds
      const interval = setInterval(() => {
        setIsPopupOpen(true);
      }, POPUP_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isSubscribed, isPopupOpen]);

const DISMISS_KEY = 'newsletter_dismissed_until';

const closePopup = useCallback(() => {
  const until = Date.now() + 24*60*60*1000; // 24h
  localStorage.setItem(DISMISS_KEY, String(until));
  setIsPopupOpen(false);
}, []);

useEffect(() => {
  if (isSubscribed) return;
  const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
  if (Date.now() < dismissedUntil) return;   // chưa đến hạn -> không đặt timer
  const t = setTimeout(() => setIsPopupOpen(true), POPUP_INTERVAL);
  return () => clearTimeout(t);
}, [isSubscribed, POPUP_INTERVAL]);

  const handleSubscribe = useCallback(async () => {
  try {
    localStorage.setItem(SUB_AT_KEY, String(Date.now())); // <-- timestamp
    // Giữ tương thích: có thể xoá key cũ nếu muốn
    localStorage.removeItem(LEGACY_BOOL_KEY);

    setIsSubscribed(true);
    setIsPopupOpen(false);
    return true;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}, []);


  return {
    isPopupOpen,
    closePopup,
    handleSubscribe,
    isSubscribed
  };
};