
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "snk-backend-ten.vercel.app",
      "snk-prop.s3.eu-north-1.amazonaws.com",
      "example.com",
    ],
  },
  // Configure for proper client-side routing
  trailingSlash: false,
  // Ensure proper handling of API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://snk-backend-ten.vercel.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
