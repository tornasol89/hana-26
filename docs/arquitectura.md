# Arquitectura del sistema Hana

Hana es una plataforma para conectar mujeres que ofrecen servicios (limpiadoras, diseñadoras, tutoras, etc.) con mujeres que los necesitan. La idea es simple: es como un marketplace, pero enfocado en seguridad y confianza entre mujeres.

Técnicamente el sistema está separado en 3 capas: el frontend que ve la usuaria, el backend que maneja la lógica, y la base de datos donde se guarda todo. Esto lo hicimos así porque es más fácil de mantener y escalar si el proyecto crece.

---

## Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                             │
│                  (Frontend - React + Vite)                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────┐ │
│  │    Home      │  Búsqueda    │   Perfiles   │   Admin Panel    │ │
│  │  (público)   │  (trabajad.) │  (privado)   │  (administrador) │ │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘ │
│                                                                     │
│  Tailwind CSS (tema custom Hana)                                   │
│  React Router (navegación SPA)                                     │
│  Axios (HTTP requests)                                             │
│  JWT en localStorage (autenticación)                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA                                   │
│                (Backend - Node.js + Express)                        │
│  ┌────────────┬─────────────┬──────────────┬────────────────────┐  │
│  │  /api/auth │ /api/workers│ /api/bookings│ /api/reviews       │  │
│  │            │             │              │ /api/messages      │  │
│  │ Login      │ Buscar      │ Reservar     │ Evaluaciones       │  │
│  │ Registro   │ Perfiles    │ Aceptar/Rech.│ Chat               │  │
│  └────────────┴─────────────┴──────────────┴────────────────────┘  │
│                                                                     │
│  Middleware JWT (autenticación)                                    │
│  CORS (seguridad cross-origin)                                     │
│  express-validator (validación de datos)                           │
│  Rate Limiting (protección contra ataques)                         │
│  Nodemailer (notificaciones email)                                 │
│  Cloudinary (almacenamiento fotos)                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │ MongoDB Protocol
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                                    │
│            (MongoDB Atlas - Base de Datos en Cloud)                 │
│  ┌──────────┬──────────────┬──────────────┬────────────┬──────────┐ │
│  │  Users   │WorkerProfile │  Bookings    │  Reviews   │ Messages │ │
│  └──────────┴──────────────┴──────────────┴────────────┴──────────┘ │
│                                                                     │
│  Mongoose ODM (esquemas y validación)                              │
│  Índices optimizados para búsquedas frecuentes                     │
│  Cloudinary para imágenes (no se guardan en MongoDB)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Cómo funciona la autenticación

### Registro de nueva usuaria

El flujo es bastante estándar:

1. Usuaria llena el formulario con nombre, email, password y tipo (clienta o trabajadora)
2. Frontend hace `POST /api/auth/register`
3. Backend valida que el email no exista, que el password tenga mínimo 6 caracteres, y que el tipo sea válido
4. Si todo está bien, encripta el password con bcryptjs (nunca se guarda el texto plano)
5. Crea el documento User en MongoDB
6. Genera un JWT token válido por 30 días
7. Devuelve `{ token, usuario }` al frontend
8. Frontend guarda el token en localStorage
9. Usuaria queda logueada automáticamente

### Login

1. Usuaria ingresa email + password
2. Frontend hace `POST /api/auth/login`
3. Backend busca el User por email
4. Compara el password ingresado con el hash guardado usando bcrypt
5. Si coincide, genera un nuevo JWT token
6. Si no coincide, devuelve error 400 (el mensaje es genérico a propósito, no le decimos si el email o la clave es lo incorrecto)

### Rutas privadas

Cuando una usuaria intenta acceder a algo que requiere estar logueada (como su perfil o sus reservas):

1. Frontend verifica si hay token en localStorage
2. Si no hay token, redirige a /login
3. Si hay token, lo agrega en el header: `Authorization: Bearer {token}`
4. El middleware `protegerRuta` en el backend valida el JWT
5. Si el token está bien, deja pasar la request
6. Si el token expiró o es inválido, devuelve 401 y el frontend redirige a login

---

## Por qué elegimos estas tecnologías

### Frontend

