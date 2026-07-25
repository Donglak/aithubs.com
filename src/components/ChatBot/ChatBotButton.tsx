import { MessageCircle, X } from "lucide-react";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useGeminiChat } from "../../hooks/useGeminiChat";
import { useTranslation } from "react-i18next";

interface ChatBotButtonProps {
  autoOpenDelay?: number;
  openOnScroll?: number;
}

const ChatBotWindow = lazy(() =>
  import("./ChatBotWindow").then((module) => ({
    default: module.ChatBotWindow,
  })),
);

export function ChatBotButton({
  autoOpenDelay = 30000,
  openOnScroll = 0.7,
}: ChatBotButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const windowRef = useRef<HTMLDivElement>(null);

  const { messages, clearHistory } = useGeminiChat();
  const { t } = useTranslation("chatbot");

  // Auto open logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        setIsOpen(true);
        setUnreadCount(1);
      }
    }, autoOpenDelay);

    const onScroll = () => {
      const ratio =
        (window.scrollY + window.innerHeight) /
        (document.body.scrollHeight || 1);
      if (ratio >= openOnScroll && messages.length === 0) {
        setIsOpen(true);
        setUnreadCount(1);
        window.removeEventListener("scroll", onScroll);
        clearTimeout(timer);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [autoOpenDelay, openOnScroll, messages.length]);

  // Update unread count when new messages arrive (from assistant)
  useEffect(() => {
    if (!isOpen) {
      const newAssistantMessages = messages.filter(
        (m) =>
          m.role === "assistant" && Date.now() - m.timestamp.getTime() < 5000,
      ).length;
      if (newAssistantMessages > 0) {
        setUnreadCount((prev) => prev + newAssistantMessages);
        setHasNotification(true);
      }
    } else {
      setUnreadCount(0);
      setHasNotification(false);
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  const closeChat = () => setIsOpen(false);

  const handleClose = () => {
    closeChat();
    setHasNotification(false);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleChat}
        className={[
          "fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-xl transition-all duration-300",
          "bg-gradient-to-br from-primary-500 to-green-500 text-white",
          "hover:scale-105 hover:shadow-2xl",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          "active:scale-95",
          isOpen ? "rotate-45" : "",
        ].join(" ")}
        aria-label={isOpen ? "close chat" : "open AIThubs Support"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {hasNotification && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Notification badge when closed */}
      {!isOpen && hasNotification && (
        <div className="fixed bottom-16 right-4 z-30 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg text-xs text-gray-700 dark:text-gray-300 animate-slide-in-right">
          {t("notification")}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div ref={windowRef}>
          <Suspense
            fallback={
              <div className="fixed bottom-4 right-4 z-50 w-full max-w-md h-[600px] md:h-[650px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <ChatBotWindow isOpen={isOpen} onClose={handleClose} />
          </Suspense>
        </div>
      )}
    </>
  );
}
