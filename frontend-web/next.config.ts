import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
  },
};

export default nextConfig;
