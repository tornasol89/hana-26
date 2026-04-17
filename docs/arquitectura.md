# 🏗️ ARQUITECTURA DEL SISTEMA HANA

## 1. Visión General

Hana es una plataforma digital que conecta mujeres que ofrecen servicios profesionales con mujeres que los necesitan. La arquitectura está diseñada en 3 capas (frontend, backend, base de datos) para garantizar escalabilidad, seguridad y mantenibilidad.

---

## 2. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                             │
│                  (Frontend - React + Vite)                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────┐ │
│  │    Home      │  Búsqueda    │   Perfiles   │   Admin Panel    │ │
│  │  (público)   │  (trabajad.) │  (privado)   │  (administrador) │ │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘ │
│                                                                     │
│  🎨 Tailwind CSS (tema custom Hana)                               │
│  🔄 React Router (navegación SPA)                                 │
│  📡 Axios (HTTP requests)                                         │
│  🛡️ JWT localStorage (autenticación)                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA                                   │
│                (Backend - Node.js + Express)                        │
│  ┌────────────┬─────────────┬──────────────┬────────────────────┐  │
│  │  /api/auth │  /api/workers│ /api/bookings│ /api/reviews      │  │
│  │            │              │              │ /api/messages     │  │
│  │ Login      │ Buscar       │ Reservar     │ Evaluaciones      │  │
│  │ Registro   │ Perfiles     │ Aceptar/Rech.│ Chat              │  │
│  └────────────┴─────────────┴──────────────┴────────────────────┘  │
│                                                                     │
│  🔐 Middleware de Autenticación (JWT)                             │
│  🛡️ CORS (seguridad cross-origin)                                 │
│  ✅ Validación de datos (express-validator)                       │
│  ⏱️  Rate Limiting (protección contra ataques)                    │
│  📧 Nodemailer (notificaciones email)                             │
│  ☁️  Cloudinary (almacenamiento fotos)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │ MongoDB Protocol
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                                    │
│            (MongoDB Atlas - Base de Datos en Cloud)                 │
│  ┌──────────┬──────────────┬──────────────┬────────────┬──────────┐ │
│  │  Users   │ WorkerProfile│  Bookings    │  Reviews   │ Messages │ │
│  │ (identid)│ (experencia) │ (reservas)   │ (evalua)   │ (chat)   │ │
│  └──────────┴──────────────┴──────────────┴────────────┴──────────┘ │
│                                                                     │
│  📦 Mongoose ODM (esquemas y validación)                          │
│  🔗 Relaciones entre colecciones (1:1, 1:N, N:M)                 │
│  🔐 Índices optimizados (búsquedas rápidas)                       │
│  ☁️  Cloudinary (almacenamiento de imágenes externo)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Autenticación

### 3.1 Registro de Nueva Usuaria

```
1. Usuaria llena formulario (nombre, email, password, tipo)
   ↓
2. Frontend envía POST /api/auth/register
   ↓
3. Backend valida:
   ✓ Email no exista
   ✓ Password >= 6 caracteres
   ✓ Tipo es 'clienta' o 'trabajadora'
   ↓
4. Backend encripta password con bcryptjs
   ↓
5. Backend crea documento User en MongoDB
   ↓
6. Backend genera JWT token (válido 30 días)
   ↓
7. Frontend recibe { token, usuario }
   ↓
8. Frontend guarda token en localStorage
   ↓
9. Usuaria ve Home logueada
```

### 3.2 Login

```
1. Usuaria ingresa email + password
   ↓
2. Frontend POST /api/auth/login
   ↓
3. Backend busca User con ese email
   ↓
4. Backend compara password con bcrypt
   ↓
5. Si correcto → genera JWT token
   ↓
6. Si incorrecto → devuelve error 400
   ↓
7. Frontend usa token para requests posteriores
   ↓
8. Cada request incluye: Authorization: Bearer {token}
```

### 3.3 Acceso a Rutas Privadas

```
1. Usuaria intenta acceder a /mi-perfil
   ↓
2. Frontend verifica si localStorage.token existe
   ↓
3. Si NO existe → redirige a /login
   ↓
4. Si existe → agrega token en header
   ↓
5. Backend middleware protegerRuta valida JWT
   ↓
6. Si JWT válido → permite acceso
   ↓
7. Si JWT expirado/inválido → error 401 → redirige a /login
```

---

## 4. Stack Tecnológico y Justificación

### Frontend

| Tecnología | Versión | Por qué la elegimos |
|---|---|---|
| **React** | 19 | Componentes reutilizables, gran comunidad, rendering eficiente |
| **Vite** | 8 | Build tool ultrarrápido (dev server < 100ms), optimización automática |
| **Tailwind CSS** | 4 | Utility-first CSS, código más limpio, tema custom fácil de mantener |
| **React Router** | 7 | Navegación SPA sin recargar página, rutas por rol |
| **Axios** | 1.13 | HTTP client simple, interceptores para JWT automático |

### Backend

| Tecnología | Versión | Por qué la elegimos |
|---|---|---|
| **Node.js** | 18+ | JavaScript en servidor, no-blocking I/O, perfecta para APIs |
| **Express** | 4.18 | Servidor HTTP minimalista, flexible, middleware pattern |
| **Mongoose** | 7 | ODM para MongoDB, esquemas con validación, relaciones simples |
| **JWT (jsonwebtoken)** | 9 | Autenticación sin sesiones, escalable, seguro |
| **bcryptjs** | 2.4 | Encriptación de passwords robusta, estándar industria |
| **Cloudinary** | 1.41 | Almacenamiento cloud, CDN global, optimización automática imágenes |
| **Nodemailer** | 6.9 | Envío de emails simple, múltiples proveedores |

