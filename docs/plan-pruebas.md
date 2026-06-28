# Plan de pruebas — Hana EP2

Las pruebas están organizadas en tres niveles: unitarias (funciones individuales), integración (endpoints completos con base de datos real) y E2E (flujos completos como si fueras una usuaria usando la app). Actualmente todas están planeadas pero pendientes de ejecutar.

---

## Pruebas unitarias (Backend)

Estas prueban los modelos de Mongoose de forma aislada, verificando que los esquemas validen correctamente antes de guardar en la BD.

### Modelo User

| Caso | Entrada | Resultado esperado | Estado |
|---|---|---|---|
| Crear usuario válido | {nombre, apellido, email, password, tipo} | Usuario guardado en BD | ⏳ Pendiente |
| Email único | Registrar 2 usuarios con mismo email | Error: Email ya existe | ⏳ Pendiente |
| Password encriptado | Guardar password | Password != texto plano en BD | ⏳ Pendiente |
| Validar tipo | tipo fuera del enum | Error de validación | ⏳ Pendiente |
| Email normalizado | "MARIA@GMAIL.COM" | Guardado como "maria@gmail.com" | ⏳ Pendiente |

### Modelo WorkerProfile

| Caso | Entrada | Resultado esperado | Estado |
|---|---|---|---|
| Crear perfil válido | {usuario_id, categoria, descripcion} | Perfil guardado correctamente | ⏳ Pendiente |
| Relación 1:1 | Un usuario-trabajadora tiene 1 perfil | Asociación correcta | ⏳ Pendiente |
| Índice confianza | {puntualidad:5, calidad:4, ...} | Promedio calculado bien | ⏳ Pendiente |
| Validar categoría | categoria fuera del enum | Error de validación | ⏳ Pendiente |

### Modelo Booking

| Caso | Entrada | Resultado esperado | Estado |
|---|---|---|---|
| Crear reserva | {clientaId, trabajadoraId, fecha} | Booking en estado 'pendiente' | ⏳ Pendiente |
| Estado válido | estado = 'inexistente' | Error de validación | ⏳ Pendiente |
| Relación N:1 | Una clienta con múltiples reservas | Todas asociadas correctamente | ⏳ Pendiente |

---

## Pruebas de integración (Endpoints)

Estas son más importantes que las unitarias para este proyecto. Prueban el endpoint completo: request HTTP → validaciones → lógica → MongoDB → response. Se hacen con Postman o Thunder Client.

### Autenticación

**POST /api/auth/register**

| Caso | Body | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Registro exitoso | {nombre, apellido, email, password, tipo, aceptoCompromiso:true} | 201 | {token, usuario} | ⏳ Pendiente |
| Email duplicado | email que ya existe en BD | 400 | {message: 'Email ya registrado'} | ⏳ Pendiente |
| Password muy corto | password: "123" | 400 | {message: 'Password min 6 caracteres'} | ⏳ Pendiente |
| Email inválido | email: "notanemail" | 400 | {message: 'Email inválido'} | ⏳ Pendiente |
| Tipo inválido | tipo: "super_admin" | 400 | {message: 'Tipo no permitido'} | ⏳ Pendiente |
| Sin aceptar compromiso | aceptoCompromiso: false | 400 | {message: 'Debe aceptar Compromiso'} | ⏳ Pendiente |

**POST /api/auth/login**

| Caso | Body | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Login correcto | {email, password correcto} | 200 | {token, usuario} | ⏳ Pendiente |
| Password incorrecto | {email válido, password incorrecto} | 400 | {message: 'Email o contraseña incorrectos'} | ⏳ Pendiente |
| Email no existe | {email inexistente} | 400 | {message: 'Email o contraseña incorrectos'} | ⏳ Pendiente |
| Cuenta desactivada | usuario con activa:false | 403 | {message: 'Cuenta desactivada'} | ⏳ Pendiente |

Nota: el mensaje de error para "password incorrecto" y "email no existe" es el mismo a propósito. No queremos decirle a alguien que intenta atacar el sistema si el email existe o no.

**GET /api/auth/me**

| Caso | Header Authorization | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Token válido | Bearer {token válido} | 200 | {usuario} | ⏳ Pendiente |
| Sin token | (sin header) | 401 | {message: 'No autorizado'} | ⏳ Pendiente |
| Token expirado | Bearer {token expirado} | 401 | {message: 'Token expirado'} | ⏳ Pendiente |
| Token basura | Bearer "garbage123" | 401 | {message: 'Token inválido'} | ⏳ Pendiente |

### Búsqueda de trabajadoras

**GET /api/workers**

