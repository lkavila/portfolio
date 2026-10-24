# Plan: Portafolio Kener Avila (Next.js + Tailwind, Vercel)

Fuente: design doc aprobado `C:\Users\Usuario\.gstack\projects\portafolio\Usuario-no-branch-design-20261022-190042.md` (Status: APPROVED, 2026-10-22).
Revisión: /plan-ceo-review · Modo: SCOPE REDUCTION · Profundidad: implementation-ready.
Mockup de estilo: `docs/design/style-board.html` (opción "C · Narrativa inmersiva").

## Decision ledger

| ID and owner | Contract and evidence | Current | Proposed | Status | Exact approval and scope |
|---|---|---|---|---|---|
| D1 · office-hours Phase 4 | Enfoque de implementación (design doc, Recommended Approach) | B: base tipada por fases (Next SSG + Tailwind v4 + Motion + MDX/Zod + next-intl) | — | approved | Usuario eligió "B) Base tipada por fases (recommended)" |
| D2 · office-hours Visual | Dirección visual (style-board) | Narrativa inmersiva en todo el sitio, 4 secciones con barra fija, apellido "Avila", campos reservados para GitHub/imágenes | — | approved | Usuario: "Me gusta mas la opcion C… Narrativa inmersiva" + mejoras; design doc aprobado después |
| D3 · CEO 0E | Modo de revisión | SCOPE REDUCTION | — | approved | Usuario eligió "SCOPE REDUCTION (recommended)" |
| R-P2 · CEO 0G | Fase 2: efectos inmersivos avanzados (columna fija con progreso, medios que escalan, aurora animada) | Diferida a TODOS.md; la fase 1 sale con reveals sutiles y hero con gradiente estático | — | deferred | D4: usuario eligió "A) Diferir a TODOS.md (recommended)" |
| R-P3 · CEO 0G | Fase 3: chat IA con controles mínimos y política de respuestas | Diferida a TODOS.md con controles y política conservados; fase 1 sin backend | — | deferred | D5: usuario eligió "A) Diferir a TODOS.md (recommended)" |
| R-CV · CEO 0G | CV en PDF generado desde los datos (ES/EN) | Diferida a TODOS.md; la fase 1 publica los PDFs actuales ES/EN tras revisar datos de contacto | — | deferred | D6: usuario eligió "A) Diferir generación (recommended)" |

## Answered: D4 (R-P2)
Fase 2 (efectos inmersivos avanzados) diferida a TODOS.md. Respuesta: "A) Diferir a TODOS.md (recommended)".

## Answered: D5 (R-P3)
Fase 3 (chat IA) diferida a TODOS.md, con controles mínimos y política de respuestas conservados. Respuesta: "A) Diferir a TODOS.md (recommended)".

## Answered: D6 (R-CV)
Generación del CV diferida a TODOS.md; la fase 1 publica los PDFs actuales ES/EN. Respuesta: "A) Diferir generación (recommended)".

## Alcance aceptado (fase 1)
- Next.js App Router, todas las páginas pre-generadas (SSG con `generateStaticParams`), Tailwind v4, Motion solo donde CSS no alcance. Deploy normal en Vercel (sin `output: 'export'`, para conservar `next/image`).
- Contenido en MDX + frontmatter validado con Zod; una variante `es` y `en` por ítem; el build falla si falta una.
- next-intl con rutas `/es` y `/en`.
- Una página por idioma con hero (nombre "Kener Avila", rol "Full-Stack Developer & AI Engineer", botones CV/GitHub/LinkedIn) y 4 secciones en orden: Experiencia profesional, Proyectos personales y académicos, Estudios, Certificaciones.
- Barra de secciones fija con scroll suave, sección activa resaltada, anclas compartibles, deslizable en móvil y usable con teclado.
- Proyectos: tarjetas + filtro Todos/Personales/Académicos + página de caso de estudio `/[locale]/proyectos/[slug]`.
- Certificaciones agrupadas por emisor con enlace de verificación o archivo con datos tapados.
- Campos reservados `images[]`, `github`, `demo`, `verifyUrl`: "pendiente" en dev/preview, fondo neutro u oculto en producción, lista de pendientes en el build.
- Reveals sutiles al hacer scroll que respetan `prefers-reduced-motion` y no ocultan contenido sin JS. Hero con gradiente estático.
- CV: PDFs actuales en `public/cv/kener-avila-es.pdf` y `public/cv/kener-avila-en.pdf`.
- Sin backend: ninguna ruta de API en la fase 1 (D5).

## Section 1: Architecture Review

```
  GitHub main ──push──> Vercel build (next build) ──> CDN (HTML estático + next/image)
                               │
   content/                    v
   ├─ experience/*.{es,en}.mdx ─┐
   ├─ projects/*.{es,en}.mdx  ──┼─> content layer (Zod) ──> colecciones tipadas ──┐
   ├─ education/*.{es,en}.mdx ──┤        │ falla el build si:                       │
   └─ certifications/*.{es,en}.mdx       │  - frontmatter inválido                  │
   messages/{es,en}.json ─> next-intl    │  - falta variante es/en                  │
   public/images/**, public/cv/*.pdf     v                                         v
                                 lista de "pendientes" (log)     app/[locale]/page.tsx
                                                                 ├─ Hero (server)
   middleware.ts ── solo resuelve "/" ──> /es | /en              ├─ SectionNav (client: scrollspy)
                                                                 ├─ ExperienceSection (server)
                                                                 ├─ ProjectsSection (server) + ProjectFilter (client)
                                                                 ├─ StudiesTimeline (server)
                                                                 ├─ CertificationsSection (server)
                                                                 └─ Reveal (client: IntersectionObserver)
                                                                 app/[locale]/proyectos/[slug]/page.tsx
```

- Límites: todo es server component salvo 3 islas de cliente (SectionNav, ProjectFilter, Reveal). El contenido solo se lee en build.
- Acoplamiento nuevo: componentes de sección dependen de los tipos del content layer. Justificado: es la "fuente única" (premisa 2).
- Escala: estático en CDN; a 10x o 100x de tráfico no cambia nada. Lo primero que se agotaría es la cuota de optimización de imágenes de Hobby, lejana para un portafolio.
- Puntos únicos de falla: Vercel y GitHub. Aceptable.
- Seguridad: no hay endpoints ni mutaciones. La única lógica en runtime es el middleware de idioma, que solo lee `Accept-Language` y la cookie de idioma.
- Rollback: "Instant Rollback" de Vercel al deploy anterior, ~1 minuto.
- Estados: el filtro de proyectos (Todos ↔ Personales ↔ Académicos; un botón solo aparece si su tipo tiene ≥1 proyecto) y la sección activa de la barra (la que cruza el centro del viewport; al cargar con ancla, esa sección).
- Sección vacía: si una colección no tiene ítems, la sección y su enlace en la barra no se renderizan (consecuencia de "ningún pendiente llega a producción").
- Anclas por idioma: `es` usa `#experiencia #proyectos #estudios #certificaciones`, `en` usa `#experience #projects #education #certifications`. El selector de idioma conserva la sección actual traduciendo el ancla.
- Hallazgo: el comportamiento de `/` y el idioma por defecto no están definidos (spec review R2-14). Ver R-LOC.

## currentDecision (R-LOC)
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B | C |
|---|---|---|---|---|---|
| Qué ve quien entra a `/` | pendiente (R2-14) | sin definir | idioma del navegador (es si empieza por "es", si no en) | siempre /es | siempre /en |
| Recordar elección manual de idioma | pendiente | sin definir | cookie de next-intl | cookie | cookie |
| `hreflang` + `x-default` en cada página | requerido para SEO bilingüe | sin definir | sí, x-default → /en | sí, x-default → /es | sí, x-default → /en |
| Rutas `/es` y `/en` | D1 | aprobado | sin cambio | sin cambio | sin cambio |

Question: D7 — R-LOC: ¿A qué idioma manda la portada `/`?
Project/branch/task: portafolio Next.js, revisión de la fase 1 (sin git todavía).
ELI10: Cuando alguien abre tudominio.com sin /es ni /en, hay que decidir qué idioma ve. Lo más amable es usar el idioma de su navegador: un reclutador en Madrid ve español y uno en Berlín ve inglés. Si cambia el idioma a mano, se recuerda.
Stakes if we pick wrong: un reclutador internacional que cae en español (o uno local en inglés) puede irse antes de encontrar el botón de idioma.
Recommendation: A porque cada visitante ve su idioma sin hacer nada y el inglés queda como respaldo para el público internacional al que apunta tu Linguaskill.
Completeness: A=9/10, B=6/10, C=6/10
Net: experiencia automática por visitante vs. un idioma fijo más simple de predecir.
Header: Idioma /
A) Idioma del navegador (recommended)
El middleware lee `Accept-Language`: si empieza por "es" manda a /es, si no a /en; recuerda la elección manual con cookie y cada página publica `hreflang` con `x-default` en /en. Esfuerzo S, riesgo low, verificación: tests e2e con encabezados es-CO, en-US y de-DE. ✅ Cada reclutador ve su idioma sin buscar el botón ✅ Google indexa bien ambas versiones con hreflang ❌ Un poco de lógica en el middleware que hay que probar con varios idiomas
B) Siempre español
`/` redirige a /es y la elección manual se recuerda con cookie. Esfuerzo S, riesgo low, verificación: test e2e de la redirección. ✅ Comportamiento totalmente predecible ✅ Ideal si buscas sobre todo empleo local o en LATAM ❌ Reclutadores internacionales caen en un idioma que no leen
C) Siempre inglés
`/` redirige a /en y la elección manual se recuerda con cookie. Esfuerzo S, riesgo low, verificación: test e2e de la redirección. ✅ Comportamiento predecible y orientado a empleo remoto internacional ✅ Refuerza tu certificado de inglés ❌ Reclutadores locales ven primero un idioma que no esperan

## Answered: D7 (R-LOC)
| R-LOC · CEO S1 | Comportamiento de `/`, idioma por defecto, hreflang | Idioma del navegador: "es*" → /es, otro → /en; cookie recuerda elección manual; hreflang + x-default → /en | — | approved | D7: usuario eligió "A) Idioma del navegador (recommended)" |

## Section 2: Error & Rescue Map

Casi todo falla en build (bueno: el sitio anterior sigue en línea) y casi nada en runtime.