### Database

| Tecnología | Por qué la elegimos |
|---|---|
| **MongoDB Atlas** | Cloud NoSQL, escalable horizontalmente, esquemas flexibles, backups automáticos |
| **Mongoose** | Validación en schema, métodos útiles, índices optimizados |

---

## 5. Modelos y Relaciones de Datos

### 5.1 Colecciones Principales

```
Users (usuarias del sistema)
├── _id (ObjectId único)
├── nombre, apellido, email, password (encriptado)
├── tipo: enum['clienta', 'trabajadora', 'admin']
├── región, comuna (ubicación)
├── verificada (carnet validado)
└── aceptoCompromiso (Hana terms)

WorkerProfile (perfil profesional de trabajadoras)
├── _id (ObjectId)
├── usuario (referencia a User._id) ← 1:1
├── categoria (Limpieza, Diseño, etc.)
├── descripción, tarifa/hora
├── metricas {puntualidad, confiabilidad, calidad, comunicación}
├── indiceConfianza (promedio metricas)
└── certificados []

Booking (reservas)
├── _id (ObjectId)
├── clientaId (referencia User) ← N:1
├── trabajadoraId (referencia User) ← N:1
├── servicio, descripción, fecha
├── duracion (horas), precio
├── estado: enum['pendiente', 'aceptado', 'rechazado', 'completado']
└── timestamps

Review (reseñas)
├── _id (ObjectId)
├── bookingId (referencia Booking) ← 1:1
├── reviewadoId (referencia User) ← N:1
├── puntaje (1-5), comentario
├── metricas {puntualidad, calidad, comunicación}
└── fotos []

Message (mensajes chat)
├── _id (ObjectId)
├── bookingId (referencia Booking) ← N:1
├── de (referencia User)
├── hacia (referencia User)
├── contenido, leido (boolean)
└── timestamp
```

---

## 6. Patrones de Diseño

### Backend: MVC (Model-View-Controller)

```
Models/
  ├── User.js
  ├── WorkerProfile.js
  ├── Booking.js
  ├── Review.js
  └── Message.js

Routes/ (Controllers embedded)
  ├── auth.js         → Lógica login/registro
  ├── workers.js      → Búsqueda, perfiles
  ├── bookings.js     → Reservas
  ├── reviews.js      → Evaluaciones
  ├── messages.js     → Chat
  └── admin.js        → Panel administrador

Middleware/
  ├── auth.js         → Protección JWT, roles
  └── validation.js   → Validación inputs
```

### Frontend: Component-Based

```
Pages/ (pantallas completas)
  ├── Home.jsx
  ├── Login.jsx
  ├── RegisterWorker.jsx
  ├── RegisterClient.jsx
  ├── WorkerProfile.jsx
  ├── PerfilTrabajadora.jsx
  └── PerfilAdmin.jsx

Components/ (piezas reutilizables)
  ├── Navbar.jsx
  ├── Footer.jsx
  ├── ProtectedRoute.jsx
  ├── ChatModal.jsx
  ├── EvaluarModal.jsx
  └── PhotoUpload.jsx
```

---

## 7. Seguridad Implementada

| Aspecto | Implementación |
|---|---|
| **Passwords** | Encriptadas con bcryptjs (salt 10 rounds) |
| **Autenticación** | JWT tokens con expiración 30 días |
| **CORS** | Configurado para solo frontend puede acceder |
| **Cloudinary** | Uploads seguros a servidor cloud (no local) |
| **Input Validation** | Mongoose schemas + express-validator |
| **Rate Limiting** | Protección contra brute force (en desarrollo) |
| **Roles** | Middleware soloTrabajadora, soloClienta, soloAdmin |

---

## 8. Performance y Escalabilidad

### Frontend
- **Vite bundling:** < 100KB en producción (minificado)
- **React lazy loading:** Componentes cargados bajo demanda
- **Tailwind purging:** Solo CSS usado se incluye

### Backend
- **Mongoose índices:** Email, tipo, categoría
- **Paginación:** Lista workers limitada a 10 por page
- **Cloudinary CDN:** Imágenes distribuidas globalmente

### Database
- **MongoDB Atlas:** Auto-scaling, backups diarios
- **Índices:** En campos frecuentemente buscados
- **Conexión pooling:** Reutilización de conexiones

---

## 9. Deployment

### Frontend (Vercel)
```
GitHub → Vercel (auto-deploy)
Rama: develop/main
URL: hana.vercel.app (ejemplo)
Environment: NODE_ENV=production
```

### Backend (Render/Railway)
```
GitHub → Render/Railway (auto-deploy)
Rama: develop/main
URL: hana-backend.render.com (ejemplo)
Environment: NODE_ENV=production, DB_URI, JWT_SECRET, etc.
```

### Database (MongoDB Atlas)
```
Cloud hosting en MongoDB
Backups automáticos diarios
Acceso protegido por IP whitelist
```

---

## 10. Resumen Técnico

- **Arquitectura:** 3 capas (presentación, lógica, datos)
- **Patrón:** MVC en backend, Component-based en frontend
- **Escalabilidad:** Horizontal (múltiples servidores posible)
- **Seguridad:** JWT + bcrypt + CORS + validación
- **Performance:** Optimización automática (Vite, Cloudinary, MongoDB)
- **Maintainability:** Código separado por responsabilidades

---

**Fecha de actualización:** 13/04/2026  
**Estado:** Documentación Semana 1 EP2  
**Responsable:** Equipo Hana (Sol + Adolfo)
