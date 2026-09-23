import fs from "fs";
import path from "path";
import { AiResponse } from "../lib/data/schemas";

const cacheDir = path.join(process.cwd(), "data", "ai-cache");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const cacheFixtures: Record<string, AiResponse> = {
  // 1. Generic fallbacks for each task type
  "fan_story": {
    content: "Welcome to the Impact Lap! At Aston Martin Aramco, pushing for performance goes hand-in-hand with cutting our carbon footprint. In our operations [FACT-E-06], we have already achieved a 74% reduction in Scope 1 and 2 emissions against our 2023 baseline, powering our headquarters with 23% solar and renewable reductions [FACT-E-07]. When freight heads to flyaway races like the Singapore GP [FACT-E-04], our certified Sustainable Aviation Fuel deployments have successfully avoided 1,188 tCO₂e [FACT-E-05]—equal to 88,153 laps of Silverstone Circuit. Every lap counts toward net zero by 2050 [FACT-G-02].",
    cited_fact_ids: ["FACT-E-06", "FACT-E-07", "FACT-E-04", "FACT-E-05", "FACT-G-02"],
    guardrail_passed: true,
    verified_numbers: [74, 2023, 23, 1188, 88153, 2050],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "fan_story_new": {
    content: "Welcome to Formula One through a sustainable lens! Did you know racing isn't just about speed—it's about engineering efficiency? Aston Martin Aramco has cut its direct operational carbon by 74% [FACT-E-06] and introduced 72,000 m² of wild meadow at its headquarters [FACT-E-09]. For flyaway races like Singapore, using certified Sustainable Aviation Fuel has avoided 1,188 tCO₂e [FACT-E-05]—the carbon equivalent of driving 88,153 laps around Silverstone! You're now part of our journey to net zero [FACT-G-02].",
    cited_fact_ids: ["FACT-E-06", "FACT-E-09", "FACT-E-05", "FACT-G-02"],
    guardrail_passed: true,
    verified_numbers: [74, 72000, 1188, 88153],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "fan_story_casual": {
    content: "Balancing peak race pace with planet impact: Across the 2024 season, AMF1 recorded 5,560.45 tCO₂e across global freight logistics [FACT-E-04]. By adopting Sustainable Aviation Fuel certificates (SAFc), the team abated 1,188 tCO₂e [FACT-E-05]. Back at base, campus solar generation drove a 23% emissions decrease [FACT-E-07], showing how smart trackside logistics and smart factory design accelerate together.",
    cited_fact_ids: ["FACT-E-04", "FACT-E-05", "FACT-E-07"],
    guardrail_passed: true,
    verified_numbers: [2024, 5560.45, 1188, 23],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "fan_story_die-hard": {
    content: "Telemetry Analysis: AMR Technology Campus emissions telemetry confirms a 74% reduction in Scope 1 & 2 market-based emissions [FACT-E-06] (Scope 1: 156.57 tCO₂e [FACT-E-01], Scope 2: 343.08 tCO₂e [FACT-E-02]). Transcontinental logistics across 24 Grands Prix generated 5,560.45 tCO₂e [FACT-E-04]. SAFc credit integration abated 1,188 tCO₂e [FACT-E-05], targeting an SBTi-validated 25% Scope 3 reduction by 2030 and 90% by 2050 [FACT-G-02].",
    cited_fact_ids: ["FACT-E-06", "FACT-E-01", "FACT-E-02", "FACT-E-04", "FACT-E-05", "FACT-G-02"],
    guardrail_passed: true,
    verified_numbers: [74, 156.57, 343.08, 24, 5560.45, 1188, 25, 2030, 90, 2050],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "quiz_feedback": {
    content: "Spot on telemetry review! Aston Martin Aramco abated 1,188 tCO₂e [FACT-E-05] purely through certified Sustainable Aviation Fuel deployments on flyaway routes. In F1 terms, that is equal to 88,153 laps around Silverstone Circuit [FACT-E-05]—proving that drop-in sustainable fuels deliver massive emissions reductions without altering track performance.",
    cited_fact_ids: ["FACT-E-05"],
    guardrail_passed: true,
    verified_numbers: [1188, 88153],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "share_caption": {
    content: "Trackside speed, zero emissions compromise: I just powered through AMF1's 1,188 tCO₂e SAF impact lap! 🏎️⚡ [FACT-E-05]",
    cited_fact_ids: ["FACT-E-05"],
    guardrail_passed: true,
    verified_numbers: [1188],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "linkedin_post": {
    content: "Data and technology are redefining what sustainable performance looks like in modern motorsport.\n\nAhead of the Singapore Grand Prix, Cognizant and Aston Martin Aramco Formula One Team are demonstrating how advanced analytics turn ESG ambition into verified impact. Through the integration of Sustainable Aviation Fuel certificates (SAFc), AMF1 has abated 1,188 tCO₂e across transcontinental logistics [FACT-E-05]—equivalent to 88,153 laps of Silverstone Circuit.\n\nSimultaneously, our joint commitment to social mobility has engaged over 300 students across 14 schools in immersive STEM workshops [FACT-C-01], building on two consecutive years of the Cognizant × AMF1 Global Gen-AI Ideathon [FACT-C-02].\n\nWhen high-performance engineering meets enterprise data leadership, tangible sustainability follows.\n\n#Cognizant #AstonMartinF1 #MakeAMark #Sustainability #DataScience #SingaporeGP",
    cited_fact_ids: ["FACT-E-05", "FACT-C-01", "FACT-C-02"],
    guardrail_passed: true,
    verified_numbers: [1188, 88153, 300, 14, 2],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "quarterly_brief": {
    content: "EXECUTIVE IMPACT BRIEF: AMF1 × COGNIZANT ESG PERFORMANCE\n\n1. OPERATIONAL DECARBONISATION\nDirect Scope 1 and 2 emissions decreased by 74% vs baseline [FACT-E-06], with campus solar roof installations driving a 23% emissions reduction [FACT-E-07]. Total Scope 1 stood at 156.57 tCO₂e [FACT-E-01] and market-based Scope 2 at 343.08 tCO₂e [FACT-E-02].\n\n2. VALUE CHAIN & LOGISTICS\nGlobal multi-modal freight generated 5,560.45 tCO₂e [FACT-E-04]. High-integrity SAF certificates abated 1,188 tCO₂e [FACT-E-05], supporting the team's validated SBTi 2030 target [FACT-G-02].\n\n3. SOCIAL & STEM PIPELINE\nMake A Mark Week welcomed 300+ students from 14 schools [FACT-C-01], while the Cognizant Gen-AI Ideathon marked its 2nd consecutive year [FACT-C-02]. Over £300,000 was raised for community initiatives [FACT-C-03].\n\n4. AUDIT & GOVERNANCE\nAMF1 maintains the highest FIA Three-Star Environmental Accreditation [FACT-G-01].",
    cited_fact_ids: ["FACT-E-06", "FACT-E-07", "FACT-E-01", "FACT-E-02", "FACT-E-04", "FACT-E-05", "FACT-G-02", "FACT-C-01", "FACT-C-02", "FACT-C-03", "FACT-G-01"],
    guardrail_passed: true,
    verified_numbers: [1, 74, 23, 156.57, 343.08, 2, 5560.45, 1188, 2030, 3, 300, 14, 300000, 4, 3],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "investor_summary": {
    content: "• SBTi-Validated Climate Trajectory: Independently audited commitment to achieve a 42% Scope 1/2 reduction and 25% Scope 3 reduction by 2030, advancing toward 90% net zero by 2050 [FACT-G-02].\n• Direct Decarbonisation: -74% progress in Scope 1 and 2 emissions from baseline [FACT-E-06], with 23% solar energy gains [FACT-E-07].\n• Freight Risk Abatement: 1,188 tCO₂e abated via SAF contracts [FACT-E-05], insulating against rising aviation carbon compliance costs.\n• Governance Excellence: FIA 3-Star Environmental Accreditation maintained [FACT-G-01], providing sponsor brand safety.",
    cited_fact_ids: ["FACT-G-02", "FACT-E-06", "FACT-E-07", "FACT-E-05", "FACT-G-01"],
    guardrail_passed: true,
    verified_numbers: [42, 25, 2030, 90, 2050, 74, 23, 1188, 3],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "scenario_explanation": {
    content: "Scenario Projections & Strategic Takeaways:\n\nExpanding Sustainable Aviation Fuel (SAF) to 50% across long-haul freight corridors directly abates critical Scope 3 logistics emissions [FACT-E-04]. Coupled with road freight biofuel conversion, this operational shift shields the team from escalating aviation fuel carbon surcharges while demonstrating tangible progress against SBTi near-term milestones [FACT-G-02].\n\nOn the human capital front, expanding joint STEM cohorts by 100% multiplies community reach beyond the baseline 300+ students [FACT-C-01], scaling diverse engineering mentorship [FACT-S-01] and providing Cognizant and AMF1 with a measurable social return on investment.",
    cited_fact_ids: ["FACT-E-04", "FACT-G-02", "FACT-C-01", "FACT-S-01"],
    guardrail_passed: true,
    verified_numbers: [50, 100, 300],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
  "community_story": {
    content: "Through the Make A Mark initiative, Aston Martin Aramco is breaking down systemic barriers in STEM. Building on 300+ students from 14 schools welcomed to campus [FACT-C-01] and £300,000 raised for community causes [FACT-C-03], our partner programmes deliver real career opportunities in high-performance technology.",
    cited_fact_ids: ["FACT-C-01", "FACT-C-03"],
    guardrail_passed: true,
    verified_numbers: [300, 14, 300000],
    unverified_numbers: [],
    cached: true,
    model: "gemini-1.5-flash",
    status: "verified",
  },
};

export function warmAiCache() {
  console.log("Warming AI response cache for offline demo mode...\n");
  let count = 0;

  for (const [key, data] of Object.entries(cacheFixtures)) {
    const filePath = path.join(cacheDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`[CACHE SAVED] ${key}.json`);
    count++;
  }

  console.log(`\nSuccessfully cached ${count} offline AI responses in data/ai-cache/`);
}

if (process.argv[1]?.includes("warm-cache")) {
  warmAiCache();
}