| Tecnología | Por qué |
|---|---|
| React 19 | Componentes reutilizables, gran ecosistema, funciona bien para SPAs |
| Vite 8 | El dev server arranca en milisegundos, mucho más rápido que webpack |
| Tailwind CSS 4 | Se puede hacer diseño rápido sin escribir CSS custom, y el tema se puede personalizar |
| React Router 7 | Navegación entre páginas sin recargar (SPA), maneja rutas por rol de usuario |
| Axios 1.13 | Más fácil que fetch para manejar headers JWT automáticamente con interceptores |

### Backend

| Tecnología | Por qué |
|---|---|
| Node.js 18+ | JavaScript en el servidor, no-blocking I/O, perfecto para APIs con muchas requests concurrentes |
| Express 4.18 | Minimalista y flexible, el patrón de middleware hace fácil agregar funcionalidades |
| Mongoose 7 | Pone orden en MongoDB con esquemas y validaciones, las relaciones entre colecciones son más simples |
| JWT | Autenticación sin estado (stateless), no necesitas guardar sesiones en el servidor |
| bcryptjs | Estándar para encriptar passwords, el salt automático lo hace seguro |
| Cloudinary | Las fotos se guardan en cloud con CDN, no ocupan espacio en el servidor |
| Nodemailer | Enviar emails es complicado sin una librería, esta lo simplifica mucho |

### Base de datos

Usamos MongoDB Atlas (cloud) en lugar de una base de datos local porque:
- No necesitamos configurar nada en nuestras máquinas
- Tiene backups automáticos diarios
- Escala horizontalmente si crece el proyecto
- El esquema flexible de NoSQL es mejor para un proyecto donde los datos de las usuarias pueden variar

---

## Estructura del código

### Backend (patrón MVC)

```
backend/src/
├── models/          ← Esquemas MongoDB (User, WorkerProfile, Booking, Review, Message)
├── routes/          ← Rutas + controladores juntos (auth, workers, bookings, reviews, messages, admin)
├── middleware/       ← auth.js (JWT), validation.js (validar inputs)
├── config/          ← Configuración DB, Cloudinary
└── server.js        ← Punto de entrada
```

Las rutas y los controladores están en el mismo archivo porque el proyecto no es tan grande. Si escala, se separarían en carpetas distintas.

### Frontend (componentes React)

```
frontend/src/
├── pages/           ← Pantallas completas (Home, Login, RegisterWorker, RegisterClient, WorkerProfile, etc.)
├── components/      ← Partes reutilizables (Navbar, Footer, ProtectedRoute, ChatModal, EvaluarModal, PhotoUpload)
└── App.jsx          ← Configuración de rutas
```

`ProtectedRoute` es importante: es el componente que verifica si hay token antes de dejar entrar a rutas privadas. Si no hay token, redirige a login automáticamente.

---

## Seguridad implementada

| Qué | Cómo |
|---|---|
| Passwords | Encriptadas con bcryptjs (salt 10 rounds), nunca se guardan en texto plano |
| Autenticación | JWT tokens con expiración 30 días |
| CORS | Configurado para que solo el frontend en `localhost:5173` pueda hacer requests al backend |
| Uploads | Las fotos van directo a Cloudinary, nunca pasan por el servidor de Node |
| Validación | Mongoose valida en el esquema + express-validator valida antes de llegar a la BD |
| Rate Limiting | Pendiente implementar en Semana 2 (protección contra brute force) |
| Roles | Middleware `soloTrabajadora`, `soloClienta`, `soloAdmin` que verifica el tipo de usuaria |

---

## Performance

En el frontend, Vite hace minificación y tree-shaking automático, así que el bundle final en producción es mucho más pequeño que en desarrollo. Tailwind también hace purge de las clases que no se usan.

En el backend, MongoDB tiene índices en los campos que más se buscan (email, categoría, tipo). Sin índices, una búsqueda en una colección con miles de documentos sería lentísima porque tiene que revisar uno por uno. Con índices es como buscar en un diccionario vs buscar en un libro normal.

---

## Deploy (cuando llegue el momento)

El plan es:
- **Frontend** en Vercel (conectado al repo de GitHub, se deploya automáticamente al hacer push a main)
- **Backend** en Render o Railway (también auto-deploy desde GitHub)
- **Base de datos** sigue siendo MongoDB Atlas (ya está en cloud)

Lo importante para el deploy es tener todas las variables del `.env` configuradas en el panel de la plataforma de hosting. Nunca se sube el `.env` al repositorio.

---

Última actualización: 13/04/2026 — Documentación Semana 1 EP2 — Sol + Adolfo
