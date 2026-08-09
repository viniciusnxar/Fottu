/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // TODO: troque pelo host do seu bucket (Cloudflare R2 / S3)
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.amazonaws.com" }
    ]
  }
};

module.exports = nextConfig;
