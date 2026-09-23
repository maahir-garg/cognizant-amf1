import { Fact, AiTaskType } from "@/lib/data/schemas";

export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Builds strictly grounded prompts where the model is provided ONLY
 * with verified facts and instructed to cite their fact IDs.
 */
export function buildGroundedPrompt(
  taskType: AiTaskType,
  facts: Fact[],
  parameters: Record<string, any>,
  userPersona?: string
): PromptPayload {
  const factsContext = facts
    .map(
      (f) =>
        `- Fact ID: ${f.id} | Pillar: ${f.pillar} | Metric: ${f.metric} | Value: ${f.display_value || `${f.value} ${f.unit}`} | Period: ${f.period} | Source: ${f.source_doc} (Page ${f.page}) | Notes: ${f.notes || "N/A"}`
    )
    .join("\n");

  const baseGroundingRules = `
CRITICAL GROUNDING RULES:
1. You may ONLY mention quantitative data and numbers that appear verbatim in the FACT BASE below.
2. For EVERY claim or figure, cite the Fact ID in brackets, e.g. [FACT-E-04].
3. NEVER fabricate, estimate, or hallucinate any numbers, percentages, dates, or performance statistics.
4. If a fact is not provided, state that data is unavailable.
5. Your output will pass through an automated numeric validator; any unverified numbers will trigger immediate rejection.
`;

  switch (taskType) {
    case "fan_story":
      return {
        systemPrompt: `You are the lead storyteller for the Aston Martin Aramco F1 Team. Your mission is to make sustainability tangible, high-octane, and deeply relevant to Formula One fans. Tone: energetic, precise, inspiring.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

FAN PERSONA:
Level: ${userPersona || "New Fan"}
City: ${parameters.home_city || "Singapore"}
Interests: ${(parameters.interests || ["environment"]).join(", ")}

Generate a punchy 2-3 paragraph lap story through the team's impact. Tailor the depth:
- If "New Fan": High accessibility, relatable comparisons, inspiring tone.
- If "Die-hard": Technical depth, engineering precision, exact telemetry references.
Ensure you cite fact IDs for all numbers.`,
      };

    case "quiz_feedback":
      return {
        systemPrompt: `You are an F1 race engineer revealing telemetry after a fan's guess.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

FAN'S GUESS: ${parameters.user_guess}
ACTUAL METRIC: ${parameters.metric_name}

Provide feedback on whether their guess was close, reveal the actual verified number with its exact citation [FACT-ID], and explain why this matters in Formula One in 2 sentences.`,
      };

    case "share_caption":
      return {
        systemPrompt: `You are a social media copywriter for Aston Martin Aramco F1 Team.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

Generate a single 1-line punchy caption (under 140 chars) for an Instagram / TikTok story share card summarizing the fan's race weekend impact. Include an inline fact citation.`,
      };

    case "linkedin_post":
      return {
        systemPrompt: `You are the Head of Brand Communications at Cognizant partnering with Aston Martin Aramco F1 Team.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

FOCUS AREA: ${parameters.focus_area || "Joint Sustainability & STEM Technology Leadership"}

Draft a professional, inspiring LinkedIn post highlighting how Cognizant and AMF1 leverage data analytics and AI to drive tangible ESG impact at the Singapore GP.
Include:
- Compelling hook on data-driven engineering.
- Specific verified stats with inline citations [FACT-ID].
- Strategic mention of Cognizant's role in digital acceleration.
- 3 professional hashtags (#Cognizant #AMF1 #SustainableMotorsport).`,
      };

    case "quarterly_brief":
      return {
        systemPrompt: `You are an ESG auditor and strategy consultant for enterprise sponsors.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

Draft an executive quarterly impact brief for corporate sustainability directors. Format with:
1. Executive Summary
2. Carbon & Operational Efficiency Highlights (with citations)
3. Social & STEM Talent Pipeline ROI (with citations)
4. Audit Provenance Index.`,
      };

    case "investor_summary":
      return {
        systemPrompt: `You are an investor relations analyst writing concise board-level ESG commentary.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

Provide 4 high-impact bullet points demonstrating how AMF1 and Cognizant's sustainability investments mitigate regulatory and carbon risk while driving brand value. Strictly cite fact IDs.`,
      };

    case "scenario_explanation":
      return {
        systemPrompt: `You are an AI decision-support copilot for enterprise sustainability strategy.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

SCENARIO PARAMETERS:
- SAF Aviation Deployment: ${parameters.saf_aviation_percent}%
- STEM Cohort Expansion: ${parameters.stem_cohort_expand_percent}%
- Biofuel Road Freight: ${parameters.biofuel_freight_percent}%
PROJECTED OUTCOMES:
- Projected Freight tCO2e Saved: ${parameters.freight_tco2e_saved}
- Additional Students Reached: ${parameters.students_reached_additional}
- Projected Diversity Gain: +${parameters.projected_diversity_gain_percent}%

Explain the strategic implications of this scenario in 2 concise paragraphs for corporate decision makers.`,
      };

    case "community_story":
      return {
        systemPrompt: `You are a community impact advocate for Make A Mark partner charities.${baseGroundingRules}`,
        userPrompt: `FACT BASE:
${factsContext}

INITIATIVE: ${parameters.initiative_title || "Make A Mark STEM & Community Initiative"}

Draft an uplifting story kit update showcasing the tangible community impact on youth and diversity, citing verified benchmarks from the fact base.`,
      };

    default:
      return {
        systemPrompt: `You are an AI impact analyst.${baseGroundingRules}`,
        userPrompt: `FACT BASE:\n${factsContext}\n\nSummarize the verified ESG impact of the team.`,
      };
  }
}
