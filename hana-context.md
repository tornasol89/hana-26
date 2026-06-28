# HANA — Contexto Maestro del Proyecto

> Documento vivo. Actualizar la sección "🔄 Última sesión" cada vez que se 
> avance. El resto solo cambia si hay decisión arquitectural nueva.
>
> Última actualización: 17/05/2026

---

## 📋 Resumen ejecutivo

Hana es una plataforma de servicios "hecha por mujeres, para mujeres" en 
Chile. Conecta clientas con trabajadoras profesionales (manicuristas, 
limpiadoras, gasfiters, profesoras, etc.).A nivel técnico, la plataforma 
está diseñada bajo principios de modularidad y escalabilidad para soportar 
el crecimiento futuro de la base de usuarias y nuevas verticales de servicio. 
El producto está en fase MVP funcional con 28 usuarias de prueba en base de
datos. El producto está en fase MVP funcional con 28 usuarias de prueba en base de datos.

**Estado:** producto 100% funcional end-to-end con normalización de datos, 
validación de RUT/edad y unicidad de RUT garantizada a nivel de BD. Trabajo 
en paralelo con tornasol89 que rediseñó visualmente la web.

---

## 🛠 Stack técnico

### Backend
- Express + Mongoose
- MongoDB Atlas (cluster0.bbrcmlj.mongodb.net, DB "hana")
- JWT auth + bcryptjs
- Cloudinary (uploads de fotos y carnets)
- Puerto: **5001**

### Frontend
- React 18 + Vite 5 + TypeScript
- Tailwind v3 + shadcn/ui
- TanStack Query (data fetching + mutations)
- React Router v6 + axios + sonner
- **motion** (animaciones — agregado el 14/05 por tornasol)
- Puerto: **8080** (puede subir si está ocupado: 8081, 8082)

### Repositorios
- Repo: github.com/tornasol89/hana-26
- Rama de trabajo: feat/nuevo-frontend
- Mi cuenta GitHub: adifuzz (con permisos Write)
- Owner del repo: tornasol89
- **feature/sol: ABANDONADA, no usar**

### Carpetas locales
- Proyecto activo: /Users/adolfo/Desktop/Hana/hana-26/
- Repo viejo (referencia, read-only): /Users/adolfo/Desktop/Hana/hana-26-old/

---

## 🏗 Arquitectura del frontend (feature-based) 

src/
├── config/         → constantes (REGIONES_CHILE, COMUNAS_POR_REGION, CATEGORIAS_SERVICIO, etc.)
├── components/     → UI compartida (Navbar, Footer, ProtectedRoute, FechaNacimientoBanner, common/)
├── components/landing/ → secciones de la home (HeroSection, CategoriesSection, etc. — de tornasol)
├── components/ui/  → primitivas shadcn + extras de tornasol (text-gif, three-d-carousel, bg-animate-button, etc.)
├── contexts/       → AuthContext (solo state, no logic)
├── features/       → módulos por dominio
│   ├── auth/       → login, registro, session (hooks: useLogin, useRegister, useUpdateProfile, useLogout)
│   ├── bookings/   → reservas + anti-overbook
│   ├── workers/    → perfiles profesionales
│   ├── reviews/    → reseñas mutuas
│   ├── messages/   → chat con polling
│   ├── admin/      → panel admin
│   ├── notifications/ → hooks de notificaciones (de tornasol)
│   └── portfolio/  → portafolio de trabajos (de tornasol)
├── lib/            → api.ts (axios + JWT interceptor)
├── lib/validators/ → validators espejo del backend: capitalizarNombre, validarRut,
│                    formatearRutVisual, validarFechaNacimiento, calcularEdad, EDAD_MINIMA
└── pages/          → rutas top-level 

### Arquitectura backend

backend/src/
├── config/         → cloudinary, mongo
├── models/         → User, WorkerProfile, Booking, PortfolioItem
├── routes/         → auth, workers, bookings, reviews, messages, admin, portfolio, upload
├── utils/          → normalize.js (capitalizarNombre, normalizarRut), validators.js (validarRut, validarFechaNacimiento, calcularEdad)
└── server.js 

---

## 🎯 Decisiones arquitecturales clave

