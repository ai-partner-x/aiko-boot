import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@scaffold/api',
    '@ai-partner-x/aiko-boot-starter-web',
    '@ai-partner-x/aiko-boot',
  ],
};

export default nextConfig;
