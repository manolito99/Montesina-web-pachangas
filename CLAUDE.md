# Montesiña Padel — Web App de Pachangas

## Qué es esto

PWA para organizar pachangas de pádel (masculino, femenino, mixto) del club Montesiña en Pontevedra. Los socios se registran con Google o email, crean pachangas, se apuntan a partidos, comparten por WhatsApp y reciben push notifications filtradas por sus preferencias. Backend funcional con PostgreSQL, datos 100% reales (sin mocks).

## Stack

- **Next.js 14** (App Router, `output: "standalone"`)
- **TypeScript** strict
- **Tailwind CSS 3.4** con paleta custom neo-brutalist
- **Prisma 6** ORM → PostgreSQL 16
- **NextAuth v4** (Credentials + Google OAuth)
- **web-push** para notificaciones push (VAPID, filtradas por preferencias)
- **Framer Motion** para el logo reveal scroll-linked
- **bcryptjs** para hash de contraseñas
- **Docker** (Dockerfile.dev + Dockerfile multi-stage prod)

## Comandos

```bash
npm run dev              # dev server (o docker compose up)
npm run build            # build producción
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run db:migrate       # prisma migrate dev
npm run db:seed          # prisma db seed (solo crea las 3 pistas del club)
npm run db:studio        # prisma studio (GUI para DB)
npm run db:reset         # prisma migrate reset (borra y recrea)
```

Docker:
```bash
docker compose up -d --build                    # dev con hot-reload
docker compose -f docker-compose.prod.yml up -d --build  # prod
docker exec montesina-web npm install <pkg>     # instalar paquetes DENTRO del container
docker exec montesina-web npx prisma generate   # regenerar client tras cambio de schema
docker exec -e DATABASE_URL="postgresql://montesina:montesina@db:5432/montesina?schema=public" montesina-web npx prisma migrate dev --name <nombre>
```

**IMPORTANTE**: El volumen `/app/node_modules` aísla los node_modules del container. Instala paquetes dentro con `docker exec` o haz rebuild. El `Dockerfile.dev` ejecuta `prisma generate` automáticamente al construir.

## Arquitectura de archivos

```
src/
├── app/                                # Next.js App Router
│   ├── page.tsx                        # / — Home (navy hero desktop + compacto mobile)
│   ├── layout.tsx                      # Root layout: fonts, SessionProvider, SwRegister
│   ├── manifest.ts                     # PWA manifest
│   ├── globals.css                     # Tailwind + CSS vars
│   ├── (auth)/                         # Route group sin shell
│   │   ├── login/page.tsx              # Login funcional (email + Google OAuth)
│   │   └── registro/page.tsx           # Registro funcional (nombre, email, pass, género, nivel + Google)
│   ├── pachangas/
│   │   ├── page.tsx                    # Listado (fetch API) + filtros — público
│   │   ├── [id]/page.tsx              # Detalle (fetch API) + apuntarme/salir + compartir WhatsApp
│   │   └── nueva/page.tsx              # Wizard crear — requiere autenticación
│   ├── reservas/page.tsx               # OCULTO en nav (reservas externas al club)
│   ├── perfil/page.tsx                 # Perfil con datos reales + stats de DB
│   ├── notificaciones/page.tsx         # Push manager + preferencias personalizables
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth handler
│       │   └── register/route.ts       # POST crear cuenta con bcrypt
│       ├── pachangas/
│       │   ├── route.ts                # GET listar, POST crear (auth required)
│       │   └── [id]/
│       │       ├── route.ts            # GET detalle
│       │       └── join/route.ts       # POST apuntarse, DELETE salir (auth required)
│       ├── courts/route.ts             # GET listar, POST crear personalizada
│       ├── profile/route.ts            # GET perfil + stats del usuario autenticado
│       ├── notifications/prefs/route.ts # GET/PUT preferencias de notificación
│       └── push/
│           ├── subscribe/route.ts      # POST/DELETE suscripción push (vinculada a userId)
│           └── send/route.ts           # POST enviar push (test)
│
├── components/
│   ├── layout/                         # Shell y navegación
│   │   ├── site-header.tsx             # Header paper | navy-fade con UserMenu dinámico
│   │   ├── site-footer.tsx
│   │   ├── mobile-tabs.tsx             # Bottom tabs: Inicio / Pachangas / Yo
│   │   ├── logo-reveal.tsx             # Scroll-linked logo reveal
│   │   ├── user-menu.tsx               # Avatar/foto Google cuando logueado, "Entrar" si no
│   │   ├── session-provider.tsx        # NextAuth SessionProvider
│   │   └── sw-register.tsx             # SW register + auto-sync push subscription
│   ├── features/
│   │   └── push-manager.tsx            # UI activar/desactivar push + test
│   └── ui/                             # 14 primitivas reutilizables
│
├── lib/
│   ├── utils.ts                        # cn() = clsx + tailwind-merge
│   ├── types.ts                        # Tipos compartidos
│   ├── db.ts                           # Prisma client singleton
│   ├── auth.ts                         # NextAuth config (Credentials + Google)
│   ├── get-user.ts                     # getCurrentUserId() server-side
│   ├── mock-data.ts                    # Legacy (solo booking grid, no usado en flujos principales)
│   └── services/
│       ├── push.ts                     # web-push: sendPushToAll, sendPushFiltered (respeta prefs)
│       └── push-client.ts             # Push API browser-side
│
├── config/constants.ts
├── assets/                             # SVGs como React components
└── types/svg.d.ts

prisma/
├── schema.prisma                       # Schema completo
├── seed.ts                             # Solo crea las 3 pistas del club (sin datos ficticios)
└── migrations/

docs/wireframes/                        # Wireframes JSX originales
public/                                 # SW, iconos PWA, logos
```

