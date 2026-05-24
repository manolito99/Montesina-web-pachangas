# Montesiña Padel — Web App de Pachangas

## Qué es esto

PWA para organizar pachangas de pádel (masculino, femenino, mixto) del club Montesiña. Los socios se registran, crean pachangas, se apuntan a partidos y comparten por WhatsApp. Backend funcional con PostgreSQL.

## Stack

- **Next.js 14** (App Router, `output: "standalone"`)
- **TypeScript** strict
- **Tailwind CSS 3.4** con paleta custom neo-brutalist
- **Prisma 6** ORM → PostgreSQL 16
- **NextAuth v4** (Credentials + Google OAuth)
- **Framer Motion** para el logo reveal scroll-linked
- **web-push** para notificaciones push (VAPID)
- **Docker** (Dockerfile.dev para dev, Dockerfile multi-stage para prod)
- **bcryptjs** para hash de contraseñas

## Comandos

```bash
npm run dev          # dev server (o docker compose up)
npm run build        # build producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio (GUI para DB)
npm run db:reset     # prisma migrate reset (borra y recrea)
```

Docker:
```bash
docker compose up -d --build                    # dev con hot-reload
docker compose -f docker-compose.prod.yml up -d --build  # prod
docker exec montesina-web npm install <pkg>     # instalar paquetes DENTRO del container
docker exec montesina-web npx prisma generate   # regenerar client tras cambio de schema
docker exec -e DATABASE_URL="postgresql://montesina:montesina@db:5432/montesina?schema=public" montesina-web npx prisma migrate dev --name <nombre>
```

**IMPORTANTE**: El volumen `/app/node_modules` en docker-compose.yml aísla los node_modules del container. Si añades un paquete, instálalo DENTRO del container con `docker exec`, o haz rebuild con `docker compose up -d --build`. Después de cada migración de Prisma, ejecuta `npx prisma generate` dentro del container y reinicia.

## Arquitectura de archivos

```
src/
├── app/                                # Next.js App Router
│   ├── page.tsx                        # / — Home (navy hero desktop + compacto mobile)
│   ├── layout.tsx                      # Root layout: fonts, SessionProvider, SW
│   ├── manifest.ts                     # PWA manifest
│   ├── globals.css                     # Tailwind + CSS vars
│   ├── (auth)/                         # Route group sin shell
│   │   ├── layout.tsx
│   │   ├── login/page.tsx              # Login funcional (email + Google)
│   │   └── registro/page.tsx           # Registro funcional (nombre, email, pass, género, nivel)
│   ├── pachangas/
│   │   ├── page.tsx                    # Listado (fetch API) + filtros
│   │   ├── [id]/page.tsx              # Detalle (fetch API) + apuntarme/salir + compartir WhatsApp
│   │   └── nueva/page.tsx              # Wizard crear → POST /api/pachangas
│   ├── reservas/page.tsx               # Booking pistas (OCULTO en nav, guardado para futuro)
│   ├── perfil/page.tsx                 # Perfil con tabs + stats
│   ├── notificaciones/page.tsx         # Notificaciones + PushManager
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth handler
│       │   └── register/route.ts       # POST crear cuenta con bcrypt
│       ├── pachangas/
│       │   ├── route.ts                # GET listar, POST crear
│       │   └── [id]/
│       │       ├── route.ts            # GET detalle
│       │       └── join/route.ts       # POST apuntarse, DELETE salir
│       ├── courts/route.ts             # GET listar, POST crear personalizada
│       └── push/
│           ├── subscribe/route.ts      # POST/DELETE suscripción push
│           └── send/route.ts           # POST enviar push a todos
│
├── components/
│   ├── layout/                         # Shell y navegación
│   │   ├── site-header.tsx             # Header paper | navy-fade con UserMenu
│   │   ├── site-footer.tsx             # Footer
│   │   ├── mobile-tabs.tsx             # Bottom tabs: Inicio / Pachangas / Yo
│   │   ├── logo-reveal.tsx             # Scroll-linked logo reveal
│   │   ├── user-menu.tsx               # Avatar/iniciales logueado o "Entrar"
│   │   ├── session-provider.tsx        # NextAuth SessionProvider wrapper
│   │   └── sw-register.tsx             # Service Worker registration (useEffect)
│   ├── features/
│   │   └── push-manager.tsx            # UI push subscribe/test
│   └── ui/                             # 14 primitivas reutilizables
│       ├── neo-button.tsx              # primary / ghost / outlineLime / secondary
│       ├── neo-card.tsx                # accent / dashed / flat
│       ├── neo-input.tsx               # NeoInput + NeoTextarea
│       ├── neo-checkbox.tsx            # Checkbox lime
│       ├── pachanga-card.tsx           # Card principal de pachanga
│       ├── cat-chip.tsx                # M / F / X chip de categoría
│       ├── level-balls.tsx             # 1-5 bolitas de nivel
│       ├── avatar.tsx                  # Avatar + AvatarRow
│       ├── filter-chip.tsx             # Pill toggle para filtros
│       ├── stat-box.tsx                # Label + valor grande
│       ├── page-tabs.tsx               # Tabs horizontales con underline
│       ├── chat-message.tsx            # Burbuja de chat
│       ├── empty-state.tsx             # Estado vacío / error
│       └── fab.tsx                     # Floating action button "+"
│
├── lib/
│   ├── utils.ts                        # cn() = clsx + tailwind-merge
│   ├── types.ts                        # Tipos compartidos (Pachanga, Court, etc.)
│   ├── db.ts                           # Prisma client singleton
│   ├── auth.ts                         # NextAuth config (Credentials + Google)
│   ├── get-user.ts                     # getCurrentUserId() server-side helper
│   ├── mock-data.ts                    # Datos mock legacy (perfil, notificaciones, booking)
│   └── services/
│       ├── push.ts                     # web-push server (subs en fichero JSON)
│       └── push-client.ts             # Push API browser-side
│
├── config/constants.ts                 # Constantes de la app
├── assets/                             # SVGs como React components
└── types/svg.d.ts                      # Declaración tipos SVGR

prisma/
├── schema.prisma                       # Schema completo (User, Account, Session, Pachanga, Court, etc.)
├── seed.ts                             # Seed: 3 pistas club + 4 users + 2 pachangas
└── migrations/                         # Historial de migraciones

docs/wireframes/                        # Wireframes JSX originales
public/                                 # SW, iconos PWA, logos estáticos
```

