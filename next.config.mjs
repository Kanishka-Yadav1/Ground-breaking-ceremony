/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // onnxruntime-web references some Node built-ins that don't exist in the
    // browser. We only ever run background removal client-side, so we can
    // safely stub these out to avoid "module not found" errors during build.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
