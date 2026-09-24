/**
 * Model provider abstraction. `getProvider()` returns null when no
 * GEMINI_API_KEY is configured, which is what keeps the app offline-first
 * (see isDemoMode() in lib/config.ts). No SDK dependency: GeminiProvider
 * talks to the plain REST API so the bundle stays small.
 */

export interface ModelProvider {
  id: string;
  generate(input: { system: string; prompt: string; temperature?: number }): Promise<string>;
}

const DEFAULT_MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 15_000;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export class GeminiProvider implements ModelProvider {
  readonly id: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string = process.env.AI_MODEL || DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
    this.id = `gemini:${model}`;
  }

  async generate(input: { system: string; prompt: string; temperature?: number }): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: input.prompt }] }],
          systemInstruction: { role: "system", parts: [{ text: input.system }] },
          generationConfig: { temperature: input.temperature ?? 0.4 },
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Gemini request failed (${res.status} ${res.statusText}): ${body.slice(0, 500)}`);
      }
      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text.trim()) throw new Error("Gemini returned an empty response");
      return text.trim();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Gemini request timed out after ${TIMEOUT_MS}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Returns null when no GEMINI_API_KEY is set, so callers can fall back offline. */
export function getProvider(): ModelProvider | null {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GeminiProvider(apiKey) : null;
}
