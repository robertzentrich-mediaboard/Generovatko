/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // @react-pdf/renderer a závislosti ponechat jako Node.js externals –
  // nesmí se bundlovat s browser podmínkami (jinak chybí renderToBuffer, fontkit.open atd.)
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@react-pdf/font',
    '@react-pdf/layout',
    '@react-pdf/render',
    '@react-pdf/pdfkit',
    '@react-pdf/image',
    'fontkit',
    'pdfkit',
  ],

  // Pro client bundle – canvas není potřeba
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};

module.exports = nextConfig;
