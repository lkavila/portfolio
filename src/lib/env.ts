// Los campos reservados vacíos se ven como "pendiente" en dev y en los previews
// de Vercel, y se ocultan (o usan un fondo neutro) en producción. Se decide por
// VERCEL_ENV y no por la presencia de datos, para que la regla viva en un solo lugar.
export const showPending = process.env.VERCEL_ENV !== 'production'
