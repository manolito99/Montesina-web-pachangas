# Montesiña Padel — Web App de Pachangas

## Qué es esto

App web para organizar pachangas de pádel (masculino, femenino, mixto) del club Montesiña. Los socios se apuntan a partidos, reservan pistas y gestionan su perfil. Actualmente es frontend con datos mock — sin base de datos real conectada todavía.

## Stack

- **Next.js 14** (App Router, `output: "standalone"`)
- **TypeScript** strict
- **Tailwind CSS 3.4** con paleta custom extendida
- **Framer Motion** para el logo reveal scroll-linked
- **web-push** para notificaciones push (VAPID)
- **Docker** (Dockerfile.dev para dev, Dockerfile multi-stage para prod)
- **PostgreSQL 16** (container Docker, sin Prisma/ORM configurado aún)

## Comandos

```bash
npm run dev          # dev server (o docker compose up)
npm run build        # build producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Docker:
```bash
docker compose up -d --build        # dev con hot-reload
docker compose -f docker-compose.prod.yml up -d --build  # prod
docker exec montesina-web npm install <pkg>  # instalar paquetes DENTRO del container
```

**IMPORTANTE**: El volumen `/app/node_modules` en docker-compose.yml aísla los node_modules del container. Si añades un paquete, instálalo DENTRO del container con `docker exec`, o haz rebuild con `docker compose up -d --build`.

## Arquitectura de archivos

```
src/
├── app/                                # Next.js App Router — rutas y API
│   ├── page.tsx                        # / — Home
│   ├── layout.tsx                      # Root layout: fonts, metadata, SW
│   ├── manifest.ts                     # PWA manifest
│   ├── globals.css                     # Tailwind + CSS vars
│   ├── (auth)/                         # Route group sin shell
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   ├── pachangas/
│   │   ├── page.tsx                    # Listado + filtros
│   │   ├── [id]/page.tsx               # Detalle
│   │   └── nueva/page.tsx              # Wizard crear
│   ├── reservas/page.tsx               # Booking pistas
│   ├── perfil/page.tsx                 # Perfil
│   ├── notificaciones/page.tsx         # Notificaciones
│   └── api/push/                       # API routes
│       ├── subscribe/route.ts
│       └── send/route.ts
│
├── components/
│   ├── layout/                         # Componentes de layout/shell
│   │   ├── site-header.tsx             # Header paper | navy-fade
│   │   ├── site-footer.tsx             # Footer
│   │   ├── mobile-tabs.tsx             # Bottom tabs móvil
│   │   └── logo-reveal.tsx             # Scroll-linked logo reveal
│   ├── features/                       # Componentes de funcionalidad específica
│   │   └── push-manager.tsx            # UI push subscribe/test
│   └── ui/                             # Primitivas UI reutilizables
│       ├── neo-button.tsx, neo-card.tsx, neo-input.tsx, neo-checkbox.tsx
│       ├── pachanga-card.tsx, cat-chip.tsx, level-balls.tsx
│       ├── avatar.tsx, filter-chip.tsx, stat-box.tsx
│       ├── page-tabs.tsx, chat-message.tsx, empty-state.tsx, fab.tsx
│
├── lib/
│   ├── utils.ts                        # cn() = clsx + tailwind-merge
│   ├── types.ts                        # Tipos compartidos
│   ├── db.ts                           # Prisma client singleton (placeholder)
│   ├── mock-data.ts                    # Datos mock (hasta conectar DB)
│   └── services/                       # Lógica de negocio / acceso a datos
│       ├── push.ts                     # web-push server-side
│       └── push-client.ts             # Push API browser-side
│
├── config/
│   └── constants.ts                    # Constantes de la app
│
├── assets/                             # SVGs importados como React components
│   ├── logo-montesina.svg
│   └── logo-montesina-flat.svg
│
└── types/
    └── svg.d.ts                        # Declaración tipos SVG para SVGR

docs/                                   # Documentación y assets de diseño
├── wireframes/                         # Wireframes JSX originales
└── logo-animation.mp4                  # Video animación del logo

public/                                 # Assets estáticos
├── sw.js                               # Service Worker
├── icons/                              # PWA icons (192, 512, maskable, apple)
├── logo-montesina.svg
└── logo-montesina-flat.svg
```

## Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `paper` | `#f5f2ea` | Fondo principal |
| `paper-alt` | `#ece8dc` | Fondo secundario/secciones |
| `fill` | `#ffffff` | Fondo de cards/inputs |
| `ink` | `#1a1a1a` | Texto principal |
| `ink-2` | `#3a3a3a` | Texto secundario |
| `muted` | `#7a7670` | Texto terciario/placeholders |
| `lime` | `#c8e84a` | Acento primario (CTA, activo) |
| `lime-deep` | `#9fc93c` | Acento secundario (links, badges) |
| `lime-soft` | `#fafce0` | Background selección/unread |
| `navy` | `#0F1A2E` | Background dark (hero, login) |
| `navy-deep` | `#0B1220` | Background dark profundo |
| `foam` | `#E8ECF2` | Texto light sobre navy |
| `foam-muted` | `#a5b0c3` | Texto light secundario sobre navy |
| `cat-masc` | `#5b8aef` | Categoría masculino (azul) |
| `cat-fem` | `#e57db5` | Categoría femenino (rosa) |
| `cat-mix` | `#9fc93c` | Categoría mixto (lime) |

