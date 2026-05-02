import { useNewsletterPopup } from '../hooks/useNewsletterPopup';
import NewsletterPopup from './NewsletterPopup'; // (file ở trên)

export default function PopupManager() {
  const { open, close } = useNewsletterPopup({
    delayMs: 18000,
    scrollRatio: 0.55,
    suppressionDays: 7,
  });

  return (
    <>
      <NewsletterPopup
        isOpen={open}
        onClose={close}
        // Nếu có backend: đổi URL bên dưới
        submitUrl="/api/subscribe"
        onSubmitted={() => {
          // optional: GA event, toast, v.v.
          close();
        }}
      />
    </>
  );
}
