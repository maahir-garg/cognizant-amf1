import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/ai/generate/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/ai/generate", () => {
  it("400s on a body that fails schema validation", async () => {
    const res = await post({ task: "not-a-real-task", factIds: [] });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("400s on malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "not json" }),
    );
    expect(res.status).toBe(400);
  });

  it("400s on an unknown fact id", async () => {
    const res = await post({ task: "quiz-reveal", factIds: ["not-a-real-fact"], derived: [], params: { correct: true } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("not-a-real-fact");
  });

  it("200s and returns a grounded AiResponse for a valid request", async () => {
    const res = await post({
      task: "quiz-reveal",
      factIds: ["e25-saf-airfreight-cut"],
      derived: [],
      fan: { level: "new", cityId: "singapore", interests: ["environment"] },
      params: { quizId: "q-saf", correct: true },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.task).toBe("quiz-reveal");
    expect(json.guardrail.passed).toBe(true);
    expect(json.citations).toContain("e25-saf-airfreight-cut");
  });
});
