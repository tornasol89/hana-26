# Hana 🌸

> Plataforma de servicios **hecha por mujeres, para mujeres** en Chile. Conecta
> clientas con trabajadoras profesionales (manicuristas, limpiadoras, gasfíteres,
> profesoras y más) en un flujo end-to-end: descubrimiento, reserva, chat y reseñas.

Hana está construida sobre el stack **MERN** con TypeScript en el frontend y
Node.js (ESM) en el backend. El código sigue de forma deliberada un diseño
**modular y escalable**, para que la plataforma sea mantenible a medida que crece
la base de usuarias y se agregan nuevas verticales de servicio.

---

## 📑 Tabla de contenidos

- [Características](#-características)
- [Stack técnico](#-stack-técnico)
- [Arquitectura](#-arquitectura)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Modelo de datos](#-modelo-de-datos)
- [Requisitos previos](#-requisitos-previos)
- [Setup local](#-setup-local)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts útiles](#-scripts-útiles)
- [Testing](#-testing)
- [Seguridad](#-seguridad)
- [Despliegue](#-despliegue)
- [Convenciones de código](#-convenciones-de-código)
- [Roadmap y pendientes](#-roadmap-y-pendientes)
- [Equipo](#-equipo)

---

## ✨ Características

- **Autenticación por roles** — tres tipos de usuaria: `clienta`, `trabajadora` y `admin`, con JWT.
- **Perfiles profesionales** — creación/edición con validación visible, verificación de carnet (frente y dorso) y portafolio de trabajos.
- **Buscador con filtros** — por categoría, subcategoría, región y comuna, sincronizados con el backend como *source of truth*.
- **Reservas end-to-end** — con protección **anti-overbooking**: bloqueo de slots consciente de intervalos e índice único parcial `{ trabajadora, fecha }`.
- **Chat clienta–trabajadora** — mensajería con **cifrado en reposo (AES-256-GCM)** sobre el campo del mensaje.
- **Reseñas mutuas** — con métricas opcionales entre clienta y trabajadora.
- **Panel de administración** — gestión de usuarias, verificación de carnets, disputas y sugerencias.
- **Normalización de datos** — capitalización de nombres, validación de RUT chileno (módulo 11), edad mínima 18 y manejo de zona horaria de Chile.

---

## 🛠 Stack técnico

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TanStack Query** (data fetching y mutaciones)
- **shadcn/ui** + **Tailwind CSS**
- **React Router** + **axios** + **sonner**

### Backend
- **Node.js** con **Express** (ESM — `import`/`export`, extensiones `.js` explícitas)
- **Mongoose** sobre **MongoDB Atlas**
- **JWT** + **bcryptjs** para autenticación
- **Cloudinary** para almacenamiento de imágenes (fotos y carnets)
- **Resend** para verificación de email *(en rama `feat/verificacion-email`, pendiente de merge)*
- **helmet** + **express-rate-limit** para hardening

### Infraestructura
- **Frontend:** Vercel — `hana-26-deploy.vercel.app`
- **Backend:** Render — `hana-api-y6nu.onrender.com`
- **Base de datos:** MongoDB Atlas
- **Repositorio:** GitHub — `tornasol89/hana-26`

---

## 🏗 Arquitectura

Hana se apoya en tres principios que guían cada decisión de código:

1. **Modularidad** — módulos pequeños, reutilizables y con una única responsabilidad. En el frontend se organiza por dominio (*feature-based*); en el backend por capas.
2. **Escalabilidad** — evitar monolitos. Los componentes que superan ~300–400 líneas se refactorizan en subcomponentes lógicos.
3. **Single Source of Truth** — la lógica repetida se centraliza. Regiones, comunas y categorías se definen una sola vez, y el backend es la fuente de verdad para los enums de dominio.

### Arquitectura de despliegue (tres capas en la nube)

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  React + Vite   │─────▶│  Express (Node)  │─────▶│  MongoDB Atlas   │
│    (Vercel)     │ HTTP │    (Render)      │ ODM  │   (Mongoose)     │
└─────────────────┘      └──────────────────┘      └──────────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │  Cloudinary  │  (fotos y carnets)
                          └──────────────┘
```

### Backend por capas

El backend separa responsabilidades para que cada pieza sea testeable y reemplazable de forma aislada:

- **`config/`** — configuración de infraestructura (Mongo, Cloudinary, variables de entorno).
- **`models/`** — esquemas Mongoose con setters/getters y validación a nivel de modelo.
- **`routes/`** — endpoints HTTP delgados, agrupados por dominio.
- **`middleware/`** — auth, manejo centralizado de errores, rate limiting.
- **`services/`** — lógica de dominio (por ejemplo, `disponibilidad/` para el anti-overbooking).
- **`utils/`** — helpers puros y reutilizables (`crypto`, `timezone`, `validators`, `AppError`), expuestos vía *barrel export* (`utils/index.js`).
- **`scripts/`** — operaciones puntuales de datos, siempre con patrón *dry-run* / `--apply`.

### Frontend por dominio (feature-based)

- **`config/`** — constantes de dominio (regiones, comunas, categorías).
- **`components/`** — UI compartida (Navbar, Footer, `ProtectedRoute`) y primitivas de `components/ui/`.
- **`contexts/`** — `AuthContext` (solo estado, sin lógica).
- **`features/`** — un módulo por dominio: `auth`, `bookings`, `workers`, `reviews`, `messages`, `admin`, `portfolio`.
- **`lib/`** — cliente axios con interceptor de JWT y validadores espejo del backend.
- **`pages/`** — rutas top-level.

---

## 📂 Estructura del repositorio

```
hana-26/
├── backend/
│   ├── src/
│   │   ├── config/          # cloudinary, mongo, env
│   │   ├── models/          # esquemas Mongoose
│   │   ├── routes/          # auth, workers, bookings, reviews, messages, admin, portfolio, upload
│   │   ├── middleware/      # errorHandler, rateLimit, auth
│   │   ├── services/        # disponibilidad/ (anti-overbooking), email/
│   │   ├── utils/           # crypto, timezone, validators, AppError (+ index.js barrel)
│   │   ├── scripts/         # migraciones y operaciones puntuales (dry-run / --apply)
│   │   └── server.js
│   ├── __tests__/           # suite Vitest
│   └── .env                 # (no versionado)
│
├── frontend/
│   ├── src/
│   │   ├── config/          # constantes de dominio
│   │   ├── components/       # UI compartida + ui/ (shadcn)
│   │   ├── contexts/        # AuthContext
│   │   ├── features/        # auth, bookings, workers, reviews, messages, admin, portfolio
│   │   ├── lib/             # api.ts (axios + JWT), validators/
│   │   └── pages/           # rutas top-level
│   └── .env                 # (no versionado)
│
├── PENDIENTES-HANA.md       # backlog verificado contra main
├── hana-context.md          # documento vivo de contexto
└── README.md
```

---

## 🗃 Modelo de datos

Seis entidades Mongoose principales:

| Entidad         | Descripción                                                        |
|-----------------|--------------------------------------------------------------------|
| `User`          | Usuaria base (clienta / trabajadora / admin), auth y datos personales |
| `WorkerProfile` | Perfil profesional: categorías, modalidad, experiencia, verificación |
| `Booking`       | Reserva de un servicio, con estado y datos de agenda               |
| `Review`        | Reseña mutua con métricas opcionales                               |
| `Message`       | Mensaje de chat, con `texto` cifrado en reposo (AES-256-GCM)       |
| `PortfolioItem` | Ítem del portafolio de trabajos de una trabajadora                 |

**Reglas de dominio destacadas:**
- Edad mínima **18 años** para clientas y trabajadoras.
- RUT normalizado (sin puntos, con guion y DV en mayúscula) solo si pasa validación módulo 11.
- Hora local resuelta con `Intl.DateTimeFormat` y zona `America/Santiago` (maneja horario de verano/invierno).
- El perfil profesional público **no** expone la fecha de nacimiento.

---

## ✅ Requisitos previos

- **Node.js** 18+ (recomendado LTS)
- **npm** 9+
- Cuenta y cluster en **MongoDB Atlas**
- Cuenta en **Cloudinary**
- *(Opcional)* Cuenta en **Resend** para verificación de email

---

## 🚀 Setup local

Clona el repositorio y levanta backend y frontend en terminales separadas.

```bash
git clone https://github.com/tornasol89/hana-26.git
cd hana-26
```

**Terminal 1 — Backend** (puerto `5001`):

```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend** (puerto `8080`; sube a `8081`/`8082` si está ocupado):

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:8080` en el navegador.

---

## 🔐 Variables de entorno

> **Nunca** commitees archivos `.env` ni credenciales reales. Los valores abajo son placeholders.

**`backend/.env`:**

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/hana
JWT_SECRET=<secreto-largo-y-aleatorio>
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
MENSAJES_ENCRYPTION_KEY=<clave-32-bytes-para-AES-256-GCM>
PORT=5001
# Solo si usas verificación de email (rama feat/verificacion-email):
# RESEND_API_KEY=<tu-resend-api-key>
```

**`frontend/.env`:**

```env
VITE_API_URL=http://localhost:5001
```

En producción, `VITE_API_URL` apunta al backend de Render (`https://hana-api-y6nu.onrender.com`).

---

## 🧰 Scripts útiles

```bash
# Verificar tipos de TypeScript (frontend)
cd frontend && npx tsc --noEmit

# Resetear caché de Vite ante comportamientos raros
rm -rf frontend/node_modules/.vite

# Correr un script de datos en modo dry-run (por defecto NO modifica nada)
cd backend && node scripts/<nombre-del-script>.js

# Aplicar realmente los cambios de un script de datos
cd backend && node scripts/<nombre-del-script>.js --apply
```

> ⚠️ **Todo script que modifica datos usa el patrón dry-run / `--apply`.** Corre siempre primero el dry-run y revisa el output antes de aplicar.

Para promover una usuaria a admin directamente en Mongo:

```js
db.users.updateOne(
  { email: "..." },
  { $set: { tipo: "admin", verificada: true, estadoVerificacion: "aprobado" } }
)
```

---

## 🧪 Testing

El backend cuenta con una suite **Vitest** (validadores, middleware de auth, esquemas `Booking` y `User`, hooks de auth y rutas de integración).

```bash
cd backend
npm test              # correr toda la suite
npm test -- --watch   # modo watch
```

---

## 🛡 Seguridad

- **Cabeceras HTTP** endurecidas con `helmet`.
- **Rate limiting** con `express-rate-limit` (`limiterRegistro` en registro, `limiterPublico` en endpoints públicos). Con `trust proxy: 1` para que Render reporte la IP real.
- **Manejo centralizado de errores** vía `middleware/errorHandler.js` + clase `AppError`, evitando fugas de errores crudos de Mongoose (CWE-209). Los errores operacionales responden con `{ mensaje }`.
- **Cifrado en reposo** de los mensajes de chat con AES-256-GCM (getters/setters transparentes de Mongoose).
- **Validación de uploads** con límites de tamaño por tipo y `fileFilter` en Cloudinary.
- **Protección de mass assignment** en endpoints de administración.

> **Posturas conocidas para discusión técnica:** el JWT se guarda en `localStorage` (vector de XSS asumido) y el cifrado es del lado del servidor (protege ante exposición de la base de datos, no ante compromiso del servidor).

---

## ☁️ Despliegue

| Componente | Plataforma | URL                              |
|------------|------------|----------------------------------|
| Frontend   | Vercel     | `hana-26-deploy.vercel.app`      |
| Backend    | Render     | `hana-api-y6nu.onrender.com`     |
| Base datos | MongoDB Atlas | —                             |

El backend corre detrás del proxy de Render, por lo que se configura `trust proxy: 1` para el rate limiting y la detección de IP.

---

## 📐 Convenciones de código

- **ESM en todo el backend** — `import`/`export`; las extensiones `.js` en los imports son obligatorias en Node ESM.
- **Mutaciones** siempre con `useMutation` de TanStack Query (no `try/catch` manual).
- **Auth** vía hooks `useLogin` / `useRegister`; `AuthContext` solo expone estado.
- **Un concern por commit** — disciplina de scope. El *track* backend y el *track* frontend se mantienen separados.
- **"Del dev más flojo"** — borrar antes que parchar; reutilizar infraestructura existente antes de crear módulos nuevos. Verificar con `grep -rn` antes de proponer código.
- **Idioma de trabajo:** español, tanto en el código de dominio como en la documentación.

---

## 🗺 Roadmap y pendientes

El backlog verificado contra `main` vive en [`PENDIENTES-HANA.md`](./PENDIENTES-HANA.md). Ítems destacados abiertos:

- Merge de `feat/verificacion-email` a `main` (verificación de email con Resend + Swagger).
- Migración de la validación manual a **Zod + react-hook-form** (`BookingForm`, `ReservarDialog`, `WorkerProfileForm` pendientes).
- Ruta backend `POST /auth/agregar-rol` (el frontend ya la llama).
- Migración del chat de *polling* (5s) a **WebSockets / Socket.IO** (#T19).
- Paquete `shared/` para unificar validadores duplicados frontend/backend (#T32).
- Diseño responsivo completo (#T33).

---

## 👥 Equipo

- **Adolfo** (`adifuzz`) — backend, seguridad y datos.
- **Solange** (`tornasol89`) — owner del repo, frontend y diseño visual.

> **Convención de coordinación:** avisar antes de tocar archivos compartidos (`server.js`) o endpoints públicos que consuma el frontend. Una rama `feat/[nombre]` por tarea.

---

<sub>Proyecto desarrollado en el marco del curso de Ingeniería de Software (PRY3111 / TPY1101) — DuocUC.</sub>
