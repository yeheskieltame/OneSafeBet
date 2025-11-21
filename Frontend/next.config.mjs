/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude problematic server packages from bundling
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  // Configure webpack to handle node modules properly
  webpack: (config, { webpack }) => {
    // Use IgnorePlugin to exclude test directories from resolution
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/(test|tests|__tests__|fixtures|benchmark)\//,
        contextRegExp: /node_modules/,
      })
    );

    // Ignore test files from node_modules
    config.module.rules.push({
      test: /node_modules\/.*\.(test|spec)\.(js|mjs|ts|tsx)$/,
      use: 'ignore-loader'
    });

    // Exclude test and non-source files from being processed
    config.module.rules.push({
      test: /node_modules\/.*\/(test|tests|__tests__|fixtures|benchmark)\//,
      use: 'ignore-loader'
    });

    // Handle pino/thread-stream which causes issues in browser builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      'pino-pretty': false,
      // Optional wallet connectors that may not be installed
      '@gemini-wallet/core': false,
      'porto': false,
      // React Native dependencies not needed in browser
      '@react-native-async-storage/async-storage': false,
    };

    // Ignore specific problematic files
    config.resolve.alias = {
      ...config.resolve.alias,
      'thread-stream': false,
      '@gemini-wallet/core': false,
      'porto': false,
      '@react-native-async-storage/async-storage': false,
    };

    return config;
  },
}

export default nextConfig
