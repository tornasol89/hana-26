# 📊 DIAGRAMA ENTIDAD-RELACIÓN (ER) - HANA

## 1. Modelos MongoDB

### 1.1 Colección: User

Representa a todas las usuarias del sistema (clientas, trabajadoras o admin).

```javascript
{
  _id: ObjectId (único, generado automáticamente)
  
  // Datos básicos
  nombre: String (requerido, ej: "María")
  apellido: String (requerido, ej: "García López")
  email: String (único, requerido, ej: "maria@gmail.com")
  password: String (encriptado con bcryptjs, min 6 caracteres)
  
  // Tipo de usuario
  tipo: enum ['clienta', 'trabajadora', 'admin'] (requerido)
  
  // Información personal
  rut: String (ej: "12345678-K", para verificación)
  región: String (ej: "Metropolitana")
  comuna: String (ej: "Santiago")
  foto: String (URL en Cloudinary, puede ser null)
  
  // Verificación de identidad
  carnetFrenteUrl: String (URL foto carnet frente, solo trabajadoras)
  carnetDorsoUrl: String (URL foto carnet dorso, solo trabajadoras)
  estadoVerificacion: enum ['sin_enviar', 'enviado', 'aprobado', 'rechazado']
  verificada: Boolean (true si admin aprobó carnet)
  
  // Compromiso Hana (Términos de servicio)
  aceptoCompromiso: Boolean (requerido para registrarse)
  fechaAceptacion: Date (cuándo aceptó)
  
  // Estado de cuenta
  disponible: Boolean (activa en plataforma)
  activa: Boolean (admin puede desactivar sin borrar datos)
  
  // Admin
  notasAdmin: String (notas internas)
  
  // Timestamps automáticos
  createdAt: Date (cuándo se creó cuenta)
  updatedAt: Date (última actualización)
}
```

---

### 1.2 Colección: WorkerProfile

Perfil profesional de trabajadoras (extensión de User cuando tipo='trabajadora').

