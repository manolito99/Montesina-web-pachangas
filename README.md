# Montesiña Padel

Aplicación web para organizar **pachangas** (partidos informales) en el club
Montesiña Padel: masculino, femenino y mixto. Hecho con Next.js 14 (App Router),
TypeScript, Tailwind, Framer Motion, Prisma y NextAuth.

> Este commit entrega el **proyecto base + sistema de diseño + reveal del logo
> ligado al scroll**. El resto del plan (auth, pachangas, reservas, perfil) se
> implementa a continuación.

## Identidad visual

- Fondo dark navy `#0F1A2E → #0B1220`.
- Acento lima con gradiente `#D4F25C → #9FC93C` y glow sutil.
- Texto principal `#E8ECF2`, secundario `#A5B0C3`.
- Tipografía: Space Grotesk (cargada desde `next/font`).
- El logo del ciervo se compone al hacer scroll en la home (ver
  `src/components/logo-reveal.tsx`).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + utilidades shadcn-style (`cn()`, `<Button/>`)
- **Framer Motion** con `useScroll` + `useTransform` para animaciones ligadas al scroll
- **SVGR** para importar `*.svg` como componentes React
- (Próximamente) **Prisma + PostgreSQL**, **NextAuth**, **Zod**, Server Actions

## Estructura

```
src/
├── app/
│   ├── globals.css       # tokens base, animación reduce-motion
│   ├── layout.tsx        # html lang="es", Space Grotesk, header global
│   └── page.tsx          # home (hero + reveal + featured)
├── assets/               # SVGs importados como React components (SVGR)
├── components/
│   ├── hero-intro.tsx
│   ├── logo-reveal.tsx   # scroll-linked stag composition
│   ├── featured-matches.tsx
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   └── ui/button.tsx
├── lib/utils.ts
└── types/svg.d.ts
```

## Arranque local

```bash
npm install
cp .env.example .env
npm run dev
# http://localhost:3000
```

## Arranque con Docker

Hay tres ficheros: `Dockerfile` (producción multi-stage), `Dockerfile.dev`
(desarrollo con hot reload), `docker-compose.yml` (web + Postgres para dev),
`docker-compose.prod.yml` (variante producción).

### Desarrollo (hot reload + Postgres listo para Prisma)

```bash
cp .env.example .env
docker compose up --build
# web → http://localhost:3000
# db  → localhost:5432  (montesina / montesina)
```

El servicio `web` monta el código como volumen y arranca `npm run dev`, por lo
que los cambios se recargan en caliente. El servicio `db` levanta Postgres 16
con healthcheck.

### Producción

```bash
# Crea .env con DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, POSTGRES_PASSWORD
docker compose -f docker-compose.prod.yml up -d --build
```

La imagen de producción usa `output: "standalone"` de Next.js, corre como
usuario no-root (`nextjs:1001`) y solo expone `:3000`.

## Variables de entorno

| Nombre | Uso |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión Postgres (Prisma) |
| `NEXTAUTH_SECRET` | Secreto para firmar sesiones NextAuth |
| `NEXTAUTH_URL` | URL pública de la app |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciales para el contenedor `db` |

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor Next en local |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint (config de Next) |
| `npm run typecheck` | `tsc --noEmit` |

## Animación del logo (resumen técnico)

- El SVG `logo-montesina.svg` se importa como componente React vía SVGR.
- Se renderiza **tres veces** dentro de una sección `sticky` (260vh de alto):
  cada copia usa un `clip-path` distinto (astas, mitad izquierda, mitad
  derecha) y se anima con `useTransform(scrollYProgress, …)`.
- El conjunto recibe `opacity`, `scale`, `filter: blur()` y un `drop-shadow`
  lima que se intensifica con el progreso.
- Una vez compuesto, al seguir scrolleando, aparece la versión flat del logo
  en el header (sticky).
- Respeta `prefers-reduced-motion`: si el usuario lo prefiere, el logo final
  aparece directamente sin animación.
