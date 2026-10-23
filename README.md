# Portafolio · Kener Avila

Portafolio bilingüe (ES/EN) hecho con [Next.js](https://nextjs.org) 16, Tailwind CSS v4 y [Velite](https://velite.js.org), desplegado en Vercel.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). `npm run dev` levanta Velite en modo watch junto con `next dev`, así que los cambios en `content/` se reflejan al guardar.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Velite (watch) + servidor de desarrollo de Next |
| `npm run build` | Valida y genera el contenido (`velite build --strict --clean`) y luego `next build` |
| `npm run content` | Solo valida y genera el contenido en `.velite/` |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |

## Contenido

Todo el contenido vive en `content/` y se valida con los esquemas de `velite.config.ts`. Si falta un campo, una traducción o una imagen, el build falla con el archivo y el campo. Los datos generados se importan desde `#site/content`.

El plan completo está en [`docs/PLAN.md`](docs/PLAN.md).
