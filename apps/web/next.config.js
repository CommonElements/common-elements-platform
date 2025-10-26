/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/database', '@repo/auth', '@repo/validations'],
  images: {
    // Configure image optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Add Supabase storage domain for remote images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // External packages for server components
  serverExternalPackages: ['@supabase/ssr'],

  // Experimental features for better performance
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
  },

  // Headers for additional security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for common patterns
  async redirects() {
    return [
      // Add any necessary redirects here
    ]
  },
}

module.exports = nextConfig