```
  CODEPATH                         | QUÉ PUEDE FALLAR                           | CLASE
  ---------------------------------|--------------------------------------------|------------------------
  content layer: parse frontmatter | campo faltante / tipo inválido / fecha mala | ZodError
  content layer: pares es/en       | falta variante de un ítem                   | MissingLocaleError (propio)
  content layer: slugs             | dos proyectos con el mismo slug             | DuplicateSlugError (propio)
  content layer: rutas de imagen   | `images[]` apunta a archivo inexistente     | (ninguna hoy) ← GAP
  MDX compile                      | sintaxis MDX rota                           | MDX compile error
  next-intl messages               | clave faltante en es.json o en.json         | MISSING_MESSAGE
  middleware `/`                   | Accept-Language vacío o raro                | (no lanza; cae a /en)
  /[locale]/proyectos/[slug]       | slug inexistente                            | notFound() → 404
  /[locale] con locale inválido    | /fr, /xx                                    | notFound() → 404
  next/image en runtime            | cuota de optimización de Hobby agotada      | 402/fallo de optimización

  CLASE                 | ¿RESCATADA? | ACCIÓN                                   | USUARIO VE
  ----------------------|-------------|------------------------------------------|--------------------------
  ZodError              | S (build)   | falla el build con archivo + campo       | sitio anterior sigue
  MissingLocaleError    | S (build)   | falla el build con el ítem y el idioma   | sitio anterior sigue
  DuplicateSlugError    | S (build)   | falla el build con ambos archivos        | sitio anterior sigue
  imagen inexistente    | N ← GAP     | —                                        | imagen rota en producción ← MAL
  MDX compile error     | S (build)   | falla el build con línea                 | sitio anterior sigue
  MISSING_MESSAGE       | S (build)   | test que compara claves es/en            | sitio anterior sigue
  Accept-Language raro  | S           | fallback a /en                           | versión en inglés
  slug/locale inválido  | S           | 404 propio, con enlace al inicio         | página 404 bilingüe
  cuota de imágenes     | parcial     | imágenes pre-optimizadas (AVIF/WebP) y pocas | imagen sin optimizar
```

- GAP: un `images[]` o un `verifyUrl`/`github` mal escrito pasa el build y se ve roto en producción. Ver R-REF.
- Consecuencia del 404 propio: `app/[locale]/not-found.tsx` bilingüe con enlace al inicio. Lo exige el criterio "ningún pendiente/roto llega a producción".

## Answered: D8 (R-REF)
| R-REF · CEO S2 | Imágenes y enlaces rotos | El build falla si una imagen local de `images[]` no existe o si `github`/`demo`/`verifyUrl` no es una URL válida; no se revisa que las URLs externas respondan | — | approved | D8: usuario eligió "B) Solo validar en build" |

Riesgo aceptado (D8): un enlace externo que se rompa después del deploy (repo renombrado, certificado movido) no se detecta automáticamente.

## Section 3: Security & Threat Model

| Amenaza | Prob. | Impacto | ¿Mitigada? |
|---|---|---|---|
| Superficie nueva de API | — | — | No hay: fase 1 sin rutas de API (D5). El middleware solo lee `Accept-Language` y la cookie de idioma. |
| XSS vía contenido MDX | Low | Med | Sí: el MDX lo escribe solo Kener en el repo (fuente confiable); no hay entrada de usuarios. |
| Datos personales en certificados | Med | High | Sí: enlaces de verificación del emisor o archivos con IDs tapados, originales fuera del repo (design doc, R1-7). |
| Datos personales en el CV público | Med | Med | Parcial: Kener revisa qué contacto muestra su PDF antes de publicarlo (D6). Recomendado: sin dirección ni documento de identidad. |
| Email expuesto a bots de spam | High | Low | Aceptado: es un portafolio y el email debe ser fácil de usar. |
| Enlaces externos con `target="_blank"` | Low | Low | Sí: siempre `rel="noopener noreferrer"`. |
| Dependencias npm comprometidas | Low | High | Parcial: lockfile versionado y pocas dependencias (next, react, next-intl, content layer, motion, tailwind). |
| Clickjacking o inyección de scripts de terceros | Low | Med | No hay encabezados de seguridad definidos. Ver R-SEC. |
| Secretos | — | — | No hay secretos en la fase 1. |

## Answered: D9 (R-SEC)
| R-SEC · CEO S3 | Encabezados de seguridad | CSP estricta (mismo origen + lo que Vercel necesite), `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff` en `next.config`; verificado con test e2e de encabezados y consola sin errores CSP en preview | — | approved | D9: usuario eligió "A) Agregar encabezados (recommended)" |

## Section 4: Data Flow & Interaction Edge Cases

```
  INPUT (archivo MDX) -> VALIDACIÓN (Zod + pares es/en + imagen existe + URL válida) -> TRANSFORM (MDX→HTML, orden por fecha)
        -> PERSIST (HTML estático en el build) -> OUTPUT (página /es o /en)
  Sombras:
   - nil (campo opcional vacío)  -> "pendiente" en dev/preview; fondo neutro u oculto en producción
   - vacío (colección sin ítems) -> la sección y su enlace en la barra no se renderizan
   - tipo malo / fecha inválida  -> ZodError, falla el build con archivo y campo
   - texto muy largo             -> el título se ajusta en varias líneas; la descripción de tarjeta se corta a 3 líneas con el texto completo en el caso de estudio
   - duplicado (mismo slug)      -> DuplicateSlugError, falla el build
   - imagen/URL rota             -> falla el build (D8); URL externa que muere después: riesgo aceptado (D8)
   - encoding (tildes, ñ)        -> UTF-8 en todo; slugs en ASCII sin tildes
```

No hay estado mutable compartido entre operaciones asíncronas: el contenido es de solo lectura en build y las islas de cliente solo guardan estado de UI local. No aplica análisis de orden asíncrono.

| INTERACCIÓN | CASO BORDE | ¿MANEJADO? | CÓMO |
|---|---|---|---|
| Clic en la barra | doble clic | Sí | scroll idempotente al mismo destino |
| Clic en la barra | clic durante otro scroll suave | Sí | el último destino gana |
| Clic en la barra | botón atrás del navegador | Sí | el clic agrega el ancla al historial (comportamiento nativo); el scroll manual no toca la URL |
| Abrir enlace con ancla | `/es#certificaciones` | Sí | aterriza en la sección con `scroll-margin-top` para no quedar tapada por la barra |
| Barra en móvil | más enlaces que ancho | Sí | deslizable en horizontal; el enlace activo se desplaza a la vista |
| Filtro de proyectos | tipo sin proyectos | Sí | ese botón no se renderiza |
| Filtro de proyectos | volver desde un caso de estudio | Sí | el filtro vive en `?filtro=` (con `replaceState`) y se restaura al volver |
| Cambio de idioma | estando a mitad de página | Sí | conserva la sección traduciendo el ancla (R-LOC) |
| JS desactivado | barra, filtro, reveals | Sí | anclas nativas funcionan, se ven todos los proyectos sin filtro, contenido visible desde el HTML |
| Conexión lenta | imágenes pesadas | Sí | `next/image` con tamaños responsivos, carga diferida bajo el pliegue y placeholder difuminado |
| Muchos certificados (ej. 20+ de Udemy) | lista larga | Pendiente | dueño: /plan-design-review (¿mostrar N por emisor + "Ver todos"?). No bloquea: sin decidir, se muestran todos |
| Slug o idioma inexistente | `/es/proyectos/xyz`, `/fr` | Sí | 404 bilingüe propio con enlace al inicio |

## Section 5: Code Quality Review

- Organización propuesta: `content/` (datos), `src/content/schema.ts` (esquemas Zod en un solo lugar), `src/components/sections/*` (una por sección), `src/components/ui/*` (Slot, Tag, LinkButton), `src/i18n/*`, `messages/{es,en}.json`.
- Un solo componente `Section` envuelve id del ancla, título y `Reveal`, para no repetir la misma estructura 4 veces.
- Un solo componente `Media` decide entre imagen real, recuadro "pendiente" (dev/preview) o fondo con iniciales (producción). La regla de pendientes vive en un solo lugar.
- La detección de entorno para "pendiente" usa `VERCEL_ENV` (`production` vs `preview`/`development`), no la presencia de datos.
- Sobre-ingeniería a evitar: nada de CMS, base de datos ni abstracción de "proveedor de contenido". Motion no se instala en la fase 1 porque los reveals se hacen con CSS + IntersectionObserver (el design doc lo permite: "Motion solo donde CSS no alcance").
- Sin hallazgos que requieran decisión.

## Section 6: Test Review

```
  QUÉ ES NUEVO                         | TIPO        | FELIZ                         | FALLA                                   | BORDE
  -------------------------------------|-------------|-------------------------------|-----------------------------------------|------------------------------
  Esquema de contenido                 | Unit        | fixture válido carga          | campo faltante → ZodError con ruta      | campos opcionales vacíos
  Pares es/en                          | Unit        | ítem con ambas variantes      | falta en → MissingLocaleError           | —
  Slugs                                | Unit        | slugs únicos                  | duplicado → DuplicateSlugError          | slug con tilde rechazado
  Imagen existe / URL válida (D8)      | Unit        | ruta existente                | ruta inexistente / URL mala → error     | `images[]` vacío permitido
  Paridad de claves i18n               | Unit        | mismas claves en es y en      | clave faltante → test falla             | —
  Middleware `/` (D7)                  | E2E         | es-CO → /es, en-US → /en      | de-DE → /en, encabezado vacío → /en     | cookie es gana sobre en-US
  Barra de secciones                   | E2E         | clic lleva a la sección       | —                                       | ancla directa, teclado (Tab+Enter)
  Sección activa                       | E2E         | al bajar se marca la correcta | —                                       | última sección al final de la página
  Filtro de proyectos                  | E2E         | Académicos muestra solo esos  | —                                       | volver restaura `?filtro=`
  Sin JS                               | E2E         | todo el texto visible         | —                                       | anclas funcionan
  Reduced motion                       | E2E         | sin transiciones              | —                                       | —
  404                                  | E2E         | slug malo → 404 bilingüe      | `/fr` → 404                             | —
  Encabezados de seguridad (D9)        | E2E         | CSP, frame-ancestors, etc.    | consola sin errores CSP                 | —
  CV                                   | E2E         | /cv/*-es.pdf y *-en.pdf → 200 | —                                       | content-type application/pdf
  Sin "pendiente" en producción        | E2E (prod)  | build con VERCEL_ENV=production no contiene "pendiente" | —             | ítem sin imagen usa iniciales
  Lighthouse 95+ móvil                 | Lighthouse  | 4 categorías ≥ 95 en /es y /en | bajada → falla                         | página de caso de estudio
```

