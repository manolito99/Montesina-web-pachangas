# Montesiña Padel — Web App de Pachangas y Torneos

## Qué es esto

PWA para organizar pachangas y torneos de pádel (masculino, femenino, mixto) del club Montesiña en Pontevedra. Los socios se registran con Google o email, crean pachangas, se apuntan a partidos, organizan torneos (Americano / Mexicano / Personalizado), añaden jugadores externos sin cuenta, comparten por WhatsApp, exportan al calendario y reciben push notifications filtradas por sus preferencias. Desplegada en producción en **pachangasmontesina.cc** con CI/CD automático.

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
- **Servidor**: Oracle Cloud VPS `143.47.45.225` (Ubuntu, ARM64, 4 cores, 24GB RAM, 45GB disco)
- **SSH**: usuario `ubuntu`, clave en `C:\Users\Nolo\Documents\oracle_config\llavelongas_minecraft_server_pay\ssh-key-2024-09-16.key`
- **CI/CD**: push a `master` → GitHub Actions → SSH → pull + build (web + migrate explícitos) + migrate + deploy + prune agresivo
- **Proxy compartido**: `/home/ubuntu/proxy/` con Nginx que rutea `cellarbarberstudio.com` y `pachangasmontesina.cc`
- **SSL**: Let's Encrypt con certbot, renovación automática diaria (cron 3 AM)
- **Cron recordatorios**: cada 5 min → `GET /api/cron/reminders?secret=...`
- **OCI CLI** instalado en `~/.local/bin/oci` (sin configurar todavía)
- **Admin email**: `nolomanolo990@gmail.com` (definido en `src/lib/admin.ts`)

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
npm run test:e2e         # Playwright e2e (host: requiere dev server arriba y DB expuesta en localhost:5432)
npm run test:e2e:ui      # Playwright en modo UI
```

E2E:
```bash
# Desde el host Windows (Playwright corre fuera del container Alpine):
DATABASE_URL="postgresql://montesina:montesina@localhost:5432/montesina?schema=public" \
  PLAYWRIGHT_BASE_URL="http://localhost:3000" \
  npx playwright test
```
Los specs viven en `e2e/`. `e2e/helpers/fixtures.ts` siembra usuarios `e2e-{alice,bob,carol}@test.local` y una pachanga mixta antes de cada test, y los borra después. **Importante**: requiere `NEXTAUTH_URL=http://localhost:3000` en `.env` para que NextAuth no marque las cookies como `Secure` (que se ignoran sobre HTTP).

Docker:
```bash
docker compose up -d --build                    # dev con hot-reload
docker compose -f docker-compose.prod.yml up -d --build  # prod
docker exec montesina-web npm install <pkg>     # instalar paquetes DENTRO del container
docker exec montesina-web npx prisma generate   # regenerar client tras cambio de schema
docker exec -e DATABASE_URL="postgresql://montesina:montesina@db:5432/montesina?schema=public" montesina-web npx prisma migrate dev --name <nombre>

# Para tests rápidos contra DB local
docker exec montesina-web npx tsx archivo.ts
```

## Arquitectura de archivos

