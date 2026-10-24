// URL pública del sitio para canonical y hreflang. En Vercel sale del dominio
// de producción del proyecto (D12: *.vercel.app hasta comprar el dominio).
export const siteUrl = new URL(
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'
)