## Base de datos

### Modelos

| Modelo | Descripción |
|--------|-------------|
| `User` | Socios. name, email, password (nullable para Google), gender, level, image. |
| `Account` | NextAuth: cuentas OAuth vinculadas (Google). |
| `Session` | NextAuth: sesiones. |
| `Pachanga` | Partidos. category (M/F/X), date, duration (90min), court, levelMin-Max, price, status. |
| `Participation` | User↔Pachanga. Status: CONFIRMED / WAITLIST / CANCELLED. |
| `Court` | 3 del club (isClub=true) + personalizadas creadas por usuarios. |
| `ChatMessage` | Mensajes del chat de cada pachanga. |
| `NotificationPrefs` | Preferencias push por usuario: categorías, nivel, pista, recordatorios. |
| `PushSubscription` | Suscripciones push vinculadas a userId para filtrado por preferencias. |

### Pistas del club

| Nombre | Tipo | ID |
|--------|------|----|
| Montesiña | Outdoor | `court-montesina` |
| Lebrón | Indoor | `court-lebron` |
| Pabellón | Indoor | `court-pavillon` |

Los usuarios pueden crear pistas personalizadas con nombre, tipo y ubicación.

### Franjas horarias

Bloques fijos de 90 minutos, siempre disponibles (reservas externas al club):

| # | Inicio | Fin |
|---|--------|-----|
| 1 | 08:00 | 09:30 |
| 2 | 09:30 | 11:00 |
| 3 | 11:00 | 12:30 |
| 4 | 12:30 | 14:00 |
| 5 | 14:00 | 15:30 |
| 6 | 15:30 | 17:00 |
| 7 | 17:00 | 18:30 |
| 8 | 18:30 | 20:00 |
| 9 | 20:00 | 21:30 |
| 10 | 21:30 | 23:00 |

Días disponibles: hoy + 7 días hacia adelante.

## Autenticación

- **Google OAuth**: principal. Credenciales en `.env` (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).
- **Email/password**: registro con bcrypt, login via NextAuth Credentials provider.
- **Sesión JWT** con userId en el token.
- **Páginas custom**: `/login` y `/registro` con botón de Google y formulario.
- **Protección**: crear pachanga y apuntarse requieren autenticación. Ver listado y detalle es público.
- **Header dinámico**: foto Google / iniciales cuando logueado, "Entrar" si no.

### Redirect URIs de Google

```
http://localhost:3000/api/auth/callback/google
https://TU-TUNNEL.trycloudflare.com/api/auth/callback/google
https://TU-DOMINIO-PROD/api/auth/callback/google
```

## Flujos funcionales (end-to-end con datos reales)

| Flujo | Requiere auth | Endpoint |
|-------|---------------|----------|
| Registrarse (email o Google) | No | POST /api/auth/register + NextAuth |
| Ver listado pachangas | No | GET /api/pachangas |
| Ver detalle pachanga | No | GET /api/pachangas/[id] |
| Crear pachanga (wizard 4 pasos) | **Sí** | POST /api/pachangas |
| Apuntarme / Salir | **Sí** | POST/DELETE /api/pachangas/[id]/join |
| Compartir por WhatsApp | No | Cliente (wa.me link con datos formateados) |
| Crear pista personalizada | Sí | POST /api/courts |
| Ver perfil + stats | **Sí** | GET /api/profile |
| Configurar preferencias push | **Sí** | GET/PUT /api/notifications/prefs |
| Push al crear pachanga | Auto | sendPushFiltered (respeta prefs del receptor) |
| Push al apuntarse | Auto | sendPushToAll |

## Push Notifications

- **Suscripciones en DB** (`push_subscriptions`) vinculadas a userId.
- **Auto-sync**: SwRegister re-envía la suscripción al servidor en cada carga de página.
- **sendPushFiltered()**: al crear pachanga, solo notifica a usuarios cuyas preferencias coincidan (categoría, nivel, pista).
- **sendPushToAll()**: al apuntarse alguien, notifica a todos.
- **Preferencias configurables**: nuevas pachangas (con filtros de categoría/nivel/pista), plazas libres, recordatorios (30min/1h/2h), alguien se apunta a mi pachanga.

## Variables de entorno (.env)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL (usa `db` hostname en Docker) |
| `NEXTAUTH_SECRET` | JWT session secret |
| `NEXTAUTH_URL` | URL base (cambiar para tunnel/producción) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_SUBJECT` | VAPID subject (mailto:) |

## Convenciones de código

- **Server components** por defecto, `"use client"` solo para interactividad.
- **Mobile-first** con `md:` breakpoint. Pattern `md:hidden` / `hidden md:block`.
- **`cn()`** para clases condicionales, **Tailwind puro**.
- **Auth en API routes**: `getServerSession(authOptions)` para obtener userId real.
- **Paquetes en Docker**: siempre `docker exec montesina-web npm install <pkg>`.
- **Prisma tras cambio schema**: migrar + `prisma generate` dentro del container + restart.

## Qué falta por hacer

- **Chat funcional**: WebSocket o polling para mensajes en tiempo real en el detalle.
- **Editar perfil**: página `/perfil/editar` para cambiar nivel, género, nombre.
- **Comunidad**: la ruta `/comunidad` del nav no tiene página.
- **Recordatorios automáticos**: cron job que envíe push X minutos antes de una pachanga según las prefs del usuario.
- **Cancelar pachanga**: el organizador debería poder cancelar y notificar a todos los participantes.
- **Tests**: Playwright para e2e de los flujos principales.
- **Producción**: dominio real, HTTPS, NEXTAUTH_URL de producción, secret seguro.