- La prueba que da confianza un viernes a las 2 a. m.: el E2E sin JS + el chequeo de "sin pendiente en producción". El de un QA hostil: un ítem con slug duplicado, imagen inexistente y traducción faltante a la vez, que debe fallar con los 3 errores listados. El de caos: `Accept-Language` basura y cookie inválida, que deben caer a /en.
- Pirámide: unit para todas las reglas de contenido (rápidas), E2E solo para comportamiento en navegador, Lighthouse aparte.
- Riesgo de flakiness: Lighthouse varía entre corridas; usar 3 corridas y la mediana.
- Herramientas: Vitest (unit), Playwright (E2E), Lighthouse CI. Dónde se ejecutan: ver R-CI.

## Answered: D10 (R-CI)
| R-CI · CEO S6 | Dónde corren tests y Lighthouse | GitHub Actions en cada PR y push a main: build + Vitest + Playwright + Lighthouse CI (mediana de 3); check requerido para merge (protección de rama en main) | — | approved | D10: usuario eligió "A) GitHub Actions (recommended)" |

## Section 7: Performance Review

Presupuesto derivado del criterio aprobado "Lighthouse 95+ móvil" (no agrega alcance):
- Sin base de datos, sin consultas, sin N+1, sin pool de conexiones.
- JS de primera carga: solo las 3 islas de cliente; reveals con CSS + IntersectionObserver, sin Motion.
- Fuentes con `next/font` (autohospedadas, `display: swap`).
- Imágenes con `next/image`: AVIF/WebP, `sizes` responsivos, carga diferida bajo el pliegue, `priority` solo en la primera imagen visible. Originales de máximo ~2000 px de ancho en el repo.
- Ningún elemento LCP (el título del hero) se anima desde opacidad 0. Los reveals solo se aplican cuando JS ya cargó (clase `js` en `<html>`), así el HTML sin JS se ve completo.
- Rutas más lentas: la página de idioma con todas las imágenes de proyectos (mitigado con carga diferida), el caso de estudio con galería, y el middleware de `/` (~ms, en el edge).
- Sin hallazgos que requieran decisión.

## Section 8: Observability & Debuggability

- Build: el content layer imprime la lista de campos pendientes por ítem, y los errores de contenido dicen archivo y campo.
- Deploy: Vercel notifica por email si un deploy falla y CI muestra qué test se rompió (D10).
- Runtime: no hay servidor propio que loguear; el middleware no registra datos personales.
- Runbook: deploy roto → "Instant Rollback" en Vercel; build rojo → leer el error del content layer (archivo + campo).
- Brecha: hoy no hay forma de saber si llegan visitas, desde dónde ni si alguien descarga el CV, que es justo la métrica de éxito del portafolio. Ver R-OBS.

## Answered: D11 (R-OBS)
| R-OBS · CEO S8 | Analíticas | Vercel Web Analytics + Speed Insights, sin cookies; CSP los permite; eventos personalizados solo si Hobby los incluye | — | approved | D11: usuario eligió "A) Vercel Analytics (recommended)" |

## Section 9: Deployment & Rollout

```
  1. git init + .gitignore (sin originales de certificados)   2. crear repo en GitHub (público)
  3. importar en Vercel (Hobby)                                4. protección de rama main: PR + CI verde (D10)
  5. cada PR → preview con "pendiente" visible                 6. merge a main → producción sin "pendiente"
```
- Sin migraciones ni base de datos. Sin feature flags: el sitio es estático y el rollback es inmediato.
- Riesgo de ventana de deploy: ninguno; Vercel cambia de versión de forma atómica.
- Rollback: Vercel → Deployments → deploy anterior → "Instant Rollback" (~1 minuto). Alternativa: revertir el commit en main.
- Verificación post-deploy (primeros 5 minutos): abrir `/` con el navegador en español y en inglés, saltar a cada sección desde la barra, descargar los dos CV, abrir un caso de estudio, confirmar que no aparece "pendiente" y que la visita llega a Analytics.
- Dominio: abierto en el design doc. Ver R-DOM.

## currentDecision (R-DOM)
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B |
|---|---|---|---|---|
| Dirección pública | Open Questions | sin definir | `kener-avila.vercel.app` al inicio, dominio propio en TODOS.md | dominio propio desde el primer deploy |
| Costo | — | $0 | $0 ahora | ~$10-15/año |
| Canonical + hreflang (D7) | approved | — | apuntan al dominio vigente; se actualizan al migrar | apuntan al dominio propio |

Question: D12 — R-DOM: ¿Con qué dirección sale el portafolio?
Project/branch/task: portafolio Next.js, revisión de la fase 1 (sin git todavía).
ELI10: Vercel te da gratis una dirección tipo kener-avila.vercel.app. Un dominio propio (keneravila.dev o similar) cuesta unos $10-15 al año y se ve más profesional en el CV y LinkedIn. Puedes empezar gratis y cambiar después; la dirección .vercel.app sigue funcionando.
Stakes if we pick wrong: si pones la dirección .vercel.app en tu CV y luego cambias, los PDFs ya enviados tendrán la dirección vieja (sigue funcionando, pero se ve menos pulida).
Recommendation: A porque no bloquea el primer deploy y puedes comprar el dominio cuando el contenido esté listo, antes de enviar CVs con la dirección.
Note: options differ in kind, not coverage — no completeness score.
Net: empezar gratis y decidir el nombre con calma vs. dirección definitiva desde el día uno.
Header: Dominio
A) vercel.app primero (recommended)
La fase 1 sale en `*.vercel.app` y la compra del dominio queda en TODOS.md, para hacerla antes de poner la dirección en tu CV. Esfuerzo S, riesgo low, verificación: el sitio responde en la dirección de Vercel. ✅ Cero costo y nada que esperar para el primer deploy ✅ Eliges el nombre del dominio con calma ❌ Si envías CVs con la dirección .vercel.app, quedan con la dirección vieja
B) Dominio propio ya
Compras el dominio ahora y se conecta a Vercel en el primer deploy. Esfuerzo S, riesgo low, verificación: el dominio resuelve con HTTPS. ✅ Dirección definitiva y profesional desde el primer día ✅ Todos los CV y perfiles llevan la URL final ❌ Pagas antes de tener el contenido listo

## Answered: D12 (R-DOM)
| R-DOM · CEO S9 | Dirección pública | Fase 1 en `*.vercel.app`; compra de dominio en TODOS.md (P1, antes de poner la URL en CVs) | — | deferred | D12: usuario eligió "A) vercel.app primero (recommended)" |

## Section 10: Long-Term Trajectory

- Deuda aceptada: CV hecho a mano (D6), sin monitoreo de enlaces externos (D8), dominio pendiente (D12). Las tres están registradas.
- Dependencia de ruta: la elección del content layer (Velite o content-collections) define cómo se leen los datos en la fase 3 (chat). Dueño: /plan-eng-review. Cualquiera de los dos expone colecciones tipadas, así que el chat solo necesita serializarlas a texto.
- Reversibilidad: 4/5. Todo es estático y versionado; lo único con algo de inercia es la estructura de los archivos de contenido.
- La pregunta a 1 año: un ingeniero nuevo agrega un proyecto creando `content/projects/<slug>.es.mdx` y `.en.mdx`; si se equivoca, el build le dice archivo y campo. Es obvio.
- Plataforma: las colecciones tipadas sirven después para el chat (fase 3), el CV generado y las imágenes OG por proyecto, sin migrar nada.

## Section 11: Design & UX Review

Arquitectura de información: hero (nombre, rol, CV/GitHub/LinkedIn) → barra → Experiencia profesional → Proyectos → Estudios → Certificaciones → pie (email, LinkedIn, GitHub; sin formulario porque la fase 1 no tiene backend, D5).

```
  [ / ] --Accept-Language--> [ /es | /en ] --hero--> [barra fija]
                                               |--clic--> #experiencia | #proyectos | #estudios | #certificaciones
                                               |--scroll--> sección activa cambia en la barra
  [ #proyectos ] --filtro--> Todos <-> Personales <-> Académicos  (?filtro=)
  [ tarjeta ] --clic--> /[locale]/proyectos/[slug] --atrás--> #proyectos con filtro restaurado
  [ cualquier página ] --selector de idioma--> misma sección en el otro idioma
  [ slug/idioma inválido ] --> 404 bilingüe --> inicio
```

| FEATURE | LOADING | EMPTY | ERROR | SUCCESS | PARTIAL |
|---|---|---|---|---|---|
| Página por idioma | HTML estático, sin spinner | sección sin ítems no se renderiza | 404 bilingüe | 4 secciones | ítems con campos pendientes: fondo con iniciales / enlace oculto |
| Imágenes | placeholder difuminado | sin imagen → fondo con iniciales | ruta rota → el build falla (D8) | imagen optimizada | — |
| Filtro | — | tipo vacío → sin botón | — | lista filtrada | — |
| CV | descarga directa | — | — | PDF en el idioma de la página | — |

