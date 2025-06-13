
import type {NextConfig} from 'next';

// IMPORTANT: Change 'howsplit' to your actual GitHub repository name if it's different.
const repoName = 'HowSplit';

const nextConfig: NextConfig = {
  output: 'export', // Enables static HTML export
  basePath: `/${repoName}`, // Serves the app from /<repoName> on GitHub Pages
  trailingSlash: true, // Recommended for static hosts for consistent URL handling
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Necessary for static export as next/image optimization needs a server
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
