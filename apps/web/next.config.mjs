/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.output = {
      ...config.output,
      hashFunction: 'xxhash64',
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["@repo/ui"],
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/dashboard/dubbing", destination: "/dashboard", permanent: false },
      { source: "/dashboard/dubbing/new", destination: "/dashboard", permanent: false },
      { source: "/dashboard/dubbing/:id", destination: "/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
