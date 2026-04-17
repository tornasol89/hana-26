# PROYECTO HANA — BITÁCORA DE AVANCE DETALLADA

## 1. RESUMEN DEL PROYECTO

**Hana** es una plataforma web pensada para conectar mujeres que necesitan contratar servicios con mujeres que los ofrecen, en un entorno seguro, verificado y orientado a la confianza.

### Propósito del proyecto

- Facilitar la contratación de servicios entre mujeres.
- Promover la autonomía económica femenina.
- Crear una comunidad confiable y protegida.
- Diferenciarse por seguridad, verificación y compromiso mutuo.

### Stack tecnológico

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas
- **Autenticación:** JWT
- **ORM / ODM:** Mongoose
- **HTTP client:** axios
- **Estilos:** CSS + diseño custom
- **Control de versiones:** Git + GitHub

### Repositorio

`https://github.com/tornasol89/hana`

### Ruta local del proyecto

`C:\Users\LENOVO\Desktop\hana`

---

## 2. ESTADO ACTUAL DEL PROYECTO

### Estado general actual

El proyecto **ya levanta frontend y backend**, conecta con MongoDB y permite:

- registrar usuarias,
- registrar trabajadoras,
- crear perfil profesional,
- mostrar profesionales en Home,
- ver detalle individual de una profesional,
- iniciar el flujo de Compromiso Hana.

El proyecto **ya dejó atrás la etapa de caídas graves de backend** y ahora está entrando en fase de:

- pulido de flujo,
- coherencia UX,
- revisión de navegación,
- y robustecimiento funcional.

---

## 3. LO QUE YA SE HIZO Y QUEDÓ FUNCIONANDO

# 3.1 BACKEND

## 3.1.1 Servidor y configuración

- Se corrigió el backend para que funcione con **ES Modules**.
- Se eliminó el uso incorrecto de `require()` dentro de `server.js`.
- Se dejó `server.js` usando solo `import/export`.
- Se corrigió el arranque del servidor.
- Se agregó manejo de error limpio en la conexión a base de datos.

## 3.1.2 Variables de entorno

- Se corrigió el problema de lectura de variables del `.env`.
- Se detectó que el backend esperaba `MONGODB_URI`.
- Se corrigió el error donde estaba como `MONGO_URI`.
- Se logró levantar el backend y conectar MongoDB correctamente.

## 3.1.3 Seguridad básica del repositorio

- Se eliminó `.env` del seguimiento de Git.
- Se eliminó `node_modules` del repo.
- Se corrigió `backend/.gitignore`.
- Se agregó archivo `.env.example` como plantilla.
- Se identificó que credenciales reales fueron expuestas anteriormente y se dejó pendiente rotarlas.

## 3.1.4 Autenticación

- Se corrigió el bug en `auth.js` donde se usaba `auth` en vez de `protegerRuta`.
- Se unificó el uso de `req.usuario`.
- Se dejó funcionando:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `PUT /api/auth/me`
  - `POST /api/auth/upload-photo`

## 3.1.5 Modelos detectados y funcionales

Existen los siguientes modelos:

- `User`
- `WorkerProfile`
- `Booking`
- `Review`
- `Alert`

## 3.1.6 Rutas operativas

Se verificó o corrigió funcionamiento base de:

- `/api/auth`
- `/api/workers`
- `/api/bookings`
- `/api/reviews`

---

# 3.2 FRONTEND

## 3.2.1 Estructura general

Se confirmó y corrigió estructura con rutas:

- `/`
- `/login`
- `/register-client`
- `/register-worker`
- `/worker/:id`
- `/impacto`
- `/compromiso`
- `/mi-perfil`

## 3.2.2 App.jsx

- Se revisó `App.jsx`.
- Se corrigió import de `MiPerfil` por posible problema de mayúsculas/minúsculas.
- Se confirmó que las rutas base existen.

## 3.2.3 Home.jsx

Se corrigieron varias cosas importantes:

### Cambios realizados

- Se eliminó el botón duplicado de “Ofrecer mis servicios” en el hero.
- Se rediseñó la sección “Cómo funciona”.
- Se mejoró la estructura visual del Home.
- Se dejaron secciones con `id` para navegación:
  - `#como-funciona`
  - `#categorias`
  - `#profesionales`
