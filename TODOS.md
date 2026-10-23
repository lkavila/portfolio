# TODOS

## Portafolio

### Chat IA "Pregúntale a mi portafolio" (fase 3)

**What:** Endpoint `/api/chat` en Next.js que responde preguntas de reclutadores usando solo el contenido tipado del portafolio, con un panel de chat en la página.

**Why:** Es la demo en vivo del perfil AI Engineer y el mayor diferenciador del portafolio.

**Context:** Se difirió en la revisión CEO del 2026-10-22 (D5) para que la fase 1 saliera 100% estática. Los requisitos ya están escritos en el design doc (`~/.gstack/projects/portafolio/Usuario-no-branch-design-20261022-190042.md`, secciones "Chat IA: controles mínimos obligatorios" y "Chat IA: política de respuestas") y deben conservarse tal cual: API key solo en servidor, rate limit por IP con store compartido (IP con hash y TTL), entrada máxima de 500 caracteres, `max_tokens` fijo, tope de gasto mensual en el proveedor, fallo visible con enlaces a CV y contacto, respuestas solo desde el contenido, "No tengo ese dato", solo URLs que existen en el contenido, rechazo de temas ajenos e inyección, idioma de la página y set fijo de preguntas de prueba con condiciones de aprobación verificables. Antes de empezar: medir los tokens del contenido real de un idioma y elegir proveedor (Claude Haiku 5.5 a $0.10/$0.50 por MTok o un tier gratuito como Groq/Gemini, verificando precios y límites ese día). Revisar también si el rate limit del firewall de Vercel está en Hobby; si no, usar un KV gratuito.

**Effort:** M (human) / S (CC)
**Priority:** P2
**Depends on:** Fase 1 publicada con contenido real en ES y EN.

### Efectos inmersivos avanzados (fase 2)

**What:** Agregar a la fase 1 la columna fija con barra de progreso en Experiencia, medios que escalan al entrar y la aurora animada del hero, como en la opción "C · Narrativa inmersiva" de `docs/design/style-board.html`.

**Why:** Completa el efecto "wow" de scroll que eligió Kener sin retrasar el primer deploy.

**Context:** Diferido en la revisión CEO del 2026-10-22 (D4). La fase 1 sale con reveals sutiles y un hero con gradiente estático. Restricciones que deben seguir cumpliéndose: Lighthouse 95+ en móvil también con los efectos, `prefers-reduced-motion` respetado, contenido visible sin JS, y la imagen LCP nunca aparece desde opacidad 0. Preferir animaciones CSS dirigidas por scroll cuando el navegador las soporte y cargar en diferido los medios bajo el pliegue.

**Effort:** M (human) / S (CC)
**Priority:** P2
**Depends on:** Fase 1 publicada.

### Comprar dominio propio y conectarlo a Vercel

**What:** Comprar un dominio (ej. `keneravila.dev`), conectarlo al proyecto de Vercel y actualizar canonical, hreflang y la URL del CV.

**Why:** Una dirección propia se ve más profesional en el CV, LinkedIn y GitHub que `*.vercel.app`.

**Context:** Decidido en la revisión CEO del 2026-10-22 (D12): la fase 1 sale en `*.vercel.app`. Hacerlo antes de poner la URL del portafolio en CVs que vayas a enviar, para que los PDFs no queden con la dirección vieja. La dirección `.vercel.app` sigue funcionando después de conectar el dominio.

**Effort:** S (human) / S (CC)
**Priority:** P1
**Depends on:** Fase 1 publicada y contenido listo.

### CV en PDF generado desde los datos

**What:** Generar en el build los CV en ES y EN a partir del mismo contenido tipado del sitio, reemplazando los PDFs hechos a mano.

**Why:** Hoy un cambio en el sitio no actualiza el CV; con la generación nunca se desincronizan.

**Context:** Diferido en la revisión CEO del 2026-10-22 (D6). La fase 1 publica `public/cv/kener-avila-es.pdf` y `public/cv/kener-avila-en.pdf` hechos a mano, como excepción explícita a la "fuente única". La plantilla debe seguir siendo legible para ATS (texto real, sin columnas complejas) y mostrar solo los datos de contacto aprobados para publicación.

**Effort:** M (human) / S (CC)
**Priority:** P3
**Depends on:** Fase 1 publicada con contenido completo.

## Completed
