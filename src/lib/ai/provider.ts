import { logger } from "@/lib/logger";

/**
 * TASK-040: AI Provider abstraction (PRD §23) — business logic ห้ามผูก provider เดียว
 * เปลี่ยน provider ได้ผ่าน interface generateStructured()
 */

export type InlineFile = {
  mimeType: string; // application/pdf | image/png | image/jpeg | image/webp
  dataBase64: string;
};

export type GenerateStructuredInput = {
  systemPrompt: string;
  userPrompt: string;
  files?: InlineFile[];
  model: string;
  responseSchema: object; // Gemini responseSchema (OpenAPI subset)
  maxOutputTokens?: number;
};

export type GenerateStructuredResult = {
  output: unknown; // parsed JSON (validated ต่อโดย gateway)
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};

export interface AiProvider {
  name: string;
  generateStructured(input: GenerateStructuredInput): Promise<GenerateStructuredResult>;
}

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiProvider implements AiProvider {
  name = "gemini";

  async generateStructured(input: GenerateStructuredInput): Promise<GenerateStructuredResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents: [
        {
          role: "user",
          parts: [
            ...((input.files ?? []).map((f) => ({
              inlineData: { mimeType: f.mimeType, data: f.dataBase64 },
            }))),
            { text: input.userPrompt },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: input.responseSchema,
        temperature: 0.2,
        maxOutputTokens: input.maxOutputTokens ?? 2048,
      },
    };

    const started = Date.now();
    const res = await fetch(`${GEMINI_API}/${input.model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error("gemini_api_error", { status: res.status, body: text.slice(0, 300) });
      throw new Error(`GEMINI_ERROR_${res.status}`);
    }

    const json = await res.json();
    const latencyMs = Date.now() - started;

    const parts = json?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p: { text?: string }) => p.text ?? "").join("");
    if (!text) throw new Error("GEMINI_EMPTY_RESPONSE");

    let output: unknown;
    try {
      output = JSON.parse(text);
    } catch {
      throw new Error("GEMINI_INVALID_JSON");
    }

    return {
      output,
      inputTokens: json?.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: json?.usageMetadata?.candidatesTokenCount ?? 0,
      latencyMs,
    };
  }
}
