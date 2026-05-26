/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // V Next.js 14 patří server externals pod experimental
  experimental: {
    serverComponentsExternalPackages: [
      '@react-pdf/renderer',
      '@react-pdf/font',
      '@react-pdf/layout',
      '@react-pdf/render',
      '@react-pdf/pdfkit',
      '@react-pdf/image',
      'fontkit',
      'pdfkit',
    ],
  },

  webpack: (config, { webpack, isServer }) => {
    if (!isServer) {
      // pptxgenjs interně používá node: prefix (node:fs, node:path…)
      // Webpack 5 v Next.js 14 toto nepodporuje – odstraníme prefix a přidáme fallbacky
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
      );

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        path:   false,
        os:     false,
        crypto: false,
        stream: false,
        buffer: false,
        util:   false,
        events: false,
        url:    false,
        zlib:   false,
      };

      // canvas není potřeba v browseru
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};

module.exports = nextConfig;