```javascript
{
  _id: ObjectId (único)
  
  // Relación con User
  usuario: ObjectId → referencia a User._id (1:1)
  
  // Servicio que ofrece
  categoria: enum [
    'Estética y belleza',
    'Hogar y limpieza',
    'Clases y tutorías',
    'Cocina y catering',
    'Bienestar y salud',
    'Cuidado de mascotas',
    'Cuidado infantil',
    'Tecnología y diseño',
    'Gasfitería',
    'Electricidad',
    'Mecánica',
    'Carpintería',
    'Plomería',
    'Pintura de interiores',
    'Mudanzas y fletes',
    'Jardinería',
    'Transporte y traslados'
  ] (requerido)
  
  subcategoria: String (especialidad dentro categoría, ej: "Limpieza profunda")
  descripcion: String (presentación profesional, max 500 caracteres)
  
  // Tarifa y disponibilidad
  tarifaHora: Number (precio en pesos, ej: 20000)
  disponible: Boolean (actualmente disponible para reservas)
  
  // Modalidad de atención
  modalidad: enum ['A domicilio', 'Remoto', 'Retiro y entrega'] (ej: "A domicilio")
  
  // Experiencia
  nivelExperiencia: enum ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años']
  
  // Estadísticas de trabajo
  serviciosCompletados: Number (total de reservas aceptadas)
  tasaRespuesta: Number (% de reservas respondidas rápido, 0-100)
  
  // Certificaciones/Cursos
  certificados: [
    {
      nombre: String (ej: "Curso de Limpieza Profesional")
      institucion: String (ej: "SERCOTEC")
      urlImagen: String (URL en Cloudinary)
    }
  ]
  
  // Métricas de evaluación (basadas en reviews)
  metricas: {
    puntualidad: Number (0-5, promedio)
    confiabilidad: Number (0-5)
    calidad: Number (0-5)
    comunicacion: Number (0-5)
    precio: Number (0-5)
  }
  
  // Índice de confianza Hana
  indiceConfianza: Number (0-5, promedio de todas metricas)
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

### 1.3 Colección: Booking

Reservas de servicios entre clienta y trabajadora.

```javascript
{
  _id: ObjectId (único)
  
  // Partes involucradas (relaciones N:1)
  clientaId: ObjectId → referencia User._id (quién reserva)
  trabajadoraId: ObjectId → referencia User._id (quién ofrece)
  
  // Detalles del servicio
  servicio: String (ej: "Limpieza de departamento")
  descripcion: String (detalles del trabajo solicitado)
  
  // Fecha y duración
  fechaServicio: Date (cuándo se ejecuta)
  duracion: Number (horas, ej: 4)
  
  // Costo
  precio: Number (pesos, acordado entre ambas)
  
  // Estado del proceso
  estado: enum [
    'pendiente',      // Trabajadora no ha respondido aún
    'aceptado',       // Trabajadora aceptó
    'rechazado',      // Trabajadora rechazó
    'completado',     // Servicio ejecutado
    'cancelado'       // Alguna canceló
  ]
  
  // Comunicación
  notasClienta: String (lo que la clienta necesita)
  notasTrabajadora: String (respuesta o detalles)
  
  // Timestamps
  createdAt: Date (cuándo se creó reserva)
  updatedAt: Date
}
```

---

### 1.4 Colección: Review

Reseñas y evaluaciones después de completar servicio.

```javascript
{
  _id: ObjectId (único)
  
  // Referencia a reserva
  bookingId: ObjectId → referencia Booking._id (1:1)
  
  // Quién evalúa a quién
  reviewadoId: ObjectId → referencia User._id (a quién se evalúa)
  reviewerId: ObjectId → referencia User._id (quién evalúa)
  
  // Calificación
  puntaje: Number (1-5, calificación general)
  comentario: String (opinión detallada)
  
  // Métricas desglosadas
  metricas: {
    puntualidad: Number (1-5)
    calidad: Number (1-5)
    comunicacion: Number (1-5)
    precio: Number (1-5)
  }
  
  // Evidencia (fotos del trabajo)
  fotos: [
    {
      url: String (URL en Cloudinary)
      uploadedAt: Date (cuándo se subió)
      descripcion: String (ej: "Resultado final limpieza")
    }
  ]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

### 1.5 Colección: Message

Mensajes de chat entre usuarias sobre una reserva.

```javascript
{
  _id: ObjectId (único)
  
  // Contexto
  bookingId: ObjectId → referencia Booking._id (1:N, muchos mensajes por reserva)
  
  // Partes del chat
  de: ObjectId → referencia User._id (quién envía)
  hacia: ObjectId → referencia User._id (quién recibe)
  
  // Contenido
  contenido: String (el mensaje)
  leido: Boolean (si receptor ya lo leyó)
  
  // Timestamp
  createdAt: Date
}
```

---

## 2. Diagrama Visual de Relaciones

```
                    ┌──────────────┐
                    │     User     │
                    │ (usuarias)   │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      (1:1)            (N:1)           (N:1)
          │                │                │
          ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │WorkerProfile │ │   Booking    │ │   Message    │
    │(si trabaja)  │ │ (reservas)   │ │   (chat)     │
    └──────────────┘ └──────┬───────┘ └──────────────┘
                            │
                        (1:1)│
                            │
                    ┌───────▼────────┐
                    │     Review     │
                    │  (evaluaciones)│
                    └────────────────┘
```

---

## 3. Tabla de Relaciones

| Entidad A | Entidad B | Tipo | Descripción | Cardinalidad |
|---|---|---|---|---|
| User | WorkerProfile | 1:1 | Una trabajadora tiene UN perfil profesional | 1 User → 1 WorkerProfile |
| User (clienta) | Booking | 1:N | Una clienta hace MUCHAS reservas | 1 User → N Booking |
| User (trabajadora) | Booking | 1:N | Una trabajadora recibe MUCHAS reservas | 1 User → N Booking |
| Booking | Review | 1:1 | Una reserva genera UNA reseña máximo | 1 Booking → 1 Review |
| User | Review | 1:N | Una usuaria recibe MUCHAS reseñas | 1 User → N Review |
| Booking | Message | 1:N | Una reserva tiene MUCHOS mensajes | 1 Booking → N Message |

---

## 4. Flujos de Datos Principales

### Flujo: Trabajadora se registra

```
1. POST /api/auth/register
   → Crear User (tipo='trabajadora')

2. POST /api/workers/profile
   → Crear WorkerProfile (usuario_id → User._id)

3. Relación establecida: User ←1:1→ WorkerProfile
```

### Flujo: Clienta reserva servicio

```
1. Clienta clickea "Reservar" en perfil trabajadora
   → Crea Booking
   → clientaId = Clienta._id
   → trabajadoraId = Trabajadora._id
   → estado = 'pendiente'

2. Trabajadora acepta
   → Booking.estado = 'aceptado'

3. Servicio completado
   → Booking.estado = 'completado'

4. Clienta deja reseña
   → Crear Review
   → bookingId = Booking._id
   → reviewadoId = Trabajadora._id
```

### Flujo: Chat sobre reserva

```
1. Clienta envía mensaje
   → Crear Message
   → bookingId = Booking._id
   → de = Clienta._id
   → hacia = Trabajadora._id

2. Trabajadora responde
   → Crear Message
   → de = Trabajadora._id
   → hacia = Clienta._id
```

---

## 5. Índices Optimizados

MongoDB debería tener índices en:

```javascript
// User
db.users.createIndex({ email: 1 })        // Login rápido
db.users.createIndex({ tipo: 1 })         // Filtrar por tipo

// WorkerProfile
db.workerprofiles.createIndex({ usuario: 1 })     // 1:1 rápido
db.workerprofiles.createIndex({ categoria: 1 })   // Búsqueda por categoría
db.workerprofiles.createIndex({ indiceConfianza: -1 }) // Ordenar destacadas

// Booking
db.bookings.createIndex({ clientaId: 1 })        // Mis reservas cliente
db.bookings.createIndex({ trabajadoraId: 1 })    // Mis reservas trabajadora
db.bookings.createIndex({ estado: 1 })           // Filtrar por estado

// Review
db.reviews.createIndex({ reviewadoId: 1 })       // Reseñas de trabajadora
db.reviews.createIndex({ bookingId: 1 })         // Única por reserva

// Message
db.messages.createIndex({ bookingId: 1 })        // Mensajes por reserva
db.messages.createIndex({ leido: 1 })            // Chat no leído
```

---

## 6. Ejemplo de Documento Completo

### Usuario Trabajadora (María)

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "nombre": "María",
  "apellido": "García",
  "email": "maria.garcia@gmail.com",
  "password": "$2a$10$...(encriptado)...",
  "tipo": "trabajadora",
  "rut": "12345678-K",
  "región": "Metropolitana",
  "comuna": "Santiago",
  "foto": "https://res.cloudinary.com/.../maria.jpg",
  "carnetFrenteUrl": "https://res.cloudinary.com/.../carnet_frente.jpg",
  "carnetDorsoUrl": "https://res.cloudinary.com/.../carnet_dorso.jpg",
  "estadoVerificacion": "aprobado",
  "verificada": true,
  "aceptoCompromiso": true,
  "fechaAceptacion": "2026-04-01T10:30:00Z",
  "disponible": true,
  "activa": true,
  "notasAdmin": "Verificada - usuario de confianza",
  "createdAt": "2026-04-01T10:30:00Z",
  "updatedAt": "2026-04-13T15:45:00Z"
}