```
src/
├── app/
│   ├── page.tsx                            # / — Home (navy hero + próximas pachangas)
│   ├── layout.tsx                          # Root: fonts, SessionProvider, SwRegister, InstallPrompt, CompleteProfile, FontSizeProvider
│   ├── manifest.ts                         # PWA manifest
│   ├── globals.css                         # Tailwind + CSS vars
│   ├── (auth)/
│   │   ├── login/page.tsx                  # Login (email + Google OAuth)
│   │   └── registro/page.tsx               # Registro (nombre, email, pass, género, nivel + Google)
│   ├── pachangas/
│   │   ├── page.tsx                        # Listado dividido en "Activas" / "Completas"
│   │   ├── [id]/page.tsx                   # Detalle + jugadores + apuntarme/salir + eliminar + Añadir al calendario (.ics)
│   │   └── nueva/page.tsx                  # Wizard 4 pasos (8 días disponibles)
│   ├── torneos/
│   │   ├── page.tsx                        # Listado + filtro formato + swipe-to-delete (organizer/admin)
│   │   ├── [id]/page.tsx                   # Detalle: clasificación + rondas + score + timer + add/retire players
│   │   └── nuevo/page.tsx                  # Wizard 4 pasos crear torneo
│   ├── reservas/page.tsx                   # OCULTO en nav
│   ├── perfil/page.tsx                     # Perfil + stats + selector de tamaño de texto
│   ├── notificaciones/page.tsx             # Push manager + preferencias + guía instalación
│   ├── stats/page.tsx                      # Panel admin (solo nolomanolo990@gmail.com)
│   ├── politica-de-privacidad/page.tsx     # Política de privacidad
│   ├── condiciones/page.tsx                # Condiciones del servicio
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts      # NextAuth handler
│       │   └── register/route.ts           # POST crear cuenta (marca profileCompleted)
│       ├── pachangas/
│       │   ├── route.ts                    # GET (solo futuras, dividido activas/completas), POST crear (validación género)
│       │   └── [id]/
│       │       ├── route.ts                # GET detalle, DELETE eliminar (organizer/admin)
│       │       └── join/route.ts           # POST apuntarse (valida género), DELETE salir (notifica plaza libre)
│       ├── torneos/
│       │   ├── route.ts                    # GET listar, POST crear (acepta freeScoring, matchDurationMin, guests)
│       │   └── [id]/
│       │       ├── route.ts                # GET detalle (con active, freeScoring, matchDurationMin), DELETE (admin override)
│       │       ├── players/route.ts        # POST añadir jugadores (incluso en IN_PROGRESS)
│       │       ├── players/[playerId]/route.ts  # DELETE: retirar/borrar según estado, PUT: reactivar
│       │       ├── start/route.ts          # POST iniciar (acepta numCourts opcional)
│       │       ├── rounds/generate/route.ts # POST generar ronda (acepta numCourts, filtra active=true)
│       │       ├── matches/[matchId]/route.ts # PUT meter resultado (respeta freeScoring)
│       │       └── finish/route.ts         # POST finalizar
│       ├── courts/route.ts                 # GET listar, POST crear personalizada
│       ├── profile/route.ts                # GET perfil + stats, PUT actualizar género/nivel
│       ├── users/search/route.ts           # GET buscar usuarios (para torneos)
│       ├── stats/route.ts                  # GET estadísticas admin (solo admin)
│       ├── notifications/prefs/route.ts    # GET/PUT preferencias push
│       ├── cron/reminders/route.ts         # GET recordatorios (protegido por CRON_SECRET)
│       ├── health/route.ts                 # GET health check (ping DB)
│       └── push/
│           ├── subscribe/route.ts          # POST/DELETE suscripción push
│           └── send/route.ts               # POST push de prueba (solo al propio usuario)
│
├── components/
│   ├── layout/
│   │   ├── site-header.tsx                 # Header con nav: Pachangas, Torneos, Comunidad
│   │   ├── site-footer.tsx                 # Footer con links privacidad/condiciones
│   │   ├── mobile-tabs.tsx                 # Bottom tabs: Inicio / Pachangas / Torneos / Yo
│   │   ├── logo-reveal.tsx
│   │   ├── user-menu.tsx
│   │   ├── session-provider.tsx
│   │   └── sw-register.tsx
│   ├── features/
│   │   ├── push-manager.tsx                # Push UI + guía instalación según dispositivo
│   │   ├── install-prompt.tsx              # Onboarding instalación PWA (oculto para crawlers)
│   │   ├── complete-profile.tsx            # Popup género+nivel para usuarios Google nuevos
│   │   └── font-size-provider.tsx          # Aplica zoom + font-size del body (Normal/Grande/Muy grande)
│   └── ui/                                 # 16+ primitivas reutilizables
│
├── lib/
│   ├── utils.ts                            # cn() = clsx + tailwind-merge
│   ├── types.ts                            # Tipos compartidos
│   ├── db.ts                               # Prisma client singleton
│   ├── auth.ts                             # NextAuth config (Credentials + Google)
│   ├── admin.ts                            # ADMIN_EMAILS array + isAdmin(email) helper
│   ├── tournament-logic.ts                 # Algoritmos Americano + Mexicano + balance de partidos jugados
│   └── services/
│       ├── push.ts                         # sendPushToAll, sendPushFiltered, sendPushToParticipants, sendPushPlazaLibre, processReminders
│       └── push-client.ts                  # Push API browser-side

proxy/                                       # Proxy compartido (se copia al servidor)
├── docker-compose.yml
├── nginx.conf
├── conf.d/cellar.conf
├── conf.d/montesina.conf
└── init-ssl.sh

scripts/
├── setup-server.sh                         # Setup one-time del servidor
└── examples/
    └── simulacion-torneo-sabado.ts         # Simulación de ejemplo: 21 jugadores en 8 rondas
```

