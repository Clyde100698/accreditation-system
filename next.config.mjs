/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist', 'pdf-parse', 'canvas', 'tesseract.js'],
  },
};

export default nextConfig;
