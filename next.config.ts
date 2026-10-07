import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The questionnaire, lap and credits flows were folded into the story at "/".
  // The desk's ROI tab became Measures when costing was dropped from the prototype.
  async redirects() {
    return [
      ...["/start", "/lap", "/act"].map((source) => ({ source, destination: "/", permanent: true })),
      { source: "/partners/roi", destination: "/partners/measures", permanent: true },
    ];
  },
};

export default nextConfig;
