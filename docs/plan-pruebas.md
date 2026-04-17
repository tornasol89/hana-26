# 🧪 PLAN DE PRUEBAS - HANA EP2

## 1. Estrategia General

Las pruebas están organizadas en 3 niveles:

1. **Pruebas Unitarias** - Testear funciones aisladas
2. **Pruebas de Integración** - Testear endpoints completos con BD
3. **Pruebas de Usuario (E2E)** - Flujos completos como usuaria real

**Estado Actual:** Pruebas planeadas (no ejecutadas aún)

---

## 2. Pruebas Unitarias (Backend)

### 2.1 Modelo User

| Caso de Prueba | Entrada | Resultado Esperado | Status |
|---|---|---|---|
| Crear usuario válido | {nombre, apellido, email, password, tipo} | Usuario guardado en BD | ⏳ Pendiente |
| Email único | Registrar 2 usuarios con mismo email | Error: Email ya existe | ⏳ Pendiente |
| Password encriptado | Guardar password | Password ≠ texto plano en BD | ⏳ Pendiente |
| Validar tipo | tipo ∉ ['clienta','trabajadora','admin'] | Error validación | ⏳ Pendiente |
| Email normalizado | "MARIA@GMAIL.COM" | Guardado como "maria@gmail.com" | ⏳ Pendiente |

### 2.2 Modelo WorkerProfile

| Caso de Prueba | Entrada | Resultado Esperado | Status |
|---|---|---|---|
| Crear perfil válido | {usuario_id, categoria, descripcion} | Perfil guardado | ⏳ Pendiente |
| Relación 1:1 | Un usuario-trabajadora tiene 1 perfil | Asociación correcta | ⏳ Pendiente |
| Índice confianza | {puntualidad:5, calidad:4, etc.} | Promedio calculado correctamente | ⏳ Pendiente |
| Validar categoría | categoria ∉ enum | Error validación | ⏳ Pendiente |

### 2.3 Modelo Booking

| Caso de Prueba | Entrada | Resultado Esperado | Status |
|---|---|---|---|
| Crear reserva | {clientaId, trabajadoraId, fecha} | Booking en estado 'pendiente' | ⏳ Pendiente |
| Estado válido | estado = 'inexistente' | Error validación | ⏳ Pendiente |
| Relación N:1 | Una clienta múltiples reservas | Todas asociadas correctamente | ⏳ Pendiente |

---

## 3. Pruebas de Integración (Endpoints)

### 3.1 Autenticación

#### POST /api/auth/register (Registro)

| Caso | Request Body | Status HTTP | Response | Status Prueba |
|---|---|---|---|---|
| Registro exitoso | {nombre, apellido, email, password, tipo, aceptoCompromiso:true} | 201 | {token, usuario} | ⏳ Pendiente |
| Email duplicado | email que ya existe | 400 | {message: 'Email ya registrado'} | ⏳ Pendiente |
| Password muy corto | password: "123" | 400 | {message: 'Password min 6 caracteres'} | ⏳ Pendiente |
| Email inválido | email: "notanemail" | 400 | {message: 'Email inválido'} | ⏳ Pendiente |
| Tipo inválido | tipo: "super_admin" | 400 | {message: 'Tipo no permitido'} | ⏳ Pendiente |
| Sin compromiso | aceptoCompromiso: false | 400 | {message: 'Debe aceptar Compromiso'} | ⏳ Pendiente |

#### POST /api/auth/login (Login)

| Caso | Request Body | Status HTTP | Response | Status Prueba |
|---|---|---|---|---|
| Login correcto | {email, password correcto} | 200 | {token, usuario} | ⏳ Pendiente |
| Password incorrecto | {email válido, password incorrecto} | 400 | {message: 'Email o contraseña incorrectos'} | ⏳ Pendiente |
| Email no existe | {email inexistente} | 400 | {message: 'Email o contraseña incorrectos'} | ⏳ Pendiente |
| Cuenta desactivada | Usuario con activa:false | 403 | {message: 'Cuenta desactivada'} | ⏳ Pendiente |

#### GET /api/auth/me (Verificar sesión)

| Caso | Headers | Status HTTP | Response | Status Prueba |
|---|---|---|---|---|
| Token válido | Authorization: Bearer {válido} | 200 | {usuario} | ⏳ Pendiente |
| Sin token | Sin header Authorization | 401 | {message: 'No autorizado'} | ⏳ Pendiente |
| Token expirado | Authorization: Bearer {expirado} | 401 | {message: 'Token expirado'} | ⏳ Pendiente |
| Token inválido | Authorization: Bearer "garbage" | 401 | {message: 'Token inválido'} | ⏳ Pendiente |

### 3.2 Búsqueda de Trabajadoras

#### GET /api/workers (Listar trabajadoras)