### Convenciones de código
- **Mutations** siempre con `useMutation` de TanStack Query (NO try/catch manual)
- **Auth** usa `useLogin`/`useRegister` hooks, NO `useAuth().login`
- **AuthContext** solo expone state (user, isAuthenticated, isLoading) + helpers (refreshUser, logout)
- **Validación** manual con `toast.error()` + return temprano (NO Zod por ahora — deuda técnica #B10)
- **Validators** duplicados frontend/backend pero idénticos. Deuda: refactor a paquete shared/ (#T32)
- **Lib UI** shadcn con primitivas que ya están agregadas: dropdown-menu, dialog, alert-dialog, textarea, switch, tabs

### Normalización de datos (aplicada 14/05)
- **Nombres y apellidos**: setter automático `capitalizarNombre` (respeta preposiciones es/pt/eu)
- **RUT**: setter `normalizarRut` (sin puntos, con guion + DV en mayúscula). Solo si pasa validación módulo 11
- **Email**: lowercase + trim
- **Tildes**: respetar lo que tipea el usuario (no agregar automáticas)
- **Edad mínima**: 18 años para clientas Y trabajadoras
- **Camino A en migración**: RUTs inválidos se vacían (no se normalizan)

### Datos del dominio
- **17 categorías** sincronizadas con backend (ver config/constants.ts)
- **COMUNAS_POR_REGION** en constants.ts línea 217 (agregado 14/05 por tornasol)
- **Modalidades:** A domicilio, Remoto, Retiro y entrega
- **Niveles:** Menos de 1 año, 1 a 3 años, 3 a 5 años, Más de 5 años
- **Hora local Chile** asumida UTC-3 fija (deuda técnica #B8)

### Comportamiento del producto
- Chat con **polling cada 5s** (NO websockets — pendiente #T19)
- **Anti-overbook**: endpoint `/horarios-ocupados` consulta Bookings existentes
- Compromiso obligatorio antes de registrar (sessionStorage flag)
- `/worker/:id` es **público** (no requiere login)
- Login admin redirige a `/perfil/admin`, otros a `/mi-perfil`
- WorkerProfile devuelve **404 cuando trabajadora no tiene perfil** (es by design, frontend lo maneja)
- **Fecha nacimiento ficticia**: usuarias migradas tienen flag `fechaNacimientoCorregida=false` y se muestra banner en MiPerfil para corregirla
- **Formato de fecha display**: DD/MM/AAAA (función formatearFechaVisual en lib/validators/edad.ts)

### Privacidad y session
- `aceptoCompromiso` en sessionStorage (se borra al cerrar pestaña)
- JWT en localStorage
- Imágenes de carnet y fotos en Cloudinary
- Categorías y regiones: source of truth es el backend (enum en WorkerProfile.js)
- Fecha de nacimiento NO se expone públicamente (no aparece en WorkerProfile público)

### Principios de diseño
- **Modularidad y Escalabilidad:** El código debe dividirse en módulos pequeños, reutilizables y con responsabilidades únicas (Feature-Sliced Design o similar). 
- **Evitar monolitos:** Componentes de más de 300-400 líneas (como el actual `Registro.tsx`) deben refactorizarse en sub-componentes lógicos.
- **Single Source of Truth:** Centralizar lógica repetida en paquetes o carpetas compartidas (ej. mover los validadores duplicados a un paquete `shared/`).
---

## ✅ Funcionalidades implementadas 
✅ Auth completo (login, registro, compromiso, confirmar password)
✅ MiPerfil consolidado con 5 tabs por rol
✅ Verificación de carnet (frente y dorso)
✅ Perfil profesional (crear/editar) con validación visible
✅ Buscador con filtros sincronizados + subcategorías (CategoriaSubcategoriaPicker)
✅ WorkerProfile público con métricas, stats y reseñas
✅ Reservas end-to-end con anti-overbook
✅ Reseñas mutuas con métricas opcionales
✅ Páginas estáticas (Compromiso modos informativo/aceptación + Impacto + Alianza)
✅ Navbar reactiva con dropdown
✅ Panel Admin completo (Panel + Usuarias + Verificación + Disputas + Sugerencias)
✅ Chat clienta-trabajadora con polling 5s
✅ Login y Registro refactoreados a useMutation
✅ AuthContext limpio (sin login/register duplicados)
✅ Fix puerto api.ts (#B1)
✅ Eliminación legacy: upload.js vacío, lib/workers.ts, hooks/useWorkers.ts
✅ Unificación hooks: features/profile/hooks.ts → features/auth/hooks.ts
✅ Normalización de usuarios (Fase 1+2+3): validators, modelo User, endpoint /me con validación, migración aplicada
✅ Campo fechaNacimiento obligatorio + banner para fecha ficticia
✅ Validación de RUT chileno (módulo 11) en registro + perfil
✅ Unicidad de RUT garantizada (índice unique partial + método User.verificarUnicidad)
✅ Capitalización automática de nombre/apellido
✅ Rediseño visual de tornasol: hero oscuro, TextGif, carrusel 3D de trabajadoras, gradientes en Registro, blobs decorativos
✅ Páginas nuevas: Contacto, Sugerencias, DashboardTrabajadora, PerfilClientaPublico
✅ Feature Portafolio (PortfolioItem backend + components frontend)

---

## 🔄 Última sesión

> ⚠️ ACTUALIZAR ESTA SECCIÓN AL FINAL DE CADA SESIÓN

**Fecha:** 17/05/2026  
**Duración aprox:** sesión corta (~1 hora)

### Lo que hice en esta sesión

**Validación de unicidad de RUT (cierra #T13 completo)**
- `User.js`: agregado índice `unique` + `partialFilterExpression` en `rut`.
  El filtro `{ rut: { $type: 'string', $gt: '' } }` hace que el índice ignore
  strings vacíos, así múltiples usuarias sin RUT no chocan entre sí.
- `User.js`: nuevo método estático `User.verificarUnicidad({ email, rut, ignorarId })`.
  Centraliza el chequeo de unicidad para que register, admin y futuros endpoints
  usen la misma lógica. Acepta `ignorarId` para soportar edición (guardar sin cambios).
- `auth.js POST /register`: reemplazado el chequeo manual de email por una sola
  llamada a `User.verificarUnicidad({ email, rut })`. Agregado catch defensivo
  para `error.code === 11000` (race conditions del índice único).
- `scripts/check-rut-duplicates.js`: script nuevo que detecta RUTs duplicados
  en la BD antes de aplicar el índice unique (read-only, reutilizable a futuro).

**Limpieza de BD antes del índice**
- Detectado 1 RUT duplicado: `17008236-2` compartido entre `valdebenitosol3@gmail.com`
  (Sol Valdebenito) y `karina@hana.cl` (Karina Valdebenito).
- Decisión: vaciar el RUT de `karina@hana.cl` (la cuenta nueva del 14/05 — la del
  RUT real es Sol, evidenciado por el email con apellido).
- Script puntual `clear-rut-karina.js` ejecutado con --apply. Borrado después
  de cumplir su función (no se commitea, era de un solo uso).
- Re-corrido `check-rut-duplicates.js`: ✅ sin duplicados.

### Decisiones tomadas en esta sesión
- **Unicidad de RUT a nivel BD, no solo aplicación**: índice unique en Mongo
  como defensa final, además del chequeo en el handler. Defense in depth.
- **Lógica de unicidad en el modelo, no en la ruta**: método estático
  `verificarUnicidad` en User.js para alinear con el principio "Single Source
  of Truth" y facilitar reutilización futura desde admin/PATCH (#B12 etc).
- **partialFilterExpression sobre sparse**: el default del campo `rut` es `''`
  (string vacío), no `null`. Un sparse index simple consideraría `''` como
  valor real y bloquearía la segunda usuaria sin RUT. La expresión parcial
  excluye explícitamente los strings vacíos del índice.
- **RUT duplicado**: decidir caso por caso, no automatizar. Las dos cuentas
  podían ser legítimas (parientes con error de tipeo) — no se borró ninguna,
  solo se vació el campo en la cuenta sospechosa.

### En qué estoy ahora
- **Producto**: funcional con normalización + validación RUT + unicidad de RUT
- **BD**: limpia, sin duplicados, lista para el índice unique
- **Commit pendiente**: 3 archivos en staging
  - `backend/src/models/User.js`
  - `backend/src/routes/auth.js`
  - `backend/scripts/check-rut-duplicates.js`

### Bloqueantes
- Ninguno

### Próximos pasos planeados
1. Push a branch `feat/rut-unico` y PR a main (NO commitear directo a main —
   tornasol89 hace review)
2. Considerar banner equivalente al de fechaNacimientoCorregida para usuarias
   que tenían RUT y se les vació (caso Karina) — sesión corta a futuro
3. Aplicar la misma `User.verificarUnicidad` al `PATCH /api/admin/usuarias/:id`
   (hoy no valida, podría asignar RUT duplicado y solo lo bloquea el índice
   con error feo)
4. Sesión futura: refactor Registro.tsx (#T31 — ver REFACTOR-REGISTRO.md)
5. Resolver bugs #B2, #B3, #B4 backend (seguridad)
6. Bug #B12: validación formato email

---

## 📚 Sesiones anteriores

### Sesión 14/05/2026 (sesión larga, ~6h)

**Fase 1 — Validators (módulo nuevo)**
- Backend: `backend/src/utils/{normalize,validators,index}.js`
  (capitalizarNombre con preposiciones, normalizarRut, validarRut módulo 11,
  validarFechaNacimiento, calcularEdad, esMayorDeEdad, EDAD_MINIMA=18)
- Frontend: `frontend/src/lib/validators/{nombre,rut,edad,index}.ts` (espejo)
- Helper `formatearFechaVisual` (DD/MM/AAAA)

**Fase 2 — Backend modelo + endpoint + migración**
- `User.js`: setters automáticos, fechaNacimiento required, fechaNacimientoCorregida flag, índices
- `auth.js`: formatearUsuario expone edad, POST /register valida fecha, PUT /me valida fecha si cambia
- Script `migrate-normalize-users.js` aplicado a **28 usuarios**:
  - 19 RUTs inválidos vaciados
  - 2 RUTs válidos normalizados (karina@hana.cl: 17008236-2, juana@hana.cl: 6456987-2)
  - Todos con fecha ficticia 2000-01-01 + flag corregida=false

**Fase 3 — Frontend**
- `types.ts`: agregados fechaNacimiento, fechaNacimientoCorregida, edad. RegisterPayload requiere fechaNacimiento. Nuevo UpdateProfilePayload
- `api.ts` y `hooks.ts`: usan UpdateProfilePayload
- `FechaNacimientoBanner.tsx`: banner amarillo con onCorregir callback
- `PerfilTab.tsx`: banner si fechaNacimientoCorregida=false, vista muestra RUT + fecha DD/MM/AAAA + edad
- `Registro.tsx`: mezcla visual de tornasol + lógica de validación (RUT en vivo rojo/verde, fechaNacimiento, capitalización onBlur)

**Integración con tornasol89**
- Tornasol pusheó 19 commits en paralelo (rediseño visual con motion/react, TextGif, carrusel 3D, COMUNAS_POR_REGION, páginas nuevas, Portafolio + Notifications)
- Mi Registro.tsx con fechaNacimiento + validación RUT se perdió en un git pull (nunca se commiteó) → re-aplicada sobre la versión visual de tornasol
- Tornasol importa "motion/react" sin agregarlo a package.json → `npm install motion`

**Decisiones del día**
- Edad mínima: 18 años (no 16+ con tutor)
- Capitalización con preposiciones, tildes respetadas como las tipea el usuario
- RUTs inválidos en migración: Camino A (vaciar). Solo eran 28 datos de prueba
- Banner de fechas ficticias usa flag explícito `fechaNacimientoCorregida`
- Refactor Registro.tsx postponed → REFACTOR-REGISTRO.md + #T31

---

## 📊 Backlog Trello (resumen)

Trello: https://trello.com/b/IrE2ddvq/hana

### En curso (Doing)
- ninguna por ahora

### Cerradas en esta sesión (17/05)
- ✅ #T13 completo (RUT único + validación módulo 11 + normalización)

### Cerradas el 14/05
- ✅ #T13 (parcial: parte RUT lista, falta validación formato email → bug #B12)
- ✅ #T14 (parcial: nombres/apellidos normalizados, tornasol agregó COMUNAS_POR_REGION)
- ✅ #T26 Validación edad ≥18

### Sprint actual recomendado (próximas 2 semanas)
1. #B2 Bug seguridad completar reserva     ⬅ urgente
2. #B3 User.create antes jwt.sign
3. #B4 Validar env vars al boot
4. #B5 README setup local
5. #B12 Validación formato email (nuevo)

### Próximas (To Do, top 5 después del sprint actual)
- #T28 Ver sin login (alta conversión)
- #T17+T12 Modalidad y dirección obligatoria
- #T20 Horarios exactos de trabajo
- #T30 Antecedentes (diferenciador)
- #T31 Refactor Registro.tsx modular (nuevo — ver REFACTOR-REGISTRO.md)

---

## 🐛 Bugs / deuda técnica conocidos sin resolver 

✅ #B1   Fix puerto api.ts                   (resuelto)
🔴 #B2   Bug seguridad backend completar     (15 min, vulnerabilidad)
🟠 #B3   User.create antes jwt.sign          (30 min, preventivo)
🟠 #B4   Validar env vars al boot            (30 min, deploy-ready)
🟠 #B5   README setup local                  (30 min, onboarding)
🟢 #B6   404 cosmético al crear perfil       (15 min)
🟢 #B7   Migración Metropolitana             (10 min, script Mongo)
🟢 #B8   Hora local UTC-3 fija               (deuda menor)
🟢 #B9   Sin validación duración servicio    (deuda)
🟡 #B10  Zod + react-hook-form               (refactor grande, 1-2 días)
🟢 #B11  Login.tsx legacy review             (verificar)
🟠 #B12  Validación formato email            (nuevo — Cristina Henriquez tiene "aghjjahaja") 

### Deuda técnica conocida (no son bugs)

- **Validators duplicados frontend/backend**: refactor futuro a paquete `shared/` (#T32 a crear)
- **Registro.tsx monolítico (~600 líneas)**: ver REFACTOR-REGISTRO.md, tarjeta #T31
- **motion/react agregado por tornasol**: revisar si todos los usos son necesarios o se puede simplificar
- **index.css.backup** existe en frontend (de tornasol): revisar si se puede borrar

---

## 🚀 Roadmap futuro (To Do)

### Arquitectura y Escalabilidad (Deuda técnica activa)
- #T31 Refactor Registro.tsx modular (dividir frontend monolítico)
- #T32 Shared validators package (unificar lógica de frontend y backend)
- Extraer UI compartida a la carpeta `components/common/` de forma estricta.


### Media-alta para el equipo
- #T17 Comuna y dirección obligatoria
- #T18 Trabajadora ve perfil de clienta
- #T19 WebSockets
- #T20 Horarios exactos
- #T21 Portafolio (tornasol arrancó, hay que cerrar)
- #T22 Inicio/fin sesión de trabajo
- #T30 Antecedentes (diferenciador)

### Media-baja
- #T23 Notificaciones email
- #T24 Notificación chat popup

### Baja
- #T25 Carrusel home (parcial: tornasol hizo carrusel 3D mejor evaluadas)
- #T27 Botón emergencia
- #T28 Ver sin login (yo lo subiría a media-alta)
- #T29 Reclamos y sugerencias (tornasol arrancó con páginas Sugerencias.tsx + SugerenciasTab)
- #T31 Refactor Registro.tsx modular (NUEVO)
- #T32 Shared validators package (NUEVO)

---



## 🔧 Setup local

### Variables de entorno backend (`backend/.env`) 
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5001 
### Variables de entorno frontend (`frontend/.env`) 
VITE_API_URL=http://localhost:5001 
### Comandos útiles
```bash
# Backend (terminal 1)
cd /Users/adolfo/Desktop/Hana/hana-26/backend
npm install
npm run dev

# Frontend (terminal 2)
cd /Users/adolfo/Desktop/Hana/hana-26/frontend
npm install
npm run dev

# Verificar TypeScript
cd frontend && npx tsc --noEmit

# Crear admin en Mongo
db.users.updateOne(
  { email: "..." },
  { $set: { tipo: "admin", verificada: true, estadoVerificacion: "aprobado" } }
)

# Resetear cache de Vite si hay raros
rm -rf frontend/node_modules/.vite

# Aplicar migración de normalización (NO repetir, ya se aplicó el 14/05)
cd backend
node scripts/migrate-normalize-users.js --apply
```

---

## 👥 Equipo

- **adifuzz (yo, Adolfo):** dev, owner del trabajo de migración + normalización + validación
- **tornasol89:** owner del repo, revisor de PRs, rediseño visual + carrusel 3D + portafolio
- **Equipo Hana:** stakeholders de producto

---

## 📝 Convenciones para chats con Claude

Cuando vuelva a abrir un chat con Claude para Hana:

1. **Pegar este archivo completo** como primer mensaje
2. **Agregar una línea con el objetivo de la sesión:**
   - "Quiero arrancar #T31 (refactor Registro.tsx)"
   - "Tengo un bug en X archivo, ayudame a debugear"
   - "Necesito refactorear Y"
3. **Si hay error o problema concreto:** pegar el error completo y el archivo relevante
4. **Decir si necesito código copy-pasteable o solo guidance**

### Lecciones aprendidas para próximas sesiones con Claude
- **Commitear LOCAL antes de hacer git pull**: si trabajaste en archivos sin commitear, el pull puede sobrescribirlos
- **Backup físico antes de operaciones git riesgosas**: `cp -r hana-26 hana-26-BACKUP-$(date +%H%M)` toma 5 segundos
- **Verificar con git status frecuentemente**: para saber qué hay en staging vs disco
- **Si Claude te pasa código grande, asegurar commit ANTES de hacer pull/rebase**

---

## 🔗 Links importantes

- Repo GitHub: https://github.com/tornasol89/hana-26
- PR actual: [pegar URL del PR cuando lo crees]
- Trello: https://trello.com/b/IrE2ddvq/hana
- MongoDB Atlas: cluster0.bbrcmlj.mongodb.net (DB "hana")
- Cloudinary dashboard: [URL]
- REFACTOR-REGISTRO.md: en raíz del proyecto, plan para refactorizar Registro.tsx (#T31)