// Su WorkerProfile asociado
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "usuario": ObjectId("507f1f77bcf86cd799439011"),
  "categoria": "Hogar y limpieza",
  "subcategoria": "Limpieza profunda",
  "descripcion": "Limpieza profesional con 5 años de experiencia",
  "tarifaHora": 25000,
  "disponible": true,
  "modalidad": "A domicilio",
  "nivelExperiencia": "3 a 5 años",
  "serviciosCompletados": 45,
  "tasaRespuesta": 98,
  "certificados": [
    {
      "nombre": "Limpieza Profesional",
      "institucion": "SERCOTEC",
      "urlImagen": "https://res.cloudinary.com/.../certificado.pdf"
    }
  ],
  "metricas": {
    "puntualidad": 4.8,
    "confiabilidad": 4.9,
    "calidad": 4.7,
    "comunicacion": 4.6,
    "precio": 4.5
  },
  "indiceConfianza": 4.7,
  "createdAt": "2026-04-01T11:00:00Z",
  "updatedAt": "2026-04-13T15:45:00Z"
}
```

---

## 7. Notas Importantes

- **User es la entidad central:** Todas las otras referencias apuntan a User
- **WorkerProfile es opcional:** Solo existe si User.tipo='trabajadora'
- **ClientProfile no existe:** Clientas usan directamente User
- **Booking conecta dos Users:** Como cliente y como trabajadora
- **Review requiere Booking:** No se puede reseñar sin haber reservado
- **Índices son críticos:** Sin ellos, búsquedas pueden ser lentas

---

**Fecha de actualización:** 13/04/2026  
**Estado:** Documentación Semana 1 EP2  
**Responsable:** Equipo Hana