| Caso | Query params | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Sin filtros | - | 200 | array de workers | ⏳ Pendiente |
| Por categoría | ?categoria=Limpieza | 200 | workers de esa categoría | ⏳ Pendiente |
| Por región | ?region=Metropolitana | 200 | workers de esa región | ⏳ Pendiente |
| Múltiples filtros | ?categoria=Limpieza&region=Metropolitana | 200 | workers filtrados | ⏳ Pendiente |
| Paginación | ?page=2&limit=10 | 200 | máximo 10 items | ⏳ Pendiente |

**GET /api/workers/:id**

| Caso | Parámetro | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| ID válido | ObjectId existente en BD | 200 | {user, workerProfile, reviews} | ⏳ Pendiente |
| ID malformado | "noesunobjectid" | 400 | {message: 'ID inválido'} | ⏳ Pendiente |
| ID válido pero no existe | ObjectId bien formado pero no en BD | 404 | {message: 'Trabajadora no encontrada'} | ⏳ Pendiente |

### Reservas

**POST /api/bookings**

| Caso | Body + Auth | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Reserva válida | {trabajadoraId, fecha, duracion, precio} + token | 201 | {booking} | ⏳ Pendiente |
| Sin token | Sin header Authorization | 401 | {message: 'No autorizado'} | ⏳ Pendiente |
| Trabajadora no existe | trabajadoraId inválido | 404 | {message: 'Trabajadora no encontrada'} | ⏳ Pendiente |
| Fecha en el pasado | fecha: ayer | 400 | {message: 'Fecha no válida'} | ⏳ Pendiente |

**PUT /api/bookings/:id/aceptar y /rechazar**

| Caso | Auth | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Aceptar como trabajadora | token de la trabajadora de ese booking | 200 | {booking.estado: 'aceptado'} | ⏳ Pendiente |
| Aceptar como clienta | token de la clienta | 403 | {message: 'Solo trabajadora puede aceptar'} | ⏳ Pendiente |
| Aceptar booking ya completado | booking en estado 'completado' | 400 | {message: 'No se puede aceptar'} | ⏳ Pendiente |
| Rechazar como trabajadora | token de la trabajadora | 200 | {booking.estado: 'rechazado'} | ⏳ Pendiente |

### Reseñas

**POST /api/reviews**

| Caso | Body | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Reseña válida | {bookingId, puntaje:5, comentario, metricas} | 201 | {review} | ⏳ Pendiente |
| Puntaje fuera de rango | puntaje: 6 | 400 | {message: 'Puntaje entre 1-5'} | ⏳ Pendiente |
| Booking no existe | bookingId inválido | 404 | {message: 'Reserva no encontrada'} | ⏳ Pendiente |
| Reseña duplicada | 2 reviews para el mismo bookingId | 400 | {message: 'Booking ya tiene reseña'} | ⏳ Pendiente |

**GET /api/reviews/:workerId**

| Caso | Parámetro | HTTP | Response esperado | Estado |
|---|---|---|---|---|
| Trabajadora con reseñas | workerId con 3 reviews | 200 | [review1, review2, review3] | ⏳ Pendiente |
| Trabajadora sin reseñas | workerId sin reviews | 200 | [] | ⏳ Pendiente |
| No existe | workerId inválido | 404 | {message: 'Trabajadora no encontrada'} | ⏳ Pendiente |

---

## Pruebas E2E (flujos completos)

Estas simulan el uso real de la app. Se hacen manualmente en el navegador, siguiendo los pasos como si fueras la usuaria.

### Flujo 1: Nueva clienta se registra y reserva un servicio

```
1. Entrar a Home en http://localhost:5173
   ✓ Carga la página
   ✓ Se ven los slides de categorías
   ✓ Hay un botón "Contratar servicios"

2. Click en "Contratar servicios"
   ✓ Redirige a /compromiso
   ✓ Se puede leer el documento
   ✓ El checkbox "Acepto" solo se habilita después de hacer scroll hasta el final

3. Aceptar y registrarse
   ✓ Click "Aceptar y continuar"
   ✓ Redirige a /register-client
   ✓ Llenar formulario (nombre, email, password)
   ✓ Click "Crear cuenta"
   ✓ Se crea el usuario en MongoDB
   ✓ Token se guarda en localStorage

4. Login automático post-registro
   ✓ Redirige a Home logueada
   ✓ Navbar muestra nombre y foto de perfil
   ✓ Aparece "Mi perfil" en el menú

5. Buscar trabajadora
   ✓ Seleccionar región "Metropolitana" y categoría "Limpieza"
   ✓ Click "Buscar"
   ✓ Se ven las tarjetas de trabajadoras con foto, nombre y rating

6. Ver perfil de una trabajadora
   ✓ Click en la tarjeta
   ✓ Redirige a /worker/{id}
   ✓ Se ve descripción, tarifa/hora, índice de confianza
   ✓ Se ven reseñas previas (si las hay)
   ✓ Hay botón "Reservar"

7. Crear la reserva
   ✓ Click "Reservar"
   ✓ Se abre modal con formulario
   ✓ Llenar fecha, duración, notas
   ✓ Click "Confirmar"
   ✓ Booking creado en BD con estado 'pendiente'
   ✓ Aparece mensaje de confirmación

8. Verificar en "Mis reservas"
   ✓ Ir a Mi Perfil → Mis reservas
   ✓ Se ve la reserva en estado "pendiente"
   ✓ Hay botón "Cancelar"
```