## Base de datos

### Modelos principales

| Modelo | Descripción |
|--------|-------------|
| `User` | Socios. name, email, password (nullable para Google), gender, level, profileCompleted, image. |
| `Account`, `Session` | NextAuth. |
| `Pachanga` | Partidos. category (M/F/X), date, duration, court, levelMin-Max, price, status. |
| `Participation` | User↔Pachanga. Status: CONFIRMED / WAITLIST / CANCELLED. reminderSentAt evita duplicados. |
| `Court` | 3 del club (isClub=true) + personalizadas creadas por usuarios. |
| `ChatMessage` | Mensajes del chat de cada pachanga. |
| `NotificationPrefs` | Preferencias push: categorías, nivel, pista, recordatorios, plazaLibre, alguienSeApunta. |
| `PushSubscription` | Suscripciones push vinculadas a userId. |

### Modelos de torneos

| Modelo | Descripción |
|--------|-------------|
| `Tournament` | Torneos. format (AMERICANO/MEXICANO/PERSONALIZADO), category, status (DRAFT→OPEN→IN_PROGRESS→FINISHED), pointsPerMatch, **freeScoring**, **matchDurationMin**, courtIds. |
| `TournamentPlayer` | Jugador en torneo. **userId nullable** (para externos), **guestName**, totalPoints, **active** (retirado/reactivar). |
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

- **Google OAuth**: principal. Popup de completar perfil para Google users nuevos.
- **Email/password**: registro con bcrypt + NextAuth Credentials.
- **Sesión JWT** con userId en el token.
- **Protección**: crear/apuntarse requiere auth. Listados/detalles son públicos.

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
| Añadir jugador (registrado) a torneo | Valida género vs categoría |
| Añadir jugador externo (guest) | Sin validación de género (no tienen perfil) |

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

| Formato | Emparejamiento | Puntuación | Otros |
|---------|----------------|------------|-------|
| **Americano** | Aleatorio con prioridad a quien menos ha jugado, evita repetir compañeros | Puntos por partido fijos (21/24/32) | — |
| **Mexicano** | Ronda 1 aleatoria. Resto por ranking (1º+2º vs 3º+4º) | Puntos por partido fijos | — |
| **Personalizado** | Como Americano (random + balance) | **Libre** (5-3, 6-4, 7-5) | **Timer 20min** configurable, **pistas variables por ronda** |

### Algoritmo Americano balanceado

1. Antes de emparejar, ordena los jugadores activos por **partidos jugados ascendente** (los nuevos / retirados-reactivados primero)
2. Empareja greedy evitando compañeros repetidos
3. Si jugadores impar, los que han jugado MÁS descansan
4. **Garantía**: con N jugadores y M slots, diferencia max-min ≤ 1 partido

### Sistema de jugadores

- **Registrados** (usuarios del club): se buscan en dropdown filtrado por género del torneo
- **Externos** (guests): sin cuenta, solo nombre. Cuentan igual: forman parejas, suman puntos, aparecen en ranking
- **Activos / Retirados** (`active` boolean):
  - Se pueden marcar como retirados durante IN_PROGRESS (sin borrar la entrada)
  - Sus puntos se conservan en la clasificación
  - El generador filtra solo `active=true`
  - Partner history del histórico se respeta (no repite compañeros antiguos al volver)
  - Bloqueado si tienen partido pendiente en la ronda actual

### Flujo de gestión de jugadores

| Estado | Añadir | Retirar | Reactivar | Eliminar (borrado real) |
|--------|:---:|:---:|:---:|:---:|
| DRAFT | Sí | — | — | Sí |
| OPEN | Sí | — | — | Sí |
| **IN_PROGRESS** | **Sí** | Sí (active=false) | Sí (active=true) | No |
| FINISHED | No | No | No | No |

### Match Timer (Personalizado)

- Cada partido tiene botón "▶ Iniciar timer (Xmin)"
- Countdown en el navegador, persiste en localStorage por matchId
- Cuando llega a 0: badge rojo parpadeante + cuenta tiempo extra (+1:34)
- No para el partido automáticamente, solo avisa

### Pistas variables por ronda

- Al pulsar "Iniciar torneo" o "Generar siguiente ronda" en un torneo **Personalizado**:
  - Aparece prompt: *"¿Cuántas pistas para esta ronda? (1-20)"*
  - Default = pistas del torneo
- Permite escenarios reales: bloque 1 con 2 pistas, bloque 2 con 3 pistas, etc.

### Permisos