## Base de datos (Prisma + PostgreSQL)

### Modelos principales

| Modelo | Descripción |
|--------|-------------|
| `User` | Socios. name, email, password (bcrypt), gender, level. Nullable password para users de Google. |
| `Account` | NextAuth: cuentas OAuth vinculadas (Google, etc.) |
| `Session` | NextAuth: sesiones activas |
| `Pachanga` | Partidos. category (M/F/X), date, duration, court, level range, price, status. |
| `Participation` | Relación User↔Pachanga. Status: CONFIRMED, WAITLIST, CANCELLED. |
| `Court` | Pistas. 3 del club (isClub=true): Montesiña (outdoor), Lebrón (indoor), Pabellón (indoor). Los usuarios pueden crear pistas personalizadas. |
| `ChatMessage` | Mensajes del chat de cada pachanga. |

### Pistas del club

| Nombre | Tipo | ID |
|--------|------|----|
| Montesiña | Outdoor | `court-montesina` |
| Lebrón | Indoor | `court-lebron` |
| Pabellón | Indoor | `court-pavillon` |

### Seed (usuarios demo)

| Email | Password | Nivel | Género |
|-------|----------|-------|--------|
| javi@correo.com | demo123 | 3 | M |
| marta@correo.com | demo123 | 3 | F |
| carlos@correo.com | demo123 | 4 | M |
| lucia@correo.com | demo123 | 2 | F |

## Autenticación (NextAuth v4)

- **Credentials**: email + password con bcrypt
- **Google OAuth**: configurable via `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` en `.env`
- **Sesión**: JWT strategy con user ID en el token
- **Páginas custom**: `/login` y `/registro`
- **Adapter**: Prisma (cuentas OAuth y sesiones en DB)
- **Callback URLs de Google**: `http://localhost:3000/api/auth/callback/google` + producción
- Si Google vars están vacías, el botón de Google no se muestra

### Header dinámico