| Caso | Query Params | Status HTTP | Response | Status Prueba |
|---|---|---|---|---|
| Sin filtros | - | 200 | [{worker1}, {worker2}, ...] | ⏳ Pendiente |
| Por categoría | ?categoria=Limpieza | 200 | [workers filtramiento] | ⏳ Pendiente |
| Por región | ?region=Metropolitana | 200 | [workers en esa región] | ⏳ Pendiente |
| Múltiples filtros | ?categoria=Limpieza&region=Met | 200 | [filtered workers] | ⏳ Pendiente |
| Pagination | ?page=2&limit=10 | 200 | Array máximo 10 items | ⏳ Pendiente |

#### GET /api/workers/:id (Perfil trabajadora)

| Caso | Parámetro | Status HTTP | Response | Status Prueba |
|---|---|---|---|---|
| ID válido | ObjectId válido | 200 | {user, workerProfile, reviews} | ⏳ Pendiente |
| ID inválido | ID malformado | 400 | {message: 'ID inválido'} | ⏳ Pendiente |
| No existe | ObjectId válido pero no en BD | 404 | {message: 'Trabajadora no encontrada'} | ⏳ Pendiente |

### 3.3 Reservas

#### POST /api/bookings (Crear reserva)

| Caso | Body + Auth | Status | Response | Status Prueba |
|---|---|---|---|---|
| Reserva válida | {trabajadoraId, fecha, duracion, precio} + token | 201 | {booking creado} | ⏳ Pendiente |
| Sin token | Sin Authorization header | 401 | {message: 'No autorizado'} | ⏳ Pendiente |
| Trabajadora no existe | trabajadoraId inválido | 404 | {message: 'Trabajadora no encontrada'} | ⏳ Pendiente |
| Fecha pasada | fecha: ayer | 400 | {message: 'Fecha no válida'} | ⏳ Pendiente |

#### PUT /api/bookings/:id/aceptar (Aceptar reserva)

| Caso | Auth | Status | Response | Status Prueba |
|---|---|---|---|---|
| Aceptar válida | token trabajadora | 200 | {booking.estado = 'aceptado'} | ⏳ Pendiente |
| No es trabajadora | token clienta | 403 | {message: 'Solo trabajadora puede aceptar'} | ⏳ Pendiente |
| Ya completada | booking.estado = 'completado' | 400 | {message: 'No se puede aceptar'} | ⏳ Pendiente |

#### PUT /api/bookings/:id/rechazar (Rechazar)

| Caso | Auth | Status | Response | Status Prueba |
|---|---|---|---|---|
| Rechazar válida | token trabajadora | 200 | {booking.estado = 'rechazado'} | ⏳ Pendiente |
| No es trabajadora | token clienta | 403 | {message: 'Acceso denegado'} | ⏳ Pendiente |

### 3.4 Reseñas

#### POST /api/reviews (Crear reseña)

| Caso | Body | Status | Response | Status Prueba |
|---|---|---|---|---|
| Reseña válida | {bookingId, puntaje:5, comentario, metricas} | 201 | {review creado} | ⏳ Pendiente |
| Puntaje inválido | puntaje: 6 | 400 | {message: 'Puntaje entre 1-5'} | ⏳ Pendiente |
| Booking no existe | bookingId inválido | 404 | {message: 'Reserva no encontrada'} | ⏳ Pendiente |
| Duplicada | Crear 2 reviews para mismo booking | 400 | {message: 'Booking ya tiene reseña'} | ⏳ Pendiente |

#### GET /api/reviews/:workerId (Ver reseñas)

| Caso | Parámetro | Status | Response | Status Prueba |
|---|---|---|---|---|
| Con reseñas | workerId con 3 reseñas | 200 | [review1, review2, review3] | ⏳ Pendiente |
| Sin reseñas | workerId sin reviews | 200 | [] (array vacío) | ⏳ Pendiente |
| No existe | workerId inválido | 404 | {message: 'Trabajadora no encontrada'} | ⏳ Pendiente |

---

## 4. Pruebas de Usuario (E2E)

### 4.1 Flujo: Nueva Clienta se registra y reserva servicio

```
Paso 1: Acceder a Home
✓ Se carga página Home
✓ Ver 4 slides de categorías
✓ Ver navbar con logo Hana
✓ Ver botón "Contratar servicios"

Paso 2: Click "Contratar servicios"
✓ Redirige a /compromiso
✓ Ver documento Compromiso Hana
✓ Poder scrollear hasta el final
✓ Checkbox "Acepto términos" se habilita al final

Paso 3: Aceptar compromiso y registrarse
✓ Click "Aceptar y continuar"
✓ Redirige a /register-client
✓ Llenar formulario (nombre, email, password)
✓ Click "Crear cuenta"
✓ Se crea usuario en MongoDB
✓ JWT token se guarda en localStorage

Paso 4: Login automático
✓ Después de registro, está logueada
✓ Redirige a Home logueada
✓ Navbar muestra nombre y avatar
✓ Botón "Mi perfil" disponible

Paso 5: Buscar trabajadora
✓ Ver sección "Buscar por región"
✓ Seleccionar región "Metropolitana"
✓ Seleccionar categoría "Limpieza"
✓ Click "Buscar"
✓ Ver lista de trabajadoras
✓ Cada tarjeta muestra: foto, nombre, categoría, rating

Paso 6: Ver perfil de trabajadora (María)
✓ Click en tarjeta de María
✓ Redirige a /worker/{id}
✓ Ver foto, descripción, tarifa/hora
✓ Ver índice de confianza (4.7★)
✓ Ver 3 reseñas anteriores
✓ Ver botón "Reservar"

Paso 7: Crear reserva
✓ Click "Reservar"
✓ Abre modal con formulario
✓ Llenar: fecha, duración, notas
✓ Click "Confirmar reserva"
✓ Reserva se crea en MongoDB (estado='pendiente')
✓ Ver popup "Reserva enviada"
✓ Modal cierra

Paso 8: Ver mis reservas
✓ Click "Mi perfil" en navbar
✓ Click tab "Mis reservas"
✓ Ver reserva en estado "pendiente"
✓ Ver botón "Cancelar" disponible
✓ Esperar respuesta de trabajadora

Status: ⏳ PENDIENTE EJECUTAR
```

