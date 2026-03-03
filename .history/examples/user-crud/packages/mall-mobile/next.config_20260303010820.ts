import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@user-crud/types',
    '@ai-first/nextjs',
    '@ai-first/di',
    '@ai-first/core',
    '@ai-first/orm',
    '@ai-first/validation',
  ],
};

export default nextConfig;
