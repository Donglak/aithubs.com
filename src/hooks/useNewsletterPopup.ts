import { useEffect, useState } from 'react';

type Options = {
  delayMs?: number;        // mở sau X ms
  scrollRatio?: number;    // mở khi cuộn qua X% trang
  suppressionDays?: number;// không hiển thị lại trong X ngày
};

const LS_LAST_SEEN = 'dth_popup_last_seen';
const LS_DONE = 'dth_survey_done';

export function useNewsletterPopup({
  delayMs = 20000,
  scrollRatio = 0.5,
  suppressionDays = 7,
}: Options = {}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Nếu user đã hoàn tất survey -> không mở nữa
    if (localStorage.getItem(LS_DONE) === '1') return;

    const last = localStorage.getItem(LS_LAST_SEEN);
    if (last) {
      const diff = Date.now() - Number(last);
      if (diff < suppressionDays * 24 * 60 * 60 * 1000) return;
    }

    let timer = setTimeout(() => setOpen(true), delayMs);

    const onScroll = () => {
      const ratio =
        (window.scrollY + window.innerHeight) / (document.body.scrollHeight || 1);
      if (ratio >= scrollRatio) {
        setOpen(true);
        window.removeEventListener('scroll', onScroll);
        clearTimeout(timer);
      }
    };
    window.addEventListener('scroll', onScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [delayMs, scrollRatio, suppressionDays]);

  const close = () => {
    setOpen(false);
    localStorage.setItem(LS_LAST_SEEN, String(Date.now()));
  };

  return { open, close, setOpen };
}
