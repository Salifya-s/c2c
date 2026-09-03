import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Landing page photography. The Image components using this host pass
    // `unoptimized`, because Next's optimizer runs server-side and the app
    // server cannot always reach the upstream host; the browser fetches them
    // directly instead. Drop both once imagery is served from public/ or a
    // first-party CDN.
    remotePatterns: [{protocol: 'https', hostname: 'images.unsplash.com'}]
  }
};

export default nextConfig;