- **No logueado**: muestra botón "Entrar" → `/login`
- **Logueado**: muestra avatar con iniciales (o foto de Google) → `/perfil`, botón "Salir"
- Funciona en ambas variantes del header (paper y navy-fade)

## Flujos funcionales (end-to-end)

| Flujo | Frontend | Backend | Estado |
|-------|----------|---------|--------|
| Registrarse | `/registro` form | POST `/api/auth/register` + auto-signin | ✅ |
| Login email | `/login` form | NextAuth credentials | ✅ |
| Login Google | `/login` botón Google | NextAuth Google provider | ✅ |
| Crear pachanga | Wizard 4 pasos | POST `/api/pachangas` | ✅ |
| Ver listado | `/pachangas` | GET `/api/pachangas` | ✅ |
| Ver detalle | `/pachangas/[id]` | GET `/api/pachangas/[id]` | ✅ |
| Apuntarme | Botón en detalle | POST `/api/pachangas/[id]/join` | ✅ |
| Salir | Botón en detalle | DELETE `/api/pachangas/[id]/join` | ✅ |
| Compartir WhatsApp | Botón en detalle | Cliente (wa.me link) | ✅ |
| Crear pista custom | Form en wizard step 3 | POST `/api/courts` | ✅ |
| Push notifications | PushManager en `/notificaciones` | POST `/api/push/send` | ✅ |

## Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `paper` / `paper-alt` | `#f5f2ea` / `#ece8dc` | Fondos principales |
| `fill` | `#ffffff` | Cards, inputs |
| `ink` / `ink-2` | `#1a1a1a` / `#3a3a3a` | Texto |
| `muted` | `#7a7670` | Texto terciario |
| `lime` / `lime-deep` / `lime-soft` | `#c8e84a` / `#9fc93c` / `#fafce0` | Acentos |
| `navy` / `navy-deep` | `#0F1A2E` / `#0B1220` | Fondos dark |
| `foam` / `foam-muted` | `#E8ECF2` / `#a5b0c3` | Texto sobre navy |
| `cat-masc` / `cat-fem` / `cat-mix` | `#5b8aef` / `#e57db5` / `#9fc93c` | Chips categoría |

## Tipografía

- **`font-sans`**: Space Grotesk (400-700) — UI
- **`font-hand`**: Kalam (400, 700) — acentos decorativos

## Convenciones de código

- **Server components** por defecto, `"use client"` solo para interactividad
- **Mobile-first** con `md:` breakpoint. Pattern `md:hidden` / `hidden md:block`
- **`cn()`** para clases condicionales, **Tailwind puro** sin inline styles
- **Bordes**: `border-[1.5px] border-ink`, dashed: `border-dashed border-muted`
- **Labels**: `text-[11px] font-bold uppercase tracking-widest2 text-muted`
- **Paquetes dentro de Docker**: siempre `docker exec montesina-web npm install <pkg>`

## Variables de entorno (.env)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection (usa `db` hostname en Docker) |
| `NEXTAUTH_SECRET` | Secret para JWT sessions |
| `NEXTAUTH_URL` | URL base de la app |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key para push |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_SUBJECT` | VAPID subject (mailto:) |

## PWA

- **Manifest**: `src/app/manifest.ts`, display standalone, theme navy
- **Service Worker**: `public/sw.js` v3 — network-first HTML, nunca cachea `/_next/*`, push handler
- **Iconos**: `public/icons/` (192, 512, maskable, apple-touch-icon)
- **Registro**: `<SwRegister>` client component con useEffect (no inline script)

## Qué falta por hacer

- **Autenticación en API routes**: Reemplazar `DEMO_USER_ID` hardcoded por `getCurrentUserId()` real en las API routes de pachangas
- **Perfil funcional**: Conectar `/perfil` a datos reales del usuario autenticado
- **Listado calendario**: Wireframe ListC (vista semanal)
- **Comunidad**: La ruta `/comunidad` no tiene página
- **Reservas**: `/reservas` oculta en nav (se gestiona fuera). Reactivar descomentando en header + mobile-tabs
- **Chat funcional**: WebSocket o polling para mensajes en tiempo real
- **Push en eventos**: Enviar push automático al crear pachanga, al apuntarse, recordatorios
- **Tests**: Playwright para e2e
- **Producción**: Configurar dominio real, HTTPS, NEXTAUTH_URL de producción