- Se corrigió el CTA “Crear mi perfil gratis”.
- Se corrigió la lógica para que las profesionales se carguen desde backend.
- Se agregó lógica para mostrar más profesionales si existen más en base de datos.
- Se detectó que si no aparecen más de 3, no es bug del botón, sino del volumen de datos que realmente devuelve `/api/workers`.

### Estado actual del Home

- Ya muestra profesionales reales desde MongoDB.
- Ya puede sumar nuevas trabajadoras registradas.
- Ya no está dependiendo solo de perfiles “inventados” si el backend devuelve datos.

## 3.2.4 Navbar.jsx

Se corrigió la navegación del menú superior.

### Antes

- “Servicios” no llevaba a nada útil.
- “Profesionales” no llevaba a nada útil.
- algunos botones generaban flujo incoherente hacia compromiso.

### Ahora

- `Servicios` baja a la sección correcta.
- `Profesionales` baja a la sección correcta.
- se dejó más coherente la navegación superior.
- aún queda pendiente unificar todos los CTA del sitio con el flujo obligatorio de Compromiso.

## 3.2.5 WorkerProfile.jsx

Este fue uno de los arreglos más importantes.

### Problemas detectados

- Pantalla en blanco al entrar a una profesional.
- El componente intentaba leer campos que no coincidían con la estructura real del backend.
- Se mostraba `NaN` en el Índice Hana.
- El estilo estaba roto/incompleto.
- Había lógica inconsistente para determinar si era “mi perfil”.

### Correcciones realizadas

- Se reescribió `WorkerProfile.jsx` para usar la estructura real:
  - `perfil.usuario.nombre`
  - `perfil.usuario.apellido`
  - `perfil.categoria`
  - `perfil.descripcion`
  - `perfil.usuario.region`
  - `perfil.usuario.comuna`
- Se corrigió el cálculo del Índice Hana.
- Se corrigió el render para evitar pantallas vacías.
- Se corrigió el diseño visual completo del perfil.
- Se dejó funcionando el botón de volver.

### Estado actual

- El perfil profesional ya se ve como una ficha real.
- Ya abre correctamente desde las cards del Home.
- Ya no deja la pantalla en blanco.

## 3.2.6 Compromiso.jsx

Se detectó que el flujo estaba mal armado a nivel UX aunque técnicamente existía.

### Problemas detectados

- La página abría “a la mitad”.
- No quedaba claro que primero había que leer y después aceptar.
- Mostraba dos botones incluso cuando ya venías con destino claro (`clienta` o `trabajadora`).

### Correcciones realizadas

- Se agregó `window.scrollTo(0, 0)` al cargar.
- Se agregó introducción más clara.
- Se dejó lógica por `destino`:
  - `?destino=trabajadora`
  - `?destino=clienta`
- Se corrigió para que si viene destino, se muestre un solo botón final.
- Se mantuvo almacenamiento en `localStorage`:
  - `aceptoCompromiso`
  - `fechaAceptacion`

### Estado actual

- La página ya funciona mejor como paso previo.
- Sigue pendiente cerrar completamente el flujo desde todos los botones del sitio.

## 3.2.7 RegisterWorker.jsx

Aquí hubo una corrección funcional clave.

### Problema detectado

La trabajadora podía llegar al formulario, pero al enviar el backend respondía:
**“Debes aceptar el Compromiso Hana”**

### Causa

El frontend no estaba enviando:

- `aceptoCompromiso: true`
- `fechaAceptacion`

### Corrección

Se corrigió el `POST /api/auth/register` desde `RegisterWorker.jsx` para mandar:

- `aceptoCompromiso: true`
- `fechaAceptacion`

Además:

- se mantuvo el guard con `localStorage`
- se dejó la creación posterior de `WorkerProfile`

### Estado actual

- La trabajadora sí puede registrarse.
- El perfil profesional sí se crea.
- La trabajadora nueva sí aparece en la lista de profesionales.

---

## 4. DECISIONES IMPORTANTES TOMADAS

Estas decisiones ya se definieron y deben respetarse en futuras sesiones.

### 4.1 Flujo obligatorio de compromiso

