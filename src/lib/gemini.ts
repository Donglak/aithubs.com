export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GeminiResponse {
  text: string;
  raw?: unknown;
}

class GeminiClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_CHAT_API_URL || "/api/chat";
  }

  isConfigured(): boolean {
    return true;
  }

  async generateContent(
    messages: GeminiMessage[],
    options?: {
      temperature?: number;
      maxOutputTokens?: number;
      signal?: AbortSignal;
    },
  ): Promise<string> {
    const requestBody: GeminiRequest = {
      contents: messages,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: options?.signal,
    });

    let data: GeminiResponse | { error?: string; message?: string } | null = null;

    try {
      data = await response.json();
    } catch {
      throw new Error(`Chat function trả về dữ liệu không hợp lệ (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(
        (data as { error?: string; message?: string })?.error ||
          (data as { error?: string; message?: string })?.message ||
          `API error: ${response.status}`,
      );
    }

    if (!(data as GeminiResponse)?.text) {
      throw new Error("No response generated");
    }

    return (data as GeminiResponse).text;
  }
}

export const geminiClient = new GeminiClient();

export function createSystemPrompt(context?: string): GeminiMessage {
  const basePrompt = `You are an AI assistant for DigitalToolsHub (AIThub), a platform that helps users discover and compare digital tools, AI tools, courses, and ebooks.

Your role:
- Help users find the right tools for their needs
- Answer questions about tools, pricing, features, categories
- Provide recommendations based on user requirements
- Be helpful, concise, and friendly
- If you don't know something, say so honestly

Guidelines:
- Keep responses concise
- Use bullet points for lists
- Mention specific tools when relevant
- Always be polite and professional`;

  return {
    role: "user",
    parts: [
      { text: context ? `${basePrompt}\n\nContext: ${context}` : basePrompt },
    ],
  };
}

export function formatMessagesForGemini(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt?: string,
): GeminiMessage[] {
  const messages: GeminiMessage[] = [];

  if (systemPrompt) {
    messages.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    messages.push({
      role: "model",
      parts: [{ text: "Understood. I will follow these guidelines." }],
    });
  }

  for (const msg of history) {
    messages.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  return messages;
}
