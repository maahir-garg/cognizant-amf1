import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The questionnaire, lap and credits flows were folded into the story at "/".
  async redirects() {
    return ["/start", "/lap", "/act"].map((source) => ({ source, destination: "/", permanent: true }));
  },
};

export default nextConfig;
