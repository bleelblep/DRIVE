import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',

  // GitHub Pages uses a project subdirectory
  // Update this with your repo name if deploying to https://username.github.io/repo-name
  // Leave empty string for https://username.github.io
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Optional: Uncomment if you want trailing slashes
  // trailingSlash: true,
};

export default nextConfig;
