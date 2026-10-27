import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Eng D3: sin Content-Security-Policy (los nonces romperían las páginas
// estáticas). Se conservan las demás protecciones aprobadas en CEO D9;
// X-Frame-Options reemplaza a frame-ancestors para impedir embeber el sitio.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