**Decisión tomada:**  
Tanto **clientas** como **trabajadoras** deben aceptar el Compromiso Hana **antes** del formulario de registro.

### Flujo correcto definido

**CTA** → **Compromiso Hana** → **Aceptar** → **Registro**

### 4.2 No se debe permitir acceso libre al formulario

Si la usuaria intenta abrir directamente:

- `/register-worker`
- `/register-client`

sin haber pasado por compromiso, el sistema debe redirigir.

### 4.3 Unificación de puntos de entrada

Se definió que lo ideal es que:

- todos los CTA de trabajadora apunten a `/compromiso?destino=trabajadora`
- todos los CTA de clienta apunten a `/compromiso?destino=clienta`

### 4.4 El perfil profesional visible en Home depende de WorkerProfile

No basta con crear solo un `User`.
Para aparecer como profesional destacada en Home:

- debe existir el `User`
- y debe existir el `WorkerProfile` vinculado

---

## 5. PROBLEMAS YA RESUELTOS

- [x] Backend no levantaba por mezcla de `require` e `import`
- [x] Error `auth is not defined`
- [x] Error `req.user` / `req.usuario`
- [x] Error de `MONGODB_URI` undefined
- [x] `.env` y `node_modules` subidos al repo
- [x] Pantalla en blanco en perfil profesional
- [x] `NaN` en Índice Hana
- [x] Home mostrando estructura visual deficiente en “Cómo funciona”
- [x] CTA duplicados confusos
- [x] Links muertos en navbar
- [x] Trabajadora registrada que no aparecía correctamente
- [x] Registro profesional sin enviar aceptación de compromiso al backend

---

## 6. LO QUE TODAVÍA FALTA HACER

# 6.1 PENDIENTE INMEDIATO

## Navegación y flujo

- [ ] Unificar **todos** los botones de entrada según intención:
  - [ ] `Ofrecer servicios` → `/compromiso?destino=trabajadora`
  - [ ] `Crear mi perfil gratis` → `/compromiso?destino=trabajadora`
  - [ ] `Contratar servicios` → `/compromiso?destino=clienta`
- [ ] Verificar que no quede ningún botón llevando directo al formulario sin pasar por compromiso.
- [ ] Asegurar que en ambas rutas (`register-client` y `register-worker`) el formulario no se muestre ni un segundo si no aceptó previamente.

## Registro de clienta

- [ ] Revisar `RegisterClient.jsx`
- [ ] Aplicar exactamente el mismo flujo obligatorio de compromiso que ya se pensó para trabajadoras
- [ ] Verificar que también envíe `aceptoCompromiso` y `fechaAceptacion` si el backend lo requiere

## Compromiso Hana

- [ ] Mejorar todavía más la introducción visual del compromiso si se estima necesario
- [ ] Verificar que desde cualquier CTA abra desde arriba y nunca a media página
- [ ] Revisar si conviene agregar un indicador visual de progreso o una caja fija final de aceptación

---

# 6.2 PENDIENTE FUNCIONAL SIGUIENTE

## Verificación y confianza

- [ ] Subida de foto de perfil real
- [ ] Subida de carnet por ambos lados
- [ ] Flujo de revisión / validación manual por admin
- [ ] Estado “verificada” visible para clienta y trabajadora

## Reservas

- [ ] Completar frontend de reservas
- [ ] Solicitar reserva desde perfil profesional
- [ ] Aceptar/rechazar reserva desde trabajadora
- [ ] Mostrar reservas activas

## Evaluaciones

- [ ] Sistema completo de reseñas
- [ ] Mostrar métricas reales en perfil
- [ ] Reemplazar valores mock de barras por datos reales

## Perfil de usuaria

- [ ] Revisar `MiPerfil`
- [ ] Revisar si clienta y trabajadora deben tener perfiles diferenciados o uno adaptable

---

# 6.3 PENDIENTE MÁS ADELANTE

- [ ] Deploy frontend en Vercel
- [ ] Deploy backend en Render
- [ ] README profesional del repo
- [ ] Rotación de credenciales expuestas previamente
- [ ] Mejoras de seguridad
- [ ] Mejoras de accesibilidad
- [ ] Filtros reales por región/categoría
- [ ] Sistema de match o recomendación
- [ ] Panel de administración

---
