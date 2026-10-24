import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // 404 para rutas sin idioma válido: el layout raíz vive en [locale].
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Solo se optimizan las imágenes que publica Velite (D8: validadas en el build).
    localPatterns: [{ pathname: "/static/**", search: "" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
