import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: "https://pixel-classes.onrender.com/api/:path*",
        },
        {
          source: "/ws/:path*",
          destination: "https://pixel-classes.onrender.com/ws/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
