# Montesiña Padel — Web App de Pachangas y Torneos

## Qué es esto

PWA para organizar pachangas y torneos de pádel (masculino, femenino, mixto) del club Montesiña en Pontevedra. Los socios se registran con Google o email, crean pachangas, se apuntan a partidos, organizan torneos Americano/Mexicano, comparten por WhatsApp y reciben push notifications filtradas por sus preferencias. Desplegada en producción en **pachangasmontesina.cc** con CI/CD automático.

## Stack

- **Next.js 14** (App Router, `output: "standalone"`)
- **TypeScript** strict
- **Tailwind CSS 3.4** con paleta custom neo-brutalist
- **Prisma 6** ORM → PostgreSQL 16
- **NextAuth v4** (Credentials + Google OAuth)
- **web-push** para notificaciones push (VAPID, filtradas por preferencias)
- **Framer Motion** para el logo reveal scroll-linked
- **bcryptjs** para hash de contraseñas
- **Docker** (Dockerfile.dev + Dockerfile multi-stage prod 3 stages)
- **GitHub Actions** CI/CD con `appleboy/ssh-action`
- **Nginx** reverse proxy compartido con SSL (Let's Encrypt)

## Producción

- **Dominio**: `pachangasmontesina.cc`
- **Servidor**: Oracle Cloud VPS `143.47.45.225` (Ubuntu, ARM64, 4 cores, 24GB RAM)
- **SSH**: usuario `ubuntu`, clave en `C:\Users\Nolo\Documents\oracle_config\llavelongas_minecraft_server_pay\ssh-key-2024-09-16.key`
- **CI/CD**: push a `master` → GitHub Actions → SSH → pull + build + migrate + deploy
- **Proxy compartido**: `/home/ubuntu/proxy/` con Nginx que rutea `cellarbarberstudio.com` y `pachangasmontesina.cc`
- **SSL**: Let's Encrypt con certbot, renovación automática diaria (cron 3 AM)
- **Cron recordatorios**: cada 5 min → `GET /api/cron/reminders?secret=...`
- **Admin email**: `nolomanolo990@gmail.com`

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

## Arquitectura de archivos

```
src/
├── app/
│   ├── page.tsx                        # / — Home (navy hero + próximas pachangas)
│   ├── layout.tsx                      # Root: fonts, SessionProvider, SwRegister, InstallPrompt, CompleteProfile
│   ├── manifest.ts                     # PWA manifest
│   ├── globals.css                     # Tailwind + CSS vars
│   ├── (auth)/
│   │   ├── login/page.tsx              # Login (email + Google OAuth)
│   │   └── registro/page.tsx           # Registro (nombre, email, pass, género, nivel + Google)
│   ├── pachangas/
│   │   ├── page.tsx                    # Listado + filtros (solo futuras)
│   │   ├── [id]/page.tsx              # Detalle + jugadores + apuntarme/salir + eliminar
│   │   └── nueva/page.tsx              # Wizard 4 pasos (8 días disponibles)
│   ├── torneos/
│   │   ├── page.tsx                    # Listado torneos + filtro formato
│   │   ├── [id]/page.tsx              # Detalle: clasificación + rondas + entrada resultados
│   │   └── nuevo/page.tsx              # Wizard 4 pasos crear torneo
│   ├── reservas/page.tsx               # OCULTO en nav
│   ├── perfil/page.tsx                 # Perfil + stats
│   ├── notificaciones/page.tsx         # Push manager + preferencias + guía instalación
│   ├── stats/page.tsx                  # Panel admin (solo nolomanolo990@gmail.com)
│   ├── politica-de-privacidad/page.tsx # Política de privacidad
│   ├── condiciones/page.tsx            # Condiciones del servicio
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth handler
│       │   └── register/route.ts       # POST crear cuenta (marca profileCompleted)
│       ├── pachangas/
│       │   ├── route.ts                # GET (solo futuras), POST crear (validación género)
│       │   └── [id]/
│       │       ├── route.ts            # GET detalle, DELETE eliminar (organizer only)
│       │       └── join/route.ts       # POST apuntarse (valida género), DELETE salir (notifica plaza libre)
│       ├── torneos/
│       │   ├── route.ts                # GET listar, POST crear
│       │   └── [id]/
│       │       ├── route.ts            # GET detalle, DELETE eliminar
│       │       ├── players/route.ts    # POST añadir jugadores
│       │       ├── players/[playerId]/route.ts  # DELETE quitar jugador
│       │       ├── start/route.ts      # POST iniciar torneo
│       │       ├── rounds/generate/route.ts     # POST generar ronda
│       │       ├── matches/[matchId]/route.ts   # PUT meter resultado
│       │       └── finish/route.ts     # POST finalizar
│       ├── courts/route.ts             # GET listar, POST crear personalizada
│       ├── profile/route.ts            # GET perfil + stats, PUT actualizar género/nivel
│       ├── users/search/route.ts       # GET buscar usuarios (para torneos)
│       ├── stats/route.ts              # GET estadísticas admin (solo admin)
│       ├── notifications/prefs/route.ts # GET/PUT preferencias push
│       ├── cron/reminders/route.ts     # GET recordatorios (protegido por CRON_SECRET)
│       ├── health/route.ts             # GET health check (ping DB)
│       └── push/
│           ├── subscribe/route.ts      # POST/DELETE suscripción push
│           └── send/route.ts           # POST push de prueba (solo al propio usuario)
│
├── components/
│   ├── layout/
│   │   ├── site-header.tsx             # Header con nav: Pachangas, Torneos, Comunidad
│   │   ├── site-footer.tsx             # Footer con links privacidad/condiciones
│   │   ├── mobile-tabs.tsx             # Bottom tabs: Inicio / Pachangas / Torneos / Yo
│   │   ├── logo-reveal.tsx
│   │   ├── user-menu.tsx
│   │   ├── session-provider.tsx
│   │   └── sw-register.tsx
│   ├── features/
│   │   ├── push-manager.tsx            # Push UI + guía instalación según dispositivo
│   │   ├── install-prompt.tsx          # Onboarding instalación PWA (oculto para crawlers)
│   │   └── complete-profile.tsx        # Popup género+nivel para usuarios Google nuevos
│   └── ui/                             # 16+ primitivas reutilizables
│
├── lib/
│   ├── utils.ts                        # cn() = clsx + tailwind-merge
│   ├── types.ts                        # Tipos compartidos
│   ├── db.ts                           # Prisma client singleton
│   ├── auth.ts                         # NextAuth config (Credentials + Google)
│   ├── tournament-logic.ts             # Algoritmos Americano + Mexicano
│   └── services/
│       ├── push.ts                     # sendPushToAll, sendPushFiltered, sendPushToParticipants, sendPushPlazaLibre, processReminders
│       └── push-client.ts             # Push API browser-side

proxy/                                  # Proxy compartido (se copia al servidor)
├── docker-compose.yml
├── nginx.conf
├── conf.d/cellar.conf
├── conf.d/montesina.conf
└── init-ssl.sh

scripts/
└── setup-server.sh                     # Setup one-time del servidor
```

## Base de datos

### Modelos

| Modelo | Descripción |
|--------|-------------|
| `User` | Socios. name, email, password (nullable para Google), gender, level, profileCompleted, image. |
| `Account` | NextAuth: cuentas OAuth vinculadas (Google). |
| `Session` | NextAuth: sesiones. |
| `Pachanga` | Partidos. category (M/F/X), date, duration, court, levelMin-Max, price, status. |
| `Participation` | User↔Pachanga. Status: CONFIRMED / WAITLIST / CANCELLED. reminderSentAt para evitar duplicados. |
| `Court` | 3 del club (isClub=true) + personalizadas creadas por usuarios. |
| `ChatMessage` | Mensajes del chat de cada pachanga. |
| `NotificationPrefs` | Preferencias push: categorías, nivel, pista, recordatorios, plazaLibre, alguienSeApunta. |
| `PushSubscription` | Suscripciones push vinculadas a userId. |
| `Tournament` | Torneos. format (AMERICANO/MEXICANO), category, status (DRAFT→OPEN→IN_PROGRESS→FINISHED), pointsPerMatch, courtIds. |
| `TournamentPlayer` | Jugador en torneo. totalPoints acumulados. |
| `TournamentRound` | Ronda de torneo. roundNumber. |
| `TournamentMatch` | Partido de torneo. 4 jugadores (2v2), scoreTeamA/B, completed. |

### Pistas del club

| Nombre | Tipo | ID |
|--------|------|----|
| Montesiña | Outdoor | `court-montesina` |
| Lebrón | Indoor | `court-lebron` |
| Pabellón | Indoor | `court-pavillon` |

### Franjas horarias

Bloques fijos de 90 minutos. Días disponibles: hoy + 8 días hacia adelante.

## Autenticación

- **Google OAuth**: principal. Al registrarse con Google se muestra popup para elegir género y nivel (profileCompleted).
- **Email/password**: registro con bcrypt, login via NextAuth Credentials provider.
- **Sesión JWT** con userId en el token.
- **Protección**: crear pachanga/torneo y apuntarse requieren autenticación. Listados y detalles son públicos.

### Redirect URIs de Google

```
http://localhost:3000/api/auth/callback/google
https://pachangasmontesina.cc/api/auth/callback/google
```

## Validaciones de género

| Acción | Hombre | Mujer |
|--------|--------|-------|
| Crear/apuntarse pachanga M | Sí | No |
| Crear/apuntarse pachanga F | No | Sí |
| Crear/apuntarse pachanga X | Sí | Sí |
| Crear torneo M | Sí | No |
| Crear torneo F | No | Sí |
| Crear torneo X | Sí | Sí |
| Añadir jugador a torneo | Valida género vs categoría |

## Push Notifications

5 tipos implementados:

| Notificación | Cuándo | Quién recibe | Respeta prefs |
|---|---|---|---|
| **Nueva pachanga** | Al crear | Todos (filtrado por categoría/nivel/pista) | Sí |
| **Alguien se apunta** | Al unirse | Solo otros participantes de esa pachanga | Sí (alguienSeApunta) |
| **Plaza libre** | Al salir de pachanga llena | Usuarios con plazaLibre activado | Sí |
| **Recordatorio** | Cron cada 5 min | Participantes confirmados según minutesBefore | Sí |
| **Pachanga cancelada** | Al eliminar | Todos los participantes | No |

- Push de prueba solo se envía al propio usuario (no a todos).
- Crawlers de Google no ven el popup de instalación (user-agent check).

## Torneos

### Formatos
- **Americano**: parejas aleatorias cada ronda, todos juegan con todos. Puntuación individual.
- **Mexicano**: ronda 1 aleatoria, rondas siguientes emparejan por ranking (1º+2º vs 3º+4º).

### Flujo
```
Crear → Añadir jugadores (invitación) → Iniciar (genera ronda 1)
→ Meter resultados → Generar ronda 2 → ... → Finalizar
```

### Reglas
- Mínimo 4 jugadores
- Puntos por partido: 21, 24 o 32 (configurable)
- scoreTeamA + scoreTeamB = pointsPerMatch
- Si jugadores impar, 1 descansa cada ronda
- Solo el organizador mete resultados y gestiona el torneo

## Panel de estadísticas (/stats)

Solo accesible para `nolomanolo990@gmail.com`. Incluye:
- KPIs: usuarios, activos, nuevos, pachangas, llenado, push subs
- Usuarios: género, nivel, método registro, top jugadores
- Pachangas: categoría, pista, día semana, franja horaria, completado
- Tendencias: pachangas y participaciones por semana (8 semanas)

## Variables de entorno (.env)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL (usa `db` hostname en Docker) |
| `NEXTAUTH_SECRET` | JWT session secret |
| `NEXTAUTH_URL` | URL base (`https://pachangasmontesina.cc` en prod) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_SUBJECT` | VAPID subject (mailto:) |
| `CRON_SECRET` | Secret para endpoint de recordatorios |
| `POSTGRES_DB` | Nombre de la DB (prod) |
| `POSTGRES_USER` | Usuario DB (prod) |
| `POSTGRES_PASSWORD` | Password DB (prod) |

## Convenciones de código

- **Server components** por defecto, `"use client"` solo para interactividad.
- **Mobile-first** con `md:` breakpoint. Pattern `md:hidden` / `hidden md:block`.
- **`cn()`** para clases condicionales, **Tailwind puro**.
- **Auth en API routes**: `getServerSession(authOptions)` para obtener userId real.
- **Paquetes en Docker**: siempre `docker exec montesina-web npm install <pkg>`.
- **Prisma tras cambio schema**: migrar + `prisma generate` dentro del container + restart.
- **Wizards**: 4 pasos con useState + patch(), StepIndicator, sticky footer.
- **Detail pages**: two-column desktop (main + sidebar 320px), stacked mobile.
- **Push notifications**: async (no bloquean la response), errores logueados.

## Qué falta por hacer

- **Chat funcional**: WebSocket o polling para mensajes en tiempo real.
- **Editar perfil**: página `/perfil/editar` para cambiar nivel, género, nombre.
- **Comunidad**: la ruta `/comunidad` del nav no tiene página.
- **Tests**: Playwright para e2e de los flujos principales.
- **Torneos avanzados**: Mix Americano (parejas mixtas obligatorias), Team Americano (parejas fijas).
