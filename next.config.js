/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Override @/ alias to project root (NOT src/)
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
