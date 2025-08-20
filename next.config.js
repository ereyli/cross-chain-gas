/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      aws4: false,
      'aws-sdk': false,
      '@aws-sdk/client-lambda': false,
      'aws-sdk/clients/lambda': false,
    };
    
    // Exclude AWS SDK from client bundle
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'aws-sdk': 'aws-sdk',
        '@aws-sdk/client-lambda': '@aws-sdk/client-lambda',
      });
    }
    
    return config;
  },
  experimental: {
    webpackBuildWorker: true,
  },
}

module.exports = nextConfig
