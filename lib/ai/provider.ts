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
// Thinking models can take a while on longer tasks; override with AI_TIMEOUT_MS.
const timeoutMs = () => Number(process.env.AI_TIMEOUT_MS) || 30_000;

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

  /**
   * Retries on HTTP 429 (rate limit) up to AI_MAX_RETRIES times, waiting for the
   * delay the API suggests. Off by default so live requests never stall;
   * scripts/warm-cache.ts turns it on because free-tier keys are rate-limited.
   */
  async generate(input: { system: string; prompt: string; temperature?: number }): Promise<string> {
    const maxRetries = Number(process.env.AI_MAX_RETRIES) || 0;
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.generateOnce(input);
      } catch (err) {
        const retryAfter = err instanceof RateLimitError ? err.retryAfterMs : null;
        if (retryAfter === null || attempt >= maxRetries) throw err;
        await new Promise((r) => setTimeout(r, retryAfter));
      }
    }
  }

  private async generateOnce(input: { system: string; prompt: string; temperature?: number }): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const controller = new AbortController();
    const timeout = timeoutMs();
    const timer = setTimeout(() => controller.abort(), timeout);
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
        if (res.status === 429) {
          // The API suggests a wait like "retryDelay": "37s"; default to a minute.
          const delay = Number(body.match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/)?.[1] ?? 60);
          throw new RateLimitError(`Gemini rate limit (429): ${body.slice(0, 200)}`, (delay + 1) * 1000);
        }
        throw new Error(`Gemini request failed (${res.status} ${res.statusText}): ${body.slice(0, 500)}`);
      }
      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text.trim()) throw new Error("Gemini returned an empty response");
      return text.trim();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Gemini request timed out after ${timeout}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    readonly retryAfterMs: number,
  ) {
    super(message);
  }
}

/** Returns null when no GEMINI_API_KEY is set, so callers can fall back offline. */
export function getProvider(): ModelProvider | null {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GeminiProvider(apiKey) : null;
}
