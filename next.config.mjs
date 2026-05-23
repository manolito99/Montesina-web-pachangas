/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule && typeof rule === "object" && rule.test instanceof RegExp && rule.test.test(".svg"),
    );

    config.module.rules.push(
      fileLoaderRule
        ? {
            ...fileLoaderRule,
            test: /\.svg$/i,
            resourceQuery: /url/,
          }
        : {},
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: [/url/] },
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false, cleanupIds: false } },
                  },
                ],
              },
              titleProp: true,
              ref: true,
            },
          },
        ],
      },
    );

    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
