const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-slider",
      "react-select",
      "@supabase/supabase-js",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Minimize output by excluding source maps in production
  productionBrowserSourceMaps: false,

  webpack(config, { isServer }) {
    // Tree-shake mapbox-gl CSS import on the server
    if (isServer) {
      config.resolve.alias["mapbox-gl/dist/mapbox-gl.css"] = false;
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