- Riesgo de "AI slop": fondo casi negro + aurora + texto con degradado es una combinación muy repetida en 2026. Hay que darle identidad propia con tipografía y un acento de color definidos. Recomendado: correr /plan-design-review antes de implementar.
- Responsive: barra deslizable, columna fija pasa a estática en móvil, tarjetas en 1 columna.
- Accesibilidad: enlace "Saltar al contenido", `aria-current` en el enlace activo de la barra, `nav` con etiqueta, foco visible, contraste del texto secundario (#9CA1B3 sobre #07080C ≈ 7:1), tamaño táctil ≥ 44 px. El esquema exige `alt` en ES y EN para cada imagen; si falta, el build falla, igual que con las traducciones.
- Pendiente con dueño: cómo mostrar muchos certificados por emisor (dueño: /plan-design-review).

## Outside Voice

Running the outside voice automatically (standard step). Disable: `gstack-config set codex_reviews disabled`.
- Codex: no instalado (`CODEX_MODE: not_installed`).
- Respaldo nativo: no disponible en esta sesión (requiere la herramienta TaskOutput, que no está). Outside voice unavailable. Continuing to planning decisions and Approval readiness.
- Cobertura externa: ninguna. Las secciones 1-11 son la única revisión de este plan.

## TODO choices
Las propuestas de TODO ya se respondieron una por una (D4, D5, D6, D12). No quedan TODOs sin responder.

## Approval readiness
Filas revisadas: D1, D2, D3, R-P2 (D4), R-P3 (D5), R-CV (D6), R-LOC (D7), R-REF (D8), R-SEC (D9), R-CI (D10), R-OBS (D11), R-DOM (D12). Cada remedio aplicado en el plan cita su respuesta y se limita a su alcance. Lo diferido está fuera del trabajo aceptado y en TODOS.md. Consecuencias aplicadas sin pregunta nueva porque se derivan de criterios ya aprobados: 404 bilingüe, sección vacía oculta, `alt` obligatorio, reveals solo con JS, contacto por enlaces (sin backend), Motion no instalado en la fase 1.
Approval readiness: PASS

## Reality rows
- REALITY: premise-table pass 4 premisas del design doc aceptadas por el usuario (respuesta "De acuerdo con todas"); afirmaciones externas (3 minutos por portafolio, precios de Haiku 5.5, límites de Vercel Hobby) marcadas como no verificadas de primera mano; unverified=3 design-doc:24
- REALITY: already-done pass `git log` falla con "not a git repository" y la carpeta solo tiene CLAUDE.md, docs/ y TODOS.md; nada de este plan está hecho todavía docs/PLAN.md:1
- REALITY: surface-check finding rutas y comandos verificados solo por diseño (no hay CLI ni rutas existentes); la disponibilidad de eventos personalizados y del rate limit en Vercel Hobby queda como verificación al implementar docs/PLAN.md:250
- REALITY: binding-decisions pass sin decisiones previas registradas (`gstack-decision-search` vacío); D1-D12 de esta sesión mandan docs/PLAN.md:9
- REALITY: numbers finding costos y límites ($0.10/$0.50 MTok, ~$10-15/año de dominio, 10-20k tokens de corpus) son [estimated]; re-medir el corpus antes de la fase 3 TODOS.md:5
- REALITY: deferred-asks pass fases 2 y 3, CV generado y dominio diferidos con su motivo y respuesta TODOS.md:3
- REALITY: pr-count pass no existe `.gstack/ship-policy.json`, así que aplica el valor por defecto de un PR por ola; la fase 1 cabe en un PR (T1-T10) y T11 es contenido de Kener docs/PLAN.md:1

PLAN_REALITY: phase=ceo rows=7/7 missing=none unverified=3 verdict=complete

## NOT in scope
Diferido (en TODOS.md):
- Fase 2, efectos inmersivos avanzados. D4: "Diferir a TODOS.md". Sale primero lo liviano.
- Fase 3, chat IA. D5: "Diferir a TODOS.md". La fase 1 queda estática y sin costos.
- CV generado desde los datos. D6: "Diferir generación". Se usan los PDFs actuales.
- Dominio propio. D12: "vercel.app primero". Comprarlo antes de enviar CVs con la URL.
Rechazado (sin TODO):
- Revisión semanal de URLs externas. D8: el usuario eligió "Solo validar en build".
- Estilos "Editorial claro" y "Bento oscuro". D2: el usuario eligió "Narrativa inmersiva".
- Plantilla open source y sitio mínimo. D1: se eligió la base tipada por fases.

## What already exists
Nada en el repo (carpeta nueva). Se reutiliza: `create-next-app`, next-intl, el content layer elegido, `next/image`, `next/font`, Vercel Analytics y Speed Insights, y el mockup `docs/design/style-board.html` como referencia visual.

## Dream state delta
Después de la fase 1: portafolio bilingüe publicado, con las 4 secciones, casos de estudio y CV, protegido por CI y con analíticas. Faltan para el ideal a 12 meses: efectos inmersivos (fase 2), chat IA (fase 3), CV sincronizado, dominio propio y evidencia en analíticas de qué sección convierte.

## Error & Rescue Registry
| Codepath | Falla | Clase | Rescate | Usuario ve |
|---|---|---|---|---|
| content layer: frontmatter | campo inválido | ZodError | falla el build con archivo + campo | sitio anterior |
| content layer: pares | falta es/en | MissingLocaleError | falla el build | sitio anterior |
| content layer: slugs | duplicado | DuplicateSlugError | falla el build | sitio anterior |
| content layer: referencias (D8) | imagen inexistente / URL mala | ReferenceError de validación | falla el build | sitio anterior |
| content layer: alt | falta `alt` es/en | ZodError | falla el build | sitio anterior |
| MDX | sintaxis rota | MDX compile error | falla el build con línea | sitio anterior |
| next-intl | clave faltante | MISSING_MESSAGE | test de paridad en CI | sitio anterior |
| middleware `/` | encabezado vacío/raro | — | fallback a /en | inglés |
| rutas dinámicas | slug/idioma inválido | notFound() | 404 bilingüe | página 404 |
| next/image | cuota de Hobby | fallo de optimización | imágenes pre-optimizadas y pocas | imagen sin optimizar |

## Failure Modes Registry
```
  CODEPATH                 | FAILURE MODE                 | RESCUED? | TEST? | USER SEES?            | LOGGED?
  -------------------------|------------------------------|----------|-------|-----------------------|--------
  content layer            | frontmatter inválido         | Y        | Y     | sitio anterior        | Y (build)
  content layer            | falta traducción             | Y        | Y     | sitio anterior        | Y (build)
  content layer            | slug duplicado               | Y        | Y     | sitio anterior        | Y (build)
  content layer            | imagen/URL mal escrita       | Y        | Y     | sitio anterior        | Y (build)
  content layer            | falta alt                    | Y        | Y     | sitio anterior        | Y (build)
  i18n messages            | clave faltante               | Y        | Y     | sitio anterior        | Y (CI)
  middleware               | Accept-Language raro         | Y        | Y     | versión en inglés     | N
  rutas dinámicas          | slug/idioma inválido         | Y        | Y     | 404 bilingüe          | N
  enlaces externos         | URL que muere tras el deploy | N        | N     | 404 del sitio externo | N  (riesgo aceptado D8)
  Vercel                   | deploy roto                  | Y        | Y     | sitio anterior        | Y (email)
```
Critical gaps: 0. La fila de enlaces externos no es silenciosa para el visitante (ve el 404 externo); es un riesgo aceptado en D8.

## Diagrams
1. Arquitectura del sistema (Section 1). 2. Flujo de datos con sombras (Section 4). 3. Máquinas de estado: filtro y barra (Sections 1 y 11). 4. Flujo de errores (Section 2). 5. Secuencia de deploy (Section 9). 6. Rollback:
```
  deploy en producción roto? --sí--> Vercel > Deployments > anterior > Instant Rollback (~1 min)
            |                                   |
            no                                  v
            v                        arreglar en una rama → PR → CI verde → merge
       verificación post-deploy
```

## Stale Diagram Audit
No hay diagramas previos en el repo. El único artefacto visual previo es `docs/design/style-board.html` y sigue vigente.

## Sources
- Comportamiento de reclutadores: https://www.lyrid.io/post/5-critical-software-engineer-portfolio-mistakes-that-junior-developers-are-making , https://scale.jobs/blog/portfolio-content-for-tech-jobs-what-recruiters-want (consultadas 2026-10-22, blogs, indicativas).
- Estilos de portafolio: https://www.awwwards.com/inspiration/scrolling-website-1 , https://reallygooddesigns.com/developer-portfolio-examples/ (2026-10-22).
- Tiers gratuitos de LLM: https://agentdeals.dev/gemini-api-pricing-changes , https://dev.to/hirak8/best-free-ai-apis-for-developers-2026-with-real-rate-limits-1k5l (2026-10-22, verificar en las páginas oficiales antes de la fase 3).
- Vercel Hobby: https://www.fencode.dev/en/blog/vercel-free-vs-pro-2026-official-limits-pricing (2026-10-22, confirmar en vercel.com/pricing).
- Precios de Claude Haiku 5.5: referencia de la skill claude-api, cache del 2026-10-06 (verificar en la página oficial de precios).

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific finding above. Run with Claude Code or Codex; checkbox as you ship.
Supuesto de esfuerzo: scaffolding ~100x, features ~30x, tests ~50x (humano ÷ CC).

- [x] **T1 (P1, human: ~2h / CC: ~5min)** — repo — Crear el proyecto Next.js y el repo git
  - Surfaced by: Section 9 — secuencia de deploy pasos 1-2; R2-16
  - Files: package.json, next.config.ts, tsconfig.json, src/app/globals.css, .gitignore
  - Verify: `npm run build` termina sin errores; `.gitignore` excluye `private/` (originales de certificados)
- [ ] **T2 (P1, human: ~4h / CC: ~15min)** — i18n — Rutas /es y /en, middleware de idioma, hreflang y selector que conserva el ancla
  - Surfaced by: Section 1 — R-LOC (D7)
  - Files: src/i18n/routing.ts, src/i18n/request.ts, src/middleware.ts, messages/es.json, messages/en.json, src/components/LanguageSwitcher.tsx
  - Verify: E2E es-CO → /es, en-US → /en, de-DE → /en, cookie gana; test de paridad de claves
- [ ] **T3 (P1, human: ~6h / CC: ~20min)** — content — Esquemas Zod, pares es/en, slugs únicos, `alt` obligatorio, imágenes existentes, URLs válidas y reporte de pendientes
  - Surfaced by: Section 2 — GAP de referencias (D8); design doc regla de traducción
  - Files: src/content/schema.ts, archivo de config del content layer (Velite o content-collections, lo decide /plan-eng-review), content/** (ítems de ejemplo)
  - Verify: Vitest con fixtures inválidos (falta traducción, slug duplicado, imagen inexistente, URL mala, falta alt) que deben fallar con archivo + campo
- [x] **T4 (P1, human: ~10h / CC: ~30min)** — ui — Página por idioma: Hero, SectionNav, Section, Media, Reveal y las 4 secciones con filtro de proyectos
  - Surfaced by: D2; Section 4 casos borde; Section 7 presupuesto; Section 11 accesibilidad
  - Files: src/app/[locale]/page.tsx, src/app/[locale]/layout.tsx, src/components/sections/*.tsx, src/components/ui/*.tsx
  - Verify: E2E barra (clic, ancla directa, teclado, sección activa), filtro con `?filtro=`, sin JS, reduced motion, sin "pendiente" con VERCEL_ENV=production
- [ ] **T5 (P1, human: ~3h / CC: ~10min)** — ui — Página de caso de estudio y 404 bilingüe
  - Surfaced by: Section 2 — slug/idioma inválido
  - Files: src/app/[locale]/proyectos/[slug]/page.tsx, src/app/[locale]/not-found.tsx
  - Verify: E2E slug válido renderiza; slug malo y `/fr` → 404 con enlace al inicio
- [ ] **T6 (P1, human: ~30min / CC: ~5min)** — cv — Publicar los PDFs del CV en ES y EN
  - Surfaced by: D6; Section 3 datos personales en el CV
  - Files: public/cv/kener-avila-es.pdf, public/cv/kener-avila-en.pdf
  - Verify: Kener confirma los datos de contacto visibles; E2E 200 + `application/pdf` en ambos
- [ ] **T7 (P1, human: ~1h / CC: ~5min)** — security — Encabezados de seguridad
  - Surfaced by: Section 3 — R-SEC (D9)
  - Files: next.config.ts
  - Verify: E2E lee CSP, frame-ancestors, Referrer-Policy y nosniff; consola del preview sin errores CSP
- [ ] **T8 (P2, human: ~30min / CC: ~5min)** — observability — Vercel Web Analytics y Speed Insights
  - Surfaced by: Section 8 — R-OBS (D11)
  - Files: src/app/[locale]/layout.tsx, next.config.ts (CSP)
  - Verify: la visita de prueba aparece en el panel de Vercel tras el primer deploy
- [ ] **T9 (P1, human: ~3h / CC: ~10min)** — ci — Workflow de GitHub Actions con build, Vitest, Playwright y Lighthouse CI
  - Surfaced by: Section 6 — R-CI (D10)
  - Files: .github/workflows/ci.yml, lighthouserc.json, playwright.config.ts, vitest.config.ts
  - Verify: un PR de prueba con una traducción faltante queda en rojo; Lighthouse ≥ 95 en /es, /en y un caso de estudio
- [ ] **T10 (P1, human: ~1h / CC: ~10min)** — deploy — Repo en GitHub, proyecto en Vercel y protección de rama main
  - Surfaced by: Section 9 — secuencia de deploy pasos 2-4
  - Files: to be determined (configuración en GitHub y Vercel)
  - Verify: checklist post-deploy de Section 9 completo
- [ ] **T11 (P1, human: ~1 día / CC: n/a)** — content — Escribir la ficha del proyecto más fuerte y luego el resto del contenido
  - Surfaced by: design doc, The Assignment; premisa 4
  - Files: content/projects/<slug>.es.mdx, content/projects/<slug>.en.mdx (y el resto de colecciones)
  - Verify: la ficha tiene problema, aporte, stack, resultado medible y 3 aprendizajes en ambos idiomas

## Completion Summary
```
  +====================================================================+
  |            MEGA PLAN REVIEW — COMPLETION SUMMARY                   |
  +====================================================================+
  | Mode selected        | SCOPE REDUCTION                             |
  | System Audit         | carpeta nueva sin git ni código; design doc aprobado |
  | Step 0               | REDUCTION; fases 2, 3, CV generado diferidos |
  | Section 1  (Arch)    | 1 issue found (R-LOC, resuelto)             |
  | Section 2  (Errors)  | 10 error paths mapped, 1 GAP (resuelto D8)  |
  | Section 3  (Security)| 1 issue found (R-SEC, resuelto), 0 High     |
  | Section 4  (Data/UX) | 12 edge cases mapped, 0 unhandled (1 con dueño) |
  | Section 5  (Quality) | 0 issues found                              |
  | Section 6  (Tests)   | Diagram produced, 1 gap (R-CI, resuelto)    |
  | Section 7  (Perf)    | 0 issues found                              |
  | Section 8  (Observ)  | 1 gap found (R-OBS, resuelto)               |
  | Section 9  (Deploy)  | 1 risk flagged (R-DOM, diferido)            |
  | Section 10 (Future)  | Reversibility: 4/5, debt items: 3           |
  | Section 11 (Design)  | 2 issues (riesgo de AI slop, lista larga de certificados) |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (7 items)                           |
  | What already exists  | written                                     |
  | Dream state delta    | written                                     |
  | Error/rescue registry| 10 rows, 0 CRITICAL GAPS                    |
  | Failure modes        | 10 total, 0 CRITICAL GAPS                   |
  | TODOS.md updates     | 4 items proposed                            |
  | Scope proposals      | 0 proposed, 0 accepted (mode REDUCTION)     |
  | CEO plan             | skipped by mode                             |
  | Outside voice        | codex: unavailable (not installed; native fallback unavailable) |
  | Lake Score           | 1/2 recommendations chose complete option   |
  | Diagrams produced    | 6 (arquitectura, flujo, estados, errores, deploy, rollback) |
  | Stale diagrams found | 0                                           |
  | Unresolved decisions | 2 (listed below)                            |
  | Reality rows         | 7/7 rows (PLAN_REALITY), 3 unverified       |
  +====================================================================+
```

## Unresolved Decisions
- Content layer: Velite o content-collections. Dueño: /plan-eng-review. No bloquea el inicio de T1-T2.
- Cómo mostrar muchos certificados por emisor. Dueño: /plan-design-review. Sin decisión, se muestran todos.

## currentDecision (R-OBS) — answered, kept for history
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B |
|---|---|---|---|---|
| Medir visitas y páginas vistas | brecha S8 | no | Vercel Web Analytics | no |
| Métricas reales de rendimiento (Core Web Vitals) | brecha S8 | no | Vercel Speed Insights | no |
| Cookies o banner de consentimiento | — | no | no (ambas sin cookies) | no |
| CSP (D9) | approved | estricta | permite el script de Vercel de mismo origen | sin cambio |
| Eventos personalizados (descarga de CV) | brecha S8 | no | solo si el plan Hobby los incluye (verificar al implementar) | no |

Question: D11 — R-OBS: ¿Agregamos analíticas para saber si el portafolio está funcionando?
Project/branch/task: portafolio Next.js, revisión de la fase 1 (sin git todavía).
ELI10: El portafolio existe para conseguir entrevistas, pero sin analíticas no sabes si alguien lo visita después de enviar tu CV o desde dónde llegan. Vercel trae analíticas sin cookies (no necesitas banner de consentimiento) y mediciones de velocidad reales de tus visitantes.
Stakes if we pick wrong: sin analíticas, no sabes si un cambio mejora o empeora el portafolio; con ellas, sumas un script pequeño de Vercel a la página.
Recommendation: A porque cuesta un componente, no usa cookies y te dice si los reclutadores realmente llegan después de cada postulación.
Completeness: A=9/10, B=4/10
Net: saber si el portafolio cumple su objetivo vs. una página sin ningún script de medición.
Header: Analíticas
A) Vercel Analytics (recommended)
Se agregan Vercel Web Analytics (visitas, páginas, países, referidos) y Speed Insights (Core Web Vitals reales), ambos sin cookies, y la CSP los permite. Esfuerzo S, riesgo low, verificación: tras el primer deploy, la visita de prueba aparece en el panel de Vercel. ✅ Sabes si llegan reclutadores y desde dónde ✅ Ves la velocidad real en móviles, no solo Lighthouse ❌ Un script pequeño más; los eventos personalizados pueden requerir plan pago
B) Sin analíticas
El sitio no mide nada. Esfuerzo S (cero implementación), riesgo low, verificación: ninguna. ✅ Cero scripts de medición, máxima privacidad ✅ Nada que configurar ❌ No sabes si el portafolio está logrando su objetivo

## currentDecision (R-CI) — answered, kept for history
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B |
|---|---|---|---|---|
| Tests unit + E2E de la tabla de arriba | criterios aprobados (D7, D8, D9, design doc) | requeridos | se escriben | se escriben |
| Dónde corren | pendiente | — | GitHub Actions en cada PR y push a main | solo local (`npm test`) |
| Lighthouse 95+ | Success Criteria | requerido | Lighthouse CI automático en el PR | manual antes de cada release |
| Bloquear merge si fallan | pendiente | — | sí (check requerido en GitHub) | no |

Question: D10 — R-CI: ¿Dónde corren los tests y el chequeo de Lighthouse?
Project/branch/task: portafolio Next.js, revisión de la fase 1 (sin git todavía).
ELI10: Los tests se escriben igual en ambos casos; la diferencia es si GitHub los corre solo en cada cambio y no deja publicar algo roto, o si tú te acuerdas de correrlos a mano. Además, un repo con CI en verde es en sí una señal profesional que un reclutador técnico ve en GitHub.
Stakes if we pick wrong: sin CI, un cambio que baja Lighthouse o rompe una traducción puede llegar a producción si olvidas correr los tests.
Recommendation: A porque GitHub Actions es gratis para repos públicos, protege la nota de Lighthouse sin depender de tu memoria y muestra disciplina Full-Stack en tu GitHub.
Completeness: A=10/10, B=6/10
Net: protección automática y señal pública de calidad vs. un poco menos de configuración.
Header: CI
A) GitHub Actions (recommended)
Un workflow corre build, Vitest, Playwright y Lighthouse CI (mediana de 3 corridas) en cada PR y push a main, y es check requerido para hacer merge. Esfuerzo S, riesgo low, verificación: un PR de prueba con una traducción faltante debe quedar en rojo. ✅ Nada roto llega a producción aunque olvides correr los tests ✅ Badge de CI en verde visible para reclutadores técnicos ❌ Las corridas de Lighthouse en CI agregan unos minutos a cada PR
B) Solo local
Scripts `npm test`, `npm run e2e` y `npm run lighthouse` que corres tú antes de publicar. Esfuerzo S, riesgo medium, verificación: los corres a mano. ✅ Cero configuración de CI ✅ Feedback inmediato en tu máquina ❌ Depende de tu memoria; Vercel publica aunque no los hayas corrido

## currentDecision (R-SEC) — answered, kept for history
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B |
|---|---|---|---|---|
| Content-Security-Policy | hallazgo S3 | ninguna | estricta, solo mismo origen + Vercel | ninguna |
| `X-Frame-Options: DENY` / `frame-ancestors 'none'` | hallazgo S3 | no | sí | no |
| `Referrer-Policy: strict-origin-when-cross-origin` | hallazgo S3 | no | sí | no |
| `X-Content-Type-Options: nosniff` | hallazgo S3 | no | sí | no |
| HSTS | Vercel por defecto | sí | sin cambio | sin cambio |

Question: D9 — R-SEC: ¿Agregamos encabezados de seguridad al sitio?
Project/branch/task: portafolio Next.js, revisión de la fase 1 (sin git todavía).
ELI10: Son unas pocas líneas de configuración que le dicen al navegador "no cargues scripts de otros sitios y no dejes que nadie meta mi página dentro de la suya". Un líder técnico que revise tu sitio con las herramientas del navegador lo nota, y suman en la categoría Best Practices de Lighthouse.
Stakes if we pick wrong: sin encabezados, otro sitio puede embeber tu portafolio y no hay defensa extra si algún día entra un script de terceros; con una política mal escrita, se puede bloquear algo propio (se prueba en preview).
Recommendation: A porque cuesta pocas líneas en `next.config` y es justo la clase de detalle que un líder técnico Full-Stack revisa.
Completeness: A=9/10, B=5/10
Net: una señal de seguridad profesional por pocas líneas vs. nada que mantener.
Header: Seguridad
A) Agregar encabezados (recommended)
CSP estricta (solo mismo origen y lo que Vercel necesite), `frame-ancestors 'none'`, `Referrer-Policy` y `nosniff`, configurados en `next.config`. Esfuerzo S, riesgo low, verificación: test e2e que lee los encabezados de la respuesta y revisión de la consola sin errores de CSP en el preview. ✅ Bloquea embeber tu sitio y scripts ajenos ✅ Suma en Lighthouse Best Practices y en la revisión de un líder técnico ❌ Al agregar un servicio externo después hay que actualizar la CSP
B) Sin encabezados extra
Solo lo que Vercel trae por defecto (HTTPS + HSTS). Esfuerzo S (cero implementación), riesgo low, verificación: ninguna. ✅ Nada que configurar ni mantener ✅ Ningún riesgo de bloquear algo propio ❌ Se pierde una señal de calidad y una capa de defensa barata

## currentDecision (R-REF) — answered, kept for history
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B | C |
|---|---|---|---|---|---|
| Rutas locales de imágenes existen | GAP S2 | no se valida | falla el build | falla el build | no se valida |
| URLs externas (`github`, `demo`, `verifyUrl`) tienen formato válido | GAP S2 | no se valida | falla el build (Zod `url()`) | falla el build (Zod `url()`) | no se valida |
| URLs externas responden (no 404) | GAP S2 | no se valida | revisión semanal en CI (no bloquea deploy) | no | no |
| Campos vacíos → "pendiente"/oculto | D2 / design doc | aprobado | sin cambio | sin cambio | sin cambio |

Question: D8 — R-REF: ¿Cómo evitamos imágenes y enlaces rotos en producción?
Project/branch/task: portafolio Next.js, revisión de la fase 1 (sin git todavía).
ELI10: Vas a llenar después las rutas de imágenes y los enlaces de GitHub y certificados. Un error de tipeo hoy pasaría sin aviso y un reclutador vería una imagen rota o un enlace a una página 404. Los enlaces rotos están entre los errores que más castigan los reclutadores.
Stakes if we pick wrong: sin validación, un tipeo llega a producción y daña la primera impresión; con validación estricta, un sitio externo caído no debe bloquear tus deploys.
Recommendation: A porque el build atrapa los tipeos al instante y la revisión semanal detecta enlaces que se rompen solos (repos renombrados, certificados movidos) sin bloquear deploys.
Completeness: A=10/10, B=8/10, C=3/10
Net: cero enlaces rotos con un chequeo semanal extra vs. solo atrapar tipeos vs. no validar.
Header: Enlaces
A) Build + chequeo semanal (recommended)
El build falla si una imagen local no existe o una URL tiene formato inválido, y un job semanal de CI revisa que las URLs externas respondan y abre un issue si alguna falla. Esfuerzo S, riesgo low, verificación: tests con un ítem de prueba con imagen y URL inválidas. ✅ Ningún tipeo llega a producción ✅ Te enteras si un repo o certificado externo deja de existir ❌ Un job más en CI que mantener
B) Solo validar en build
El build falla si una imagen local no existe o una URL tiene formato inválido; no se revisan las URLs externas. Esfuerzo S, riesgo low, verificación: tests con un ítem de prueba inválido. ✅ Atrapa todos los tipeos sin nada extra en CI ✅ Nunca bloquea por un sitio externo ❌ Un enlace que se rompe solo (repo renombrado) pasa sin aviso
C) No validar
Las rutas y URLs se publican tal como estén escritas. Esfuerzo S (cero implementación), riesgo high, verificación: revisión manual. ✅ Nada que construir ✅ Máxima flexibilidad al editar ❌ Un tipeo se ve roto frente a un reclutador

## currentDecision (R-CV) — answered, kept for history
Commitment comparison:

| Commitment | Source/approval or pending | Current | A | B |
|---|---|---|---|---|
| Botón "Descargar CV" en ES y EN | Problem Statement, Success Criteria | fase 1 | fase 1 (PDF existente) | fase 1 (PDF generado) |
| Generador de PDF desde los datos (ES/EN) | Open Questions | pendiente | TODOS.md | fase 1 |
| CV dentro de la "fuente única" | Premisa 2 + R1-1 | excepción si es a mano | excepción explícita por ahora | cubierto |
| Revisar datos de contacto del CV público (R2-16) | spec review minor | pendiente | fase 1 (revisar tu PDF) | fase 1 (elegir campos) |

Question: D6 — R-CV: ¿Diferimos el CV generado desde los datos y en la fase 1 publicamos tu PDF actual?
Project/branch/task: portafolio Next.js, plan de la fase 1 en revisión (sin git todavía).
ELI10: Generar el CV automáticamente desde los mismos archivos del sitio lo mantiene siempre al día, pero exige diseñar una plantilla PDF bilingüe aparte. Si ya tienes un CV en PDF (o lo haces en Canva/Word), la fase 1 lo publica tal cual en ES y EN, y la generación automática queda anotada para después.
Stakes if we pick wrong: con el PDF a mano, un cambio en el sitio no actualiza el CV solo; con el generado, la fase 1 suma una plantilla y una librería de PDF.
Recommendation: A porque probablemente ya tienes un CV pulido para ATS y la generación es un extra que no cambia cómo te ven los reclutadores en la fase 1.
Note: options differ in kind, not coverage — no completeness score.
Net: publicar ya tu CV existente vs. CV siempre sincronizado desde el día uno.
Header: CV
A) Diferir generación (recommended)
La fase 1 publica tus PDFs actuales (`/cv/kener-avila-es.pdf` y `/cv/kener-avila-en.pdf`) y antes revisas qué datos de contacto muestran; la generación automática va a TODOS.md. Esfuerzo S, riesgo low, verificación: ambos enlaces descargan el PDF correcto en cada idioma. ✅ Cero código extra y usas un CV que ya pasó por ATS ✅ Puedes cambiar el diseño del CV sin tocar el sitio ❌ Si actualizas el sitio, tienes que acordarte de actualizar el PDF a mano
B) Generar desde los datos en fase 1
Una plantilla PDF bilingüe se genera en el build desde el mismo contenido del sitio. Esfuerzo M, riesgo medium, verificación: test que compara el PDF con el contenido. ✅ El CV nunca se desactualiza respecto al sitio ✅ Cumple la "fuente única" sin excepciones ❌ Diseñar un PDF que se vea bien y pase ATS lleva tiempo antes del primer deploy

## Eng Review (/plan-eng-review, 2026-10-23)
Target: `docs/PLAN.md` (fase 1). Report file: este mismo archivo.

### Scope record
feature answers: ninguna propuesta de recorte (la revisión CEO ya redujo el alcance); structure: B "Smaller arrangement" (Eng D1); accepted scope: mismas funciones y contratos de la fase 1; contenido como `content/experience.yaml`, `content/education.yaml`, `content/certifications.yaml` con campos `{es, en}` por ítem, y proyectos como `content/projects/<slug>.es.mdx` + `.en.mdx`; pending remedies: R-CL, R-CSP.
Scope Challenge result: scope accepted as-is (arreglo más pequeño que conserva el alcance).

### Scope Challenge findings
1. [P1] (confidence: 9/10) docs/PLAN.md T2 — el plan nombra `src/middleware.ts`, pero en Next 16 (16.4.2 en npm el 2026-10-23) el archivo se llama `proxy.ts` con la misma API de next-intl. Corrección factual, sin cambio de comportamiento: T2 usa `src/proxy.ts`.
2. [P2] (confidence: 8/10) docs/PLAN.md Section 1 "todas las páginas pre-generadas" — next-intl opta por render dinámico si no se declaran los idiomas: hace falta `generateStaticParams` en `app/[locale]/layout.tsx` y `setRequestLocale` (o `next/root-params` en Next ≥16.3). Implementación necesaria del SSG aprobado (D1), sin pregunta.
3. [P1] (confidence: 8/10) docs/PLAN.md "Content layer: Velite o content-collections" — decisión abierta de la revisión CEO. Ver R-CL.

### Decision ledger (Eng)

### R-CL: Content layer
Finding: #3, P1, confidence 8/10, docs/PLAN.md "Unresolved Decisions", reviewer: Claude (eng review)
Plan baseline: "Contenido en MDX + frontmatter validado con Zod" (D1); "El build falla si una imagen local de `images[]` no existe o si `github`/`demo`/`verifyUrl` no es una URL válida" (D8); librería sin elegir.
Runtime evidence: npm 2026-10-23: velite 0.4.0 (modificado 2026-06-19); @content-collections/core 0.15.3 (2026-09-21), @content-collections/next 0.2.11 (2026-02-14), @content-collections/mdx 0.2.2 (2025-03-10). No hay código todavía.
Comparison grid:

| Commitment | Source | Current | A Velite | B content-collections | C Sin librería |
|---|---|---|---|---|---|
| Validación Zod en build | D1 | requerido | `s.object` (Zod) | `z` de Zod | script propio con Zod |
| Imagen local existe (D8) | D8 | requerido | `s.image()` falla si no existe | código propio en `transform` | código propio |
| width/height + blur para `next/image` | S7 presupuesto | requerido | incluido en `s.image()` | código propio (sharp/plaiceholder) | código propio |
| YAML + MDX (Eng D1) | Eng D1 | aprobado | soporta ambos | soporta ambos (mdx vía plugin) | `yaml` + `@next/mdx` |
| Integración con `next build` (Turbopack) | Next 16 | — | CLI aparte: `velite build && next build` | plugin que envuelve `next.config` | script previo |
| Dependencias nuevas | — | — | 1 (velite) | 3 (core, next, mdx) | 2-3 (yaml, zod, mdx) |

Question D2:
D2 — R-CL: ¿Qué librería carga y valida el contenido?
Project/branch/task: portafolio Next.js, fase 1 en docs/PLAN.md (sin git todavía).
ELI10: Necesitamos algo que lea tus archivos YAML y MDX, revise que cada campo esté bien (fechas, enlaces, imágenes que existen) y le entregue al sitio datos con tipos de TypeScript. Velite ya trae la revisión de imágenes y genera el tamaño y la miniatura borrosa que `next/image` necesita; content-collections obliga a escribir eso a mano; sin librería escribimos todo nosotros.
Stakes if we pick wrong: una librería que no valide imágenes deja pasar un tipeo (rompe D8); una que se integre mal con Next 16 puede romper el build en cada actualización.
Recommendation: A porque `s.image()` cumple D8 y el presupuesto de imágenes sin código propio, y al correr como CLI aparte no depende de cómo Next 16 empaqueta el sitio.
Completeness: A=9/10, B=8/10, C=7/10
Net: menos código propio con una dependencia 0.x vs. más código propio con más control.
Header: Content layer
Options:
A) Velite (recommended)
`velite build` corre antes de `next build`, valida YAML y MDX con esquemas Zod, falla si una imagen no existe y entrega width, height y blur para `next/image`. Esfuerzo S (human: ~3h / CC: ~10min), riesgo medium por ser 0.x de un solo mantenedor, mantenimiento bajo. ✅ D8 y las miniaturas borrosas salen gratis con `s.image()` ✅ No depende del empaquetador de Next 16: es un paso previo al build ❌ Versión 0.x: una actualización podría cambiar la API y habría que fijar la versión
B) content-collections
Plugin que envuelve `next.config`, esquemas Zod, MDX vía `@content-collections/mdx`; la validación de imágenes y el blur se escriben a mano en `transform`. Esfuerzo S (human: ~4h / CC: ~15min), riesgo medium por el plugin de Next y el paquete MDX sin cambios desde 2025-03, mantenimiento medio. ✅ Core publicado más recientemente (2026-09) ✅ Integración directa con el dev server de Next ❌ Hay que escribir y probar la validación de imágenes y el blur
C) Sin librería
Un script `scripts/content.ts` lee YAML con `yaml`, valida con Zod, revisa imágenes con `fs`, genera blur con `sharp`, y los casos de estudio usan `@next/mdx`. Esfuerzo M (human: ~1 día / CC: ~30min), riesgo low en dependencias pero más código propio, mantenimiento alto. ✅ Control total y sin dependencias 0.x ✅ Muestra en tu repo que sabes construir la capa de datos ❌ Más código que probar y mantener para algo que ya existe

State: approved
Actual answer: A) Velite (recommended) — Eng D2
Accepted scope: Velite con versión exacta fijada en `package.json`; `velite build` antes de `next build` (y `velite dev --watch` junto a `next dev`); colecciones `experience`, `education`, `certifications` (YAML con `{es, en}`) y `projects` (MDX es/en); `s.image()` para `images[]` (falla si no existe, entrega width/height/blur); salida `.velite/` en `.gitignore`.
History: —

### Section 1: Architecture review
Arquitectura actualizada con Eng D1 y D2:

```
  content/experience.yaml ─┐
  content/education.yaml  ─┼─> velite build ──> .velite/*.json + tipos ──> app/[locale]/page.tsx
  content/certifications.yaml┤   (Zod, s.image, s.mdx)                     app/[locale]/proyectos/[slug]/page.tsx
  content/projects/*.{es,en}.mdx ┘        │ falla con archivo + campo
                                          v
                               public/static/* (imágenes con hash)
  src/proxy.ts (next-intl) ── solo "/" y negociación de idioma
  generateStaticParams(['es','en']) en app/[locale]/layout.tsx + setRequestLocale
```

Findings:
1. [P1] (confidence: 8/10) docs/PLAN.md R-SEC "CSP estricta (mismo origen + lo que Vercel necesite)" vs Section 1 "todas las páginas pre-generadas (SSG)" — Next.js inyecta scripts inline para hidratar. Una CSP estricta de scripts requiere nonces por request, y los nonces obligan a render dinámico, lo que rompe el SSG aprobado (D1). Ver R-CSP.
2. [P3] (confidence: 7/10) docs/PLAN.md T4 — la lista de pendientes del build: Velite no la imprime solo. Se cumple con un `prepare`/`complete` hook de Velite que recorre las colecciones y lista campos vacíos. Implementación del criterio aprobado, sin pregunta.
3. Falla realista por integración: Velite cambia su API en una versión nueva → mitigado con versión exacta fijada (Eng D2) y CI (CEO D10).

### R-CSP: CSP compatible con SSG
Finding: Section 1 #1, P1, confidence 8/10, docs/PLAN.md R-SEC + Section 1, reviewer: Claude (eng review)
Plan baseline: CEO D9 "CSP estricta (mismo origen + lo que Vercel necesite), `frame-ancestors 'none'`, `Referrer-Policy`, `nosniff`"; D1 SSG.
Runtime evidence: sin código. Basado en la guía de CSP de Next.js (nonces requieren render dinámico); verificar en el preview al implementar.
Comparison grid:

| Commitment | Source | Current | A | B |
|---|---|---|---|---|
| Páginas estáticas en CDN | D1 | aprobado | se conserva | se pierde: cada visita renderiza en servidor |
| `script-src` | D9 | "estricta" | `'self' 'unsafe-inline'` | `'self' 'nonce-…' 'strict-dynamic'` |
| `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` | D9 | aprobado | sí | sí |
| `Referrer-Policy`, `nosniff` | D9 | aprobado | sí | sí |
| Vercel Analytics (mismo origen) | D11 | aprobado | permitido por `'self'` | permitido por nonce |
| Costo en Vercel Hobby | — | ~0 invocaciones | ~0 | 1 invocación por visita |

Question D3:
D3 — R-CSP: ¿Qué CSP usamos sin romper las páginas estáticas?
Project/branch/task: portafolio Next.js, fase 1 en docs/PLAN.md (sin git todavía).
ELI10: Aprobaste una política de seguridad "estricta". Pero Next.js mete pequeños scripts dentro del HTML para arrancar la página, y la única forma de permitirlos de forma estricta es generar un código distinto en cada visita, lo que obliga a construir la página en el servidor cada vez. Eso apaga el sitio estático y rápido que también aprobaste.
Stakes if we pick wrong: con nonces, cada visita usa una función de Vercel y el sitio es más lento y más caro; sin ellos, los scripts inline quedan permitidos (riesgo bajo porque no hay contenido de usuarios).
Recommendation: A porque conserva el sitio 100% estático y todas las demás protecciones de D9, y el riesgo de `'unsafe-inline'` es bajo en un sitio sin entradas de usuario.
Completeness: A=8/10, B=9/10
Net: sitio estático rápido con CSP casi estricta vs. CSP estricta con render en cada visita.
Header: CSP
Options:
A) CSP estática (recommended)
CSP fija en `next.config` con `script-src 'self' 'unsafe-inline'` y el resto estricto (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`), más `Referrer-Policy` y `nosniff`. Esfuerzo S (human: ~1h / CC: ~5min), riesgo low, mantenimiento bajo. ✅ Las páginas siguen estáticas en el CDN, sin costo por visita ✅ Bloquea embeber el sitio y scripts de otros dominios ❌ Permite scripts inline, así que una inyección hipotética no quedaría bloqueada por la CSP
B) CSP con nonce
`src/proxy.ts` genera un nonce por request y la CSP usa `'nonce-…' 'strict-dynamic'`; todas las páginas pasan a render dinámico. Esfuerzo M (human: ~4h / CC: ~15min), riesgo medium, mantenimiento medio. ✅ CSP estricta de verdad, también contra scripts inline ✅ Mejor puntuación en auditorías de seguridad ❌ Pierde el SSG aprobado: cada visita usa una función de Vercel y el primer byte tarda más

State: approved
Actual answer: "Quitar CSP" (respuesta libre del usuario a Eng D3, ninguna de las opciones A/B)
Accepted scope: no se envía encabezado `Content-Security-Policy`. Se conservan las demás protecciones aprobadas en CEO D9: `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, y la protección contra embeber el sitio pasa de `frame-ancestors 'none'` (directiva de CSP) a `X-Frame-Options: DENY` (mismo efecto, sin CSP). Las páginas siguen estáticas (D1). El test E2E de encabezados verifica esos tres encabezados y que no exista CSP.
History: CEO D9 aprobó "CSP estricta"; reabierto en Eng D3 por conflicto con SSG (D1); el usuario eligió quitar la CSP.

### Section 2: Code quality review
1. [P2] (confidence: 7/10) docs/PLAN.md Eng D1 — las 3 colecciones YAML repiten la forma `{es, en}` en cada campo de texto. Un helper `localized(schema)` en `velite.config.ts` que exige ambas claves evita tres copias. Llamadores propuestos (suposición de plan): `experience`, `education`, `certifications` y el frontmatter de `projects`. Es la misma regla de traducción aprobada; se aplica sin pregunta.
2. [P2] (confidence: 7/10) docs/PLAN.md Section 4 "orden por fecha" — YAML convierte `2024-03-01` en Date pero deja `2024-03` como texto. Fechas como texto `YYYY-MM` validadas con regex y `end: "present"` permitido; el orden se calcula en un solo lugar. Implementación necesaria, sin pregunta.
3. Organización: `velite.config.ts` (esquemas), `content/` (datos), `src/components/sections/*`, `src/components/ui/{Section,Media,Reveal,SectionNav,ProjectFilter,LanguageSwitcher}.tsx`, `src/i18n/*`, `src/proxy.ts`. Sin abstracciones extra.
Dispositions: #1 y #2 aceptados como implementación de contratos aprobados (traducción, orden por fecha); sin decisiones nuevas.

### Section 3: Test review
Framework: ninguno detectado (carpeta sin `package.json`). Vitest + Playwright + Lighthouse CI ya aprobados en CEO D10.

```
CODE PATHS                                              USER FLOWS
[+] velite.config.ts (esquemas)                         [+] Reclutador: / → idioma → barra → proyecto
  ├── localized()        [GAP] falta es/en → error        ├── [GAP] [→E2E] flujo completo de 30 s
  ├── s.image()          [GAP] imagen inexistente         ├── [GAP] [→E2E] ancla directa /es#certificaciones
  ├── url fields         [GAP] URL mal formada            ├── [GAP] [→E2E] teclado Tab+Enter en la barra
  ├── alt es/en          [GAP] falta alt                  └── [GAP] [→E2E] selector de idioma conserva sección
  ├── slug único         [GAP] duplicado                [+] Proyectos
  └── pending report     [GAP] lista campos vacíos        ├── [GAP] [→E2E] filtro + volver restaura ?filtro=
[+] src/proxy.ts                                          └── [GAP] [→E2E] tipo vacío sin botón
  ├── es* → /es          [GAP] [→E2E]                   [+] Estados
  ├── otro → /en         [GAP] [→E2E]                     ├── [GAP] [→E2E] sin JS: texto visible
  └── cookie gana        [GAP] [→E2E]                     ├── [GAP] [→E2E] reduced motion
[+] Media (pendiente vs iniciales por VERCEL_ENV) [GAP]    ├── [GAP] [→E2E] 404 bilingüe (slug malo, /fr)
[+] next.config headers  [GAP] [→E2E] 3 encabezados, sin CSP└── [GAP] [→E2E] CV es/en 200 + pdf
[+] messages paridad     [GAP] unit                      [+] Calidad: Lighthouse ≥95 /es /en /proyectos/x
COVERAGE: 0/24 rutas con test (código aún no existe) | GAPS: 24 (17 E2E, 7 unit, 0 eval)
```

- Todas las brechas son pruebas requeridas de comportamientos ya aprobados; no hay decisiones de test nuevas. Lista completa con tarjetas de valor en el Test Plan Artifact: `C:\Users\Usuario\.gstack\projects\portafolio\Usuario-unknown-eng-review-test-plan-20261022-195203.md`.
- Pruebas de esquema: llamar a la API programática de Velite con `root` apuntando a `tests/fixtures/content-*` (sin seam de producción).
- Sin LLM en la fase 1: no aplica eval.
- Tests obsoletos: ninguno.
Dispositions: brechas cubiertas por T3, T4, T5, T6, T7 y T9 (aprobadas en CEO D7-D11, Eng D2-D3).

### Section 4: Performance review
- `velite build` procesa imágenes con sharp en cada build: decenas de imágenes, segundos [estimated]. Sin caché necesaria.
- Sin consultas, sin bucles por request, sin bases de datos. El único código por request es `src/proxy.ts`, que solo corre en `/` (matcher excluye `/es`, `/en`, `/_next`, `/_vercel`, `/static`, archivos con punto).
- No issues found.

### Outside Voice
Running the outside voice automatically (standard step). Disable: `gstack-config set codex_reviews disabled`.
Codex no instalado; el respaldo nativo requiere TaskOutput, que esta sesión no tiene. Outside voice unavailable. Continuing to planning decisions and Approval readiness.

### TODOS.md (eng)
Sin TODOs nuevos: el riesgo de quitar la CSP queda registrado como decisión (Eng D3), no como trabajo pendiente.

### Reality rows (eng)
- REALITY: premise-table pass las premisas del plan se apoyan en respuestas del usuario; 3 cifras externas siguen sin verificar de primera mano docs/PLAN.md:24
- REALITY: already-done pass `git log` falla con "not a git repository"; nada de T1-T11 existe docs/PLAN.md:1
- REALITY: surface-check finding `src/middleware.ts` no existe en Next 16.4.2 (se llama `proxy.ts`); corregido en T2. Versiones verificadas con `npm view` (next 16.4.2, next-intl 4.14.9, velite 0.4.0) docs/PLAN.md:57
- REALITY: binding-decisions pass CEO D1-D12 y Eng D1-D3 se respetan; D9 reabierto con motivo y cerrado por el usuario docs/PLAN.md:9
- REALITY: numbers pass versiones [measured: npm view 2026-10-23]; tiempos de build y esfuerzos [estimated] docs/PLAN.md:57
- REALITY: deferred-asks pass nada nuevo diferido en eng; los diferidos de CEO siguen en TODOS.md TODOS.md:3
- REALITY: pr-count pass sin `.gstack/ship-policy.json`: un PR para T1-T10 docs/PLAN.md:1
PLAN_REALITY: phase=eng rows=7/7 missing=none unverified=3 verdict=complete

### Approval readiness (eng)
Filas revisadas: Eng D1 (estructura), R-CL (Eng D2), R-CSP (Eng D3), más CEO D1-D12 heredadas. Correcciones factuales sin pregunta: `proxy.ts`, `generateStaticParams` + `setRequestLocale`, helper `localized()`, fechas `YYYY-MM`, reporte de pendientes vía hook de Velite.
Approval readiness: PASS

### Implementation Tasks (actualizadas por eng review)
Reemplazan a las tareas de la revisión CEO donde se indica.

- [x] **T2 (P1, human: ~4h / CC: ~15min)** — i18n — usar `src/proxy.ts` (no `middleware.ts`), `generateStaticParams` en `app/[locale]/layout.tsx` y `setRequestLocale` en layouts y páginas
  - Surfaced by: Scope Challenge #1 y #2
  - Files: src/proxy.ts, src/i18n/routing.ts, src/i18n/request.ts, src/app/[locale]/layout.tsx, messages/es.json, messages/en.json, src/components/ui/LanguageSwitcher.tsx
  - Verify: `next build` marca /es y /en como estáticas (●); E2E de redirección es-CO, en-US, de-DE, cookie
- [x] **T3 (P1, human: ~5h / CC: ~15min)** — content — Velite (versión exacta) con YAML `{es, en}` para experiencia, estudios y certificados, MDX es/en para proyectos, helper `localized()`, `s.image()`, URLs, `alt`, slugs únicos, fechas `YYYY-MM` y hook que lista pendientes
  - Surfaced by: Eng D1, Eng D2, Section 2 #1 y #2
  - Files: velite.config.ts, content/experience.yaml, content/education.yaml, content/certifications.yaml, content/projects/*.es.mdx, content/projects/*.en.mdx, tests/content.test.ts, tests/fixtures/**
  - Verify: Vitest con fixtures inválidos hace fallar `velite build` con archivo + campo
- [ ] **T7 (P1, human: ~30min / CC: ~5min)** — security — `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`; sin CSP
  - Surfaced by: Section 1 #1, Eng D3
  - Files: next.config.ts
  - Verify: E2E lee los 3 encabezados y confirma que no hay `Content-Security-Policy`
- [ ] **T8 (P2)** — sin cambios, salvo que ya no hay CSP que actualizar.
- [x] **T12 (P1, human: ~30min / CC: ~5min)** — scripts — `dev`: `velite dev --watch` + `next dev`; `build`: `velite build && next build`; `.velite/` en `.gitignore`
  - Surfaced by: Eng D2
  - Files: package.json, .gitignore
  - Verify: `npm run build` desde un clon limpio genera `.velite/` y termina sin errores

### Worktree parallelization strategy
| Step | Modules touched | Depends on |
|------|----------------|------------|
| T1 scaffold + T12 scripts | raíz del repo | — |
| T2 i18n | src/i18n, src/proxy.ts, messages/ | T1 |
| T3 content | velite.config.ts, content/, tests/ | T1 |
| T4-T5 UI | src/app/[locale], src/components | T2, T3 |
| T6 CV, T7 headers, T8 analytics | public/cv, next.config.ts, layout | T1 (T8 tras T4) |
| T9 CI | .github/, configs de test | T1 |
| T11 contenido (Kener) | content/ | T3 |

Lane A: T1 → T2 → T4/T5. Lane B: T3 (después de T1). Lane C: T9 + T6/T7 (después de T1).
Execution order: T1 primero. Luego A (T2), B (T3) y C en paralelo. Merge. Después T4/T5, T8 y T10.
Conflict flags: `next.config.ts` lo tocan T7 y T8; `package.json` lo tocan T1, T3, T9 y T12. Secuenciarlos o resolver al hacer merge. Para un proyecto personal, la implementación secuencial también es razonable.

### Completion summary (eng)
- Step 0: Scope Challenge — scope accepted as-is (arreglo más pequeño, Eng D1)
- Reality rows: 7/7 applicable rows emitted (`PLAN_REALITY` complete), 3 unverified premises
- Architecture Review: 1 issue found (R-CSP)
- Code Quality Review: 2 issues found
- Test Review: diagram produced, 24 gaps identified (todas pruebas requeridas de lo aprobado)
- Performance Review: 0 issues found
- NOT in scope: written (sección de la revisión CEO, sin cambios)
- What already exists: written (sección de la revisión CEO; se suma Velite)
- TODOS.md updates: 0 items proposed to user
- Failure modes: 0 critical gaps flagged
- Unresolved decisions: 0 in this review
- Outside voice: codex, unavailable (not installed; native fallback unavailable)
- Parallelization: 3 lanes, 3 parallel / 1 sequential tras T1
- Lake Score: N/A (Y=0: Eng D2 y D3 no ofrecían una opción 10/10; Eng D1 sin puntuación por ser de tipo)

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | ISSUES OPEN | mode: SCOPE_REDUCTION, 0 critical gaps; 1 open item (certificados, design review) |
| Outside Review | codex (auto, plan-review) | Independent 2nd opinion | 2 | unavailable | Codex not installed; native fallback unavailable (no TaskOutput) in CEO and Eng; no completed external review |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | ISSUES OPEN | 27 issues, 0 critical gaps (24 son pruebas requeridas mapeadas; decisiones R-CL y R-CSP resueltas) |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE COVERAGE:** codex, phase plan-review (CEO y Eng), unavailable (CLI not installed; native fallback unavailable), no completed external review.
- **VERDICT:** no review CLEAR. Eng review completa con 0 decisiones abiertas; su estado es ISSUES OPEN porque mapea trabajo pendiente (tests y tareas), no fallas. Listo para implementar; se recomienda /plan-design-review antes de T4.

**UNRESOLVED DECISIONS:**
- + 2 unresolved from prior reviews (CEO: el content layer quedó resuelto aquí en Eng D2; sigue abierta cómo mostrar muchos certificados por emisor, dueño /plan-design-review)
