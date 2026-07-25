import {
  Send,
  X,
  Loader2,
  Trash2,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useGeminiChat, type ChatMessage } from "../../hooks/useGeminiChat";
import { useTranslation } from "react-i18next";

interface ChatBotWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatBotWindow({ isOpen, onClose }: ChatBotWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(["chatbot", "common"]);
  const suggestions = [
    t("chatbot:suggestions.writingTool"),
    t("chatbot:suggestions.mlCourse"),
    t("chatbot:suggestions.marketingEbook"),
    t("chatbot:suggestions.notionVsObsidian"),
  ];

  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    cancelStreaming,
    clearHistory,
  } = useGeminiChat({
    systemPrompt: undefined,
    onError: (err) => console.error("Chat error:", err),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        sendMessage(inputValue);
        setInputValue("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50 w-full max-w-md h-[600px] md:h-[650px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up"
      role="dialog"
      aria-label="Chat support"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-green-500 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("chatbot:title")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isStreaming
                ? t("chatbot:subtitle.replying")
                : isLoading
                  ? t("chatbot:subtitle.connecting")
                  : t("chatbot:subtitle.supporter")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={showHistory ? "hidden history" : "show history"}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${!showHistory ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ display: showHistory ? "block" : "none" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("chatbot:welcome.title")}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              {t("chatbot:welcome.description")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="px-3 py-1.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary-600 text-white rounded-tr-none"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${message.role === "user" ? "text-primary-100" : "text-gray-400 dark:text-gray-600"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-none">
                  <p className="text-sm">
                    <span className="inline-block animate-pulse">▌</span>
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-none">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                    <span>{t("common:status.thinking")}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}

        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-t-to-t from-white dark:from-gray-900 to-transparent pt-6 pointer-events-none">
            <button
              onClick={clearHistory}
              className="mx-auto px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {t("chatbot:clearHistory")}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chatbot:placeholder")}
            rows={1}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors disabled:opacity-50"
            aria-label={t("chatbot:placeholder")}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
            aria-label={t("common:buttons:send")}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 text-center">
          {t("chatbot:disclaimer")}
        </p>
      </form>
    </div>
  );
}

export function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  // This will be handled by the parent component
}

export function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    // This will be handled by the parent component
  }
}
