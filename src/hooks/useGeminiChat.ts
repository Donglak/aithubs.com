import { useState, useCallback, useEffect, useRef } from "react";
import {
  geminiClient,
  formatMessagesForGemini,
  createSystemPrompt,
  type GeminiMessage,
} from "../lib/gemini";
import i18n from "../i18n";
import { getChatbotErrorMessage } from "../i18n/chatbotErrorMessages";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface UseGeminiChatOptions {
  systemPrompt?: string;
  onError?: (error: Error) => void;
  maxHistory?: number;
}

const STORAGE_KEY = "gemini_chat_history";
const MAX_HISTORY = 10;

export function useGeminiChat(options: UseGeminiChatOptions = {}) {
  const { systemPrompt, onError, maxHistory = MAX_HISTORY } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-maxHistory)),
      );
    }
  }, [messages, maxHistory]);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(-maxHistory + 1), newMessage]);
      return newMessage.id;
    },
    [maxHistory],
  );

  const updateMessage = useCallback(
    (id: string, content: string, isStreaming = false) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content, isStreaming } : m)),
      );
    },
    [],
  );

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const userContent = content.trim();
      if (!userContent || isLoading) return;

      addMessage({
        role: "user",
        content: userContent,
      });

      const assistantMessageId = addMessage({
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      setIsLoading(true);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const history = [
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: "user" as const,
            content: userContent,
          },
        ];

        const systemMsg =
          systemPrompt ||
          createSystemPrompt({
            context:
              "Current page: " +
              window.location.pathname +
              ". User may be browsing tools, courses, ebooks, or blog.",
            language: i18n.language,
          }).parts[0].text;

        const geminiMessages = formatMessagesForGemini(history, systemMsg);

        const fullResponse = await geminiClient.generateContent(
          geminiMessages,
          {
            temperature: 0.7,
            maxOutputTokens: 2048,
            signal: controller.signal,
          },
        );

        // Post-process: completely remove asterisks - replace bullets and markdown
        const processedResponse = fullResponse
          .replace(/^\s*\*\s+/gm, "- ")        // Bullet points at start of line
          .replace(/\n\s*\*\s+/g, "\n- ")      // Bullet points after newline
          .replace(/\*\*(.*?)\*\*/g, "$1")      // Bold **text** -> text
          .replace(/\*(.*?)\*/g, "$1")          // Italic *text* -> text
          .replace(/\*/g, "");                  // Remove any remaining standalone *

        updateMessage(
          assistantMessageId,
          processedResponse || i18n.t("chatbot:errors.noResponse"),
          false,
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          updateMessage(
            assistantMessageId,
            i18n.t("chatbot:errors.stopped"),
            false,
          );
          return;
        }

        console.error("Gemini chat error:", err);

        const error = err instanceof Error ? err : new Error("Unknown error");
        onError?.(error);

        updateMessage(assistantMessageId, getChatbotErrorMessage(error), false);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, addMessage, updateMessage, systemPrompt, onError, isLoading],
  );

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const toggleHistory = useCallback(() => {
    setMessages((prev) => (prev.length === 0 ? [] : prev));
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    cancelStreaming,
    clearHistory,
    addMessage,
    updateMessage,
    removeMessage,
  };
}
