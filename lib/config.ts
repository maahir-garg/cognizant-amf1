export const SITE_CONFIG = {
  name: "Impact Lap",
  subtitle: "AMF1 × Cognizant Sustainability Impact Platform",
  event: "AMF1 × Cognizant Ideathon 2026",
  tagline: "Transforming Formula One ESG telemetry into verified, real-time fan and partner impact.",
  footerNotice: "Concept prototype: Team Growthbeans, AMF1 × Cognizant Ideathon 2026",
  heroRaceSlug: "singapore-gp",
  heroRaceName: "Singapore Grand Prix 2026",
  heroRaceDates: "9–11 Oct 2026",
  pillars: [
    {
      id: "Environment",
      name: "Environment",
      color: "#00FF87",
      description: "Science-led decarbonisation, sustainable aviation fuels, low-carbon freight, and campus energy efficiency.",
    },
    {
      id: "Belong",
      name: "Belong",
      color: "#00E5FF",
      description: "Fostering inclusive workplace culture, gender diversity pathways, employee wellbeing, and accessibility.",
    },
    {
      id: "Community",
      name: "Community",
      color: "#CEDC00",
      description: "STEM outreach, partner-powered education, local community engagement, and charitable support.",
    },
    {
      id: "Governance",
      name: "Governance",
      color: "#94A3B8",
      description: "Transparent ESG auditing, data integrity, science-based targets, and compliance leadership.",
    },
  ],
} as const;

export type PillarType = (typeof SITE_CONFIG.pillars)[number]["id"];