### 4.2 Flujo: Trabajadora recibe y acepta reserva

```
Paso 1: Trabajadora se registra
✓ Ir a Home
✓ Click "Ofrecer servicios"
✓ Aceptar Compromiso
✓ Ir a /register-worker
✓ Llenar datos (nombre, email, password, RUT)
✓ Click "Crear cuenta"

Paso 2: Completar perfil profesional
✓ Login con email/password
✓ Ir a /mi-perfil
✓ Click "Perfil profesional"
✓ Llenar: categoría, subcategoría, descripción, tarifa
✓ Upload foto de perfil
✓ Upload carnet (frente + dorso)
✓ Click "Guardar"
✓ WorkerProfile se crea en BD
✓ Estado verificación = 'enviado'

Paso 3: Ver reservas pendientes
✓ Click "Mi perfil"
✓ Click tab "Mis reservas"
✓ Ver reserva de María (clienta) en estado "pendiente"
✓ Ver botones "Aceptar" y "Rechazar"

Paso 4: Aceptar reserva
✓ Click "Aceptar"
✓ Booking.estado = 'aceptado'
✓ Popup: "Reserva aceptada"
✓ Ver reserva ahora con estado "aceptado"

Paso 5: Ver en calendario
✓ Click "Mi calendario"
✓ Ver fecha reservada con evento

Status: ⏳ PENDIENTE EJECUTAR
```

### 4.3 Flujo: Evaluar servicio completado

```
Paso 1: Servicio completado
✓ Fecha y hora pasada
✓ Booking se marca como "completado"

Paso 2: Dejar reseña
✓ Click "Mis reservas"
✓ Click "Evaluar" en booking completado
✓ Abre modal Review
✓ Llenar: puntaje (estrellas), comentario
✓ Subir fotos (opcional, máximo 3)
✓ Click "Enviar reseña"

Paso 3: Reseña visible
✓ Ir a perfil de trabajadora
✓ Ver nueva reseña en sección "Reseñas"
✓ Ver estrellas, comentario, fotos
✓ Índice confianza se actualiza

Status: ⏳ PENDIENTE EJECUTAR
```

---

## 5. Pruebas de Seguridad (Semana 2)

| Prueba | Método | Esperado | Status |
|---|---|---|---|
| Rate Limiting Login | 6+ intentos fallidos en 15 min | Error 429 Too Many Requests | ⏳ Pendiente |
| Rate Limiting API | 100+ requests en 15 min | Error 429 | ⏳ Pendiente |
| SQL Injection | Ingresar SQL en email | No ejecuta SQL | ⏳ Pendiente |
| XSS (Cross-Site) | Ingresar `<script>` en comentario | Se escapa HTML | ⏳ Pendiente |
| CSRF (Cross-Site Request Forgery) | POST desde otro sitio | Rechazado por CORS | ⏳ Pendiente |
| JWT Expiration | Token con expiración | Error 401 después expiración | ⏳ Pendiente |

---

## 6. Herramientas de Testing

### Herramientas Recomendadas

| Herramienta | Uso | Link |
|---|---|---|
| **Postman** | Testear endpoints manuales | postman.com |
| **Thunder Client** | VSCode plugin para Postman | marketplace.visualstudio.com |
| **Jest** | Unit testing (futuro) | jestjs.io |
| **Cypress** | E2E testing automatizado (futuro) | cypress.io |

### Cómo hacer pruebas manualmente

```bash
# Usando curl (terminal Linux/Mac)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password123"}'

# Usando PowerShell (Windows)
$body = @{
    email = "test@gmail.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## 7. Resumen de Pruebas

| Nivel | Cantidad | Estado |
|---|---|---|
| Unitarias | 15 | ⏳ Planeadas |
| Integración | 30+ | ⏳ Planeadas |
| E2E | 3 flujos | ⏳ Planeadas |
| Seguridad | 6 | ⏳ Planeadas |
| **TOTAL** | **~60** | **⏳ POR EJECUTAR** |

---

**Fecha de actualización:** 13/04/2026  
**Estado:** Plan de pruebas Semana 1 EP2  
**Próximo:** Ejecutar pruebas Semana 2-3
