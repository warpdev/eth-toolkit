import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Include additional directories that should be linted
    dirs: ['app', 'components', 'lib', 'features', 'hooks', 'providers'],
  },
};

export default nextConfig;