## Tipografía

- **`font-sans`**: Space Grotesk (400, 500, 600, 700) — todo el UI
- **`font-hand`**: Kalam (400, 700) — acentos, taglines, precios, organizadores

## Sombras neo-brutalist

- `shadow-neo`: `2px 2px 0 0 #1a1a1a` (default)
- `shadow-neo-sm`: `1px 1px 0 0 #1a1a1a`
- `shadow-neo-lg`: `3px 3px 0 0 #1a1a1a`
- `shadow-neo-lime`: `2px 2px 0 0 #9fc93c` (acento)

## Convenciones de código

### Componentes
- **Server components** por defecto. Solo `"use client"` cuando hay interactividad (useState, onClick, framer-motion)
- **Mobile-first** con breakpoint `md:` (768px). Usar pattern `md:hidden` / `hidden md:block` para secciones responsive distintas
- **`cn()`** para clases condicionales: `cn("base", condition && "extra")`
- **Tailwind puro**, nunca inline styles
- Props tipadas con interfaces, no con `type`

### Páginas
- Datos mock en `src/lib/mock-data.ts`, importados en cada página
- Funciones helper locales al archivo (ej: `function SectionHero()`) para secciones de página
- Shell de cada página: `<SiteHeader>` + `<main>` + `<SiteFooter>` + `<MobileTabs>`
- Auth pages (`/login`, `/registro`) usan route group `(auth)` con layout propio sin shell

### Estilo visual
- Bordes: `border-[1.5px] border-ink` (standard), `border-dashed border-muted` (decorativo)
- Cards: `NeoCard` con `shadow-neo`, `rounded-lg`
- Botones: `NeoButton` siempre `rounded-full`
- Labels/headers sección: `text-[11px] font-bold uppercase tracking-widest2 text-muted`
- Texto handwritten: `font-hand text-sm text-muted`

## PWA

- **Manifest**: `src/app/manifest.ts` (Next.js metadata API)
- **Service Worker**: `public/sw.js` — cache offline + push + notificationclick
- **Iconos**: `public/icons/` (192, 512, maskable-512, apple-touch-icon)
- **Registro SW**: inline script en `layout.tsx`
- Display: `standalone`, theme navy, background paper

## Push Notifications

- **VAPID keys** en `.env` / `.env.local` (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT)
- **Backend**: `web-push` via `src/lib/push.ts`. Suscripciones guardadas en memoria (Map) — migrar a DB cuando se conecte Prisma
- **API**: `POST /api/push/subscribe`, `DELETE /api/push/subscribe`, `POST /api/push/send`
- **Cliente**: `src/lib/push-client.ts` (subscribeToPush, unsubscribeFromPush, sendTestPush)
- **UI**: `<PushManager>` en `/notificaciones` — botón activar/desactivar/test
- **SW handlers**: `push` (muestra notificación), `notificationclick` (abre URL), `pushsubscriptionchange` (re-suscribe)

## Wireframes de referencia

Los wireframes originales están en `WIREFRAMES/`. Son JSX renderizables en un canvas Figma-like:
- `wireframes-base.jsx` — primitivas compartidas (WF colors, Box, Btn, CatChip, etc.)
- `wireframes-home.jsx` — 3 variantes de home (A/B/C). Se eligió mezcla A+C
- `wireframes-list.jsx` — 4 variantes de listado. Se eligió ListA (cards + filtros)
- `wireframes-flows.jsx` — Detalle, wizard crear, booking pistas
- `wireframes-misc.jsx` — Perfil, auth, notificaciones, estados vacío/error

## Qué falta por hacer

- **Base de datos**: Configurar Prisma con el PostgreSQL que ya corre en Docker. Migrar mock-data a tablas reales
- **Autenticación**: NextAuth está referenciado en docker-compose pero no configurado. Implementar login/registro real
- **Suscripciones push persistentes**: Migrar de Map en memoria a tabla en DB
- **Formularios funcionales**: El wizard crear pachanga, el booking, el registro — actualmente son UI sin submit real
- **Listado calendario**: Wireframe ListC (vista semanal) no implementado
- **Comunidad**: La ruta `/comunidad` del nav no tiene página
- **Tests**: No hay tests. Considerar Playwright para e2e de los flujos principales
- **Internacionalización**: Todo está en español hardcoded
