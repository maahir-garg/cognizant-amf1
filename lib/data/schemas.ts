import { z } from "zod";

export const StatusEnum = z.enum(["verified", "estimated", "simulated"]);
export type StatusType = z.infer<typeof StatusEnum>;

export const PillarEnum = z.enum(["Environment", "Belong", "Community", "Governance"]);
export type Pillar = z.infer<typeof PillarEnum>;

export const FactSchema = z.object({
  id: z.string(),
  pillar: PillarEnum,
  metric: z.string(),
  value: z.number(),
  unit: z.string(),
  display_value: z.string().optional(),
  period: z.string(),
  source_doc: z.string(),
  page: z.number(),
  status: StatusEnum,
  formula: z.string().optional(),
  notes: z.string().optional(),
  partner_relevant: z.boolean().default(false),
});
export type Fact = z.infer<typeof FactSchema>;

export const InitiativeMetricSchema = z.object({
  fact_id: z.string().optional(),
  label: z.string(),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  status: StatusEnum,
});

export const InitiativeSchema = z.object({
  id: z.string(),
  pillar: PillarEnum,
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  race_slug: z.string().optional(),
  partner: z.enum(["Cognizant", "Make A Mark", "AMF1", "Community Partner"]),
  un_sdgs: z.array(z.number()),
  location: z.string(),
  metrics: z.array(InitiativeMetricSchema),
  status: StatusEnum,
  badge: z.string(),
  featured: z.boolean().default(false),
});
export type Initiative = z.infer<typeof InitiativeSchema>;

export const ConversionFactorSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  factor_per_tco2e: z.number(),
  unit_label: z.string(),
  icon: z.string(),
  description: z.string(),
  source_name: z.string(),
  source_url: z.string(),
  status: StatusEnum,
});
export type ConversionFactor = z.infer<typeof ConversionFactorSchema>;

export const RaceWeekendSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  circuit: z.string(),
  city: z.string(),
  country: z.string(),
  dates: z.string(),
  round: z.number(),
  freight_tco2e: z.number(),
  travel_tco2e: z.number(),
  total_tco2e: z.number(),
  previous_period_tco2e: z.number(),
  delta_percent: z.number(),
  saf_uptake_percent: z.number(),
  responsible_initiatives: z.array(z.string()),
  initiatives_active: z.array(z.string()),
  status: StatusEnum,
  notes: z.string().optional(),
});
export type RaceWeekend = z.infer<typeof RaceWeekendSchema>;

export const FanLevelEnum = z.enum(["new", "casual", "die-hard"]);
export type FanLevel = z.infer<typeof FanLevelEnum>;

export const FanProfileSchema = z.object({
  fan_level: FanLevelEnum,
  home_city: z.string(),
  interests: z.array(z.string()),
  impact_credits: z.number().default(0),
  completed_quizzes: z.array(z.string()).default([]),
  chosen_actions: z.array(z.string()).default([]),
});
export type FanProfile = z.infer<typeof FanProfileSchema>;

export const EventStreamItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  elapsed_min: z.number(),
  type: z.enum(["freight", "session", "community", "milestone", "audit"]),
  title: z.string(),
  description: z.string(),
  badge: z.string(),
  pillar: PillarEnum,
  fact_ref: z.string().optional(),
  status: StatusEnum,
});
export type EventStreamItem = z.infer<typeof EventStreamItemSchema>;

export const ScenarioInputSchema = z.object({
  saf_aviation_percent: z.number().min(0).max(100),
  stem_cohort_expand_percent: z.number().min(0).max(300),
  biofuel_freight_percent: z.number().min(0).max(100),
  female_stem_mentorship_target: z.number().min(0).max(100),
});
export type ScenarioInput = z.infer<typeof ScenarioInputSchema>;

export const ScenarioOutputSchema = z.object({
  freight_tco2e_saved: z.number(),
  overall_scope3_reduction_tco2e: z.number(),
  students_reached_additional: z.number(),
  projected_diversity_gain_percent: z.number(),
  explanation: z.string(),
  status: StatusEnum,
});
export type ScenarioOutput = z.infer<typeof ScenarioOutputSchema>;

export const AiTaskTypeEnum = z.enum([
  "fan_story",
  "quiz_feedback",
  "share_caption",
  "linkedin_post",
  "quarterly_brief",
  "investor_summary",
  "scenario_explanation",
  "community_story",
]);
export type AiTaskType = z.infer<typeof AiTaskTypeEnum>;

export const AiRequestSchema = z.object({
  task_type: AiTaskTypeEnum,
  context_facts: z.array(FactSchema),
  parameters: z.record(z.any()),
  user_persona: z.string().optional(),
});
export type AiRequest = z.infer<typeof AiRequestSchema>;

export const AiResponseSchema = z.object({
  content: z.string(),
  cited_fact_ids: z.array(z.string()),
  guardrail_passed: z.boolean(),
  verified_numbers: z.array(z.number()),
  unverified_numbers: z.array(z.number()),
  cached: z.boolean(),
  model: z.string(),
  status: StatusEnum,
});
export type AiResponse = z.infer<typeof AiResponseSchema>;