Estado: ⏳ Pendiente ejecutar

### Flujo 2: Trabajadora recibe y acepta una reserva

```
1. Registrarse como trabajadora
   ✓ Home → "Ofrecer servicios" → Compromiso → /register-worker
   ✓ Llenar nombre, email, password, RUT
   ✓ Click "Crear cuenta"

2. Completar perfil profesional
   ✓ Login → Mi perfil → "Perfil profesional"
   ✓ Llenar categoría, descripción, tarifa/hora
   ✓ Subir foto de perfil
   ✓ Subir carnet (frente + dorso)
   ✓ Click "Guardar"
   ✓ WorkerProfile creado en BD
   ✓ estadoVerificacion = 'enviado'

3. Ver reservas pendientes
   ✓ Mi Perfil → Mis reservas
   ✓ Se ve la reserva de la clienta con botones "Aceptar" y "Rechazar"

4. Aceptar la reserva
   ✓ Click "Aceptar"
   ✓ Booking.estado pasa a 'aceptado'
   ✓ Aparece mensaje de confirmación
   ✓ La reserva ya no muestra los botones de aceptar/rechazar
```

Estado: ⏳ Pendiente ejecutar

### Flujo 3: Evaluar el servicio después de completarlo

```
1. El servicio se completó (estado 'completado')

2. Clienta deja reseña
   ✓ Mis reservas → Click "Evaluar" en el booking completado
   ✓ Se abre el modal de evaluación
   ✓ Seleccionar estrellas (1-5) y escribir comentario
   ✓ Subir fotos del resultado (opcional)
   ✓ Click "Enviar"

3. Verificar que la reseña aparece
   ✓ Ir al perfil de la trabajadora
   ✓ Se ve la nueva reseña en la sección de reseñas
   ✓ El indiceConfianza se actualizó
```

Estado: ⏳ Pendiente ejecutar

---

## Pruebas de seguridad (Semana 2)

| Prueba | Cómo probarla | Resultado esperado | Estado |
|---|---|---|---|
| Rate Limiting en login | Hacer 6+ intentos fallidos en 15 min | Error 429 Too Many Requests | ⏳ Pendiente |
| Rate Limiting general API | 100+ requests en 15 min al mismo endpoint | Error 429 | ⏳ Pendiente |
| SQL Injection | Ingresar `'; DROP TABLE users; --` en el campo email | No hace nada raro, error de validación normal | ⏳ Pendiente |
| XSS | Ingresar `<script>alert('xss')</script>` en comentario | Se muestra como texto, no ejecuta el script | ⏳ Pendiente |
| CSRF | POST desde otro origen sin el header correcto | Rechazado por CORS | ⏳ Pendiente |
| JWT expirado | Usar un token que ya expiró | Error 401 | ⏳ Pendiente |

Nota: SQL Injection no aplica directamente a MongoDB (no es SQL), pero igual vale la pena verificar que los inputs maliciosos no causen problemas con las queries de Mongoose.

---

## Herramientas para las pruebas

**Postman** — para probar endpoints manualmente, es lo más cómodo para las pruebas de integración. Puedes guardar colecciones con todos los endpoints y sus ejemplos.

**Thunder Client** — plugin de VSCode que hace lo mismo que Postman pero sin salir del editor. Más práctico si no quieres tener otra app abierta.

**Jest + Supertest** — para automatizar las pruebas de integración en el futuro. Por ahora todo es manual.

**Cypress** — para E2E automatizado, también para más adelante.

Ejemplo de prueba manual desde PowerShell (útil cuando no tienes Postman a mano):

```powershell
$body = @{
    email = "test@gmail.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

> **Advertencia PowerShell**: A veces `Invoke-WebRequest` no muestra bien el body de la respuesta. Para verlo, agrega `| Select-Object -ExpandProperty Content` al final. Y si tienes errores con los backticks (`` ` ``) para saltos de línea en PowerShell, escribe todo en una sola línea.

---

## Resumen

| Nivel | Cantidad de casos | Estado |
|---|---|---|
| Unitarias | 15 | ⏳ Planeadas |
| Integración | 30+ | ⏳ Planeadas |
| E2E | 3 flujos | ⏳ Planeadas |
| Seguridad | 6 | ⏳ Planeadas (Semana 2) |

---

Última actualización: 13/04/2026 — Plan pruebas Semana 1 EP2 — Próximo: ejecutar en Semana 2-3
