/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ETHERSCAN_KEY: process.env.ETHERSCAN_KEY, // Expose environment variable
  },
};

export default nextConfig;