- Organizador y admin: gestionan jugadores, generan rondas, meten resultados, eliminan
- Cualquier usuario: ver detalle, clasificación, rondas
- Admin (`nolomanolo990@gmail.com`): override total — puede borrar/gestionar cualquier torneo en cualquier estado

## Panel de estadísticas (/stats)

Solo accesible para `nolomanolo990@gmail.com` (validado con `isAdmin(email)`):
- KPIs: usuarios, activos, nuevos, pachangas, llenado, push subs
- Usuarios: género, nivel, método registro, top jugadores
- Pachangas: categoría, pista, día semana, franja horaria, completado
- Tendencias: pachangas y participaciones por semana (8 semanas)

## Features de accesibilidad / UX

### Selector de tamaño de texto
- En perfil → pestaña Stats: 3 opciones (Normal / Grande / Muy grande)
- **Normal**: no aplica nada (CRÍTICO — evitar `body.zoom: 1` que rompe `position: fixed` en iOS)
- **Grande**: zoom 1.1 + font-size 18px
- **Muy grande**: zoom 1.2 + font-size 20px
- Persiste en localStorage

### Añadir al calendario (.ics)
- En el detalle de cada pachanga, botón "Añadir al calendario"
- Genera fichero `.ics` con título, ubicación, duración, descripción + alarma a 1h
- iOS Calendar / Google Calendar / Outlook / etc.

### Swipe-to-delete
- Listado de torneos: deslizas card → botón rojo "Eliminar"
- Solo visible si eres organizador o admin
- Detección de dirección (horizontal vs vertical) para no interferir con scroll
- `touch-action: pan-y` para que iOS sepa que el scroll vertical es nativo

## Variables de entorno (.env)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL (usa `db` hostname en Docker) |
| `NEXTAUTH_SECRET` | JWT session secret |
| `NEXTAUTH_URL` | URL base (`https://pachangasmontesina.cc` en prod) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Push notifications |
| `CRON_SECRET` | Secret para endpoint de recordatorios |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | DB (prod) |

## Convenciones de código

- **Server components** por defecto, `"use client"` solo para interactividad.
- **Mobile-first** con `md:` breakpoint. Pattern `md:hidden` / `hidden md:block`.
- **`cn()`** para clases condicionales, **Tailwind puro**.
- **Auth en API routes**: `getServerSession(authOptions)` para obtener userId real.
- **Admin override**: `if (!isAdmin(userEmail) && tournament.organizerId !== userId) return 403`
- **Paquetes en Docker**: `docker exec montesina-web npm install <pkg>`.
- **Prisma tras cambio schema**: migrar + `prisma generate` dentro del container + `docker compose restart web`.
- **Wizards**: 4 pasos con useState + patch(), StepIndicator, sticky footer **bottom-0** con `env(safe-area-inset-bottom)`.
- **Detail pages**: two-column desktop (main + sidebar 320px), stacked mobile.
- **Push notifications**: async (no bloquean la response), errores logueados.
- **Tests**: ad-hoc scripts en raíz con tsx → ejecutar con `docker exec montesina-web npx tsx test-*.ts` → borrar después.

## Bugs conocidos / cosas a evitar

- **`body.style.zoom = "1"` en iOS**: rompe `position: fixed`. La FontSizeProvider solo aplica zoom cuando size ≠ "normal".
- **Cascade delete de torneos**: `TournamentMatch` referencia a `TournamentPlayer` sin `onDelete: Cascade`. El endpoint DELETE borra manualmente en orden: matches → rounds → players → tournament.
- **`bottom-[68px]` en wizards**: usa `bottom-0` con `env(safe-area-inset-bottom)`, no reserves espacio para una MobileTabs que no se renderiza ahí.
- **CI/CD docker compose build**: incluir explícitamente `web migrate` para que el servicio migrate también se reconstruya.

## Qué falta por hacer

- **Editar perfil**: página `/perfil/editar` para cambiar nivel, género, nombre.
- **Comunidad**: la ruta `/comunidad` del nav no tiene página.
- **Tests automatizados**: ampliar suite Playwright (de momento solo chat) al resto de flujos (apuntarse, torneos, push prefs).
- **Chat realtime**: el chat usa polling cada 5s; migrar a WebSocket/SSE si el tráfico crece.
- **Torneos avanzados**: Mix Americano (parejas mixtas obligatorias), Team Americano (parejas fijas).
- **Planificación horaria**: actualmente las pistas variables se hacen ronda a ronda, no hay bloques de tiempo automatizados.
