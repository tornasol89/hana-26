# Diagrama Entidad-Relación — Hana

Acá está la estructura de cómo guardamos los datos en MongoDB. Son 5 colecciones principales y todas giran en torno a la colección `User`.

Una aclaración importante antes de empezar: MongoDB no es relacional como SQL, no hay joins. Las "relaciones" que ves acá se hacen guardando el `_id` de un documento en otro documento, y después se "populan" (traen los datos relacionados) con Mongoose cuando hacemos una query. Si vienes de SQL, la lógica es parecida a las foreign keys pero más manual.

---

## Colección: User

Todo el mundo en el sistema es un `User`: clientas, trabajadoras y administradoras. La diferencia está en el campo `tipo`.

```javascript
{
  _id: ObjectId                          // ID único generado automáticamente por MongoDB
  
  nombre: String                         // requerido, ej: "María"
  apellido: String                       // requerido, ej: "García López"
  email: String                          // único, requerido, ej: "maria@gmail.com"
  password: String                       // encriptado con bcryptjs, mínimo 6 caracteres
  
  tipo: enum ['clienta', 'trabajadora', 'admin']   // requerido
  
  rut: String                            // ej: "12345678-K", para verificación de identidad
  región: String                         // ej: "Metropolitana"
  comuna: String                         // ej: "Santiago"
  foto: String                           // URL en Cloudinary, puede ser null
  
  // Solo se usan para trabajadoras
  carnetFrenteUrl: String                // foto del carnet (subida a Cloudinary)
  carnetDorsoUrl: String
  estadoVerificacion: enum ['sin_enviar', 'enviado', 'aprobado', 'rechazado']
  verificada: Boolean                    // true cuando un admin aprobó el carnet
  
  aceptoCompromiso: Boolean              // requerido, no se puede registrar sin aceptar
  fechaAceptacion: Date
  
  disponible: Boolean                    // si está activa en la plataforma
  activa: Boolean                        // admin puede desactivar sin borrar datos
  
  notasAdmin: String                     // campo interno para notas de administración
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Colección: WorkerProfile

Solo existe para usuarias con `tipo='trabajadora'`. Es la información profesional: qué servicios ofrece, cuánto cobra, sus métricas, etc.

```javascript
{
  _id: ObjectId
  
  usuario: ObjectId                      // referencia a User._id (relación 1:1)
  
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
  ]
  
  subcategoria: String                   // especialidad dentro de la categoría
  descripcion: String                    // presentación profesional, máximo 500 caracteres
  tarifaHora: Number                     // precio en pesos, ej: 20000
  disponible: Boolean                    // si acepta reservas en este momento
  
  modalidad: enum ['A domicilio', 'Remoto', 'Retiro y entrega']
  nivelExperiencia: enum ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años']
  
  serviciosCompletados: Number           // contador de reservas completadas
  tasaRespuesta: Number                  // % de reservas respondidas rápido (0-100)
  
  certificados: [
    {
      nombre: String                     // ej: "Curso de Limpieza Profesional"
      institucion: String                // ej: "SERCOTEC"
      urlImagen: String                  // URL en Cloudinary
    }
  ]
  
  metricas: {
    puntualidad: Number                  // 0-5, promedio de reviews
    confiabilidad: Number
    calidad: Number
    comunicacion: Number
    precio: Number
  }
  
  indiceConfianza: Number                // 0-5, promedio de todas las métricas
  
  createdAt: Date
  updatedAt: Date
}
```

El `indiceConfianza` se recalcula cada vez que alguien deja una reseña. Es lo que aparece como el rating principal en la tarjeta de cada trabajadora.

---

## Colección: Booking

Una reserva es el "contrato" entre una clienta y una trabajadora. Pasa por varios estados a lo largo de su vida.

```javascript
{
  _id: ObjectId
  
  clientaId: ObjectId                    // referencia User._id de la clienta
  trabajadoraId: ObjectId                // referencia User._id de la trabajadora
  
  servicio: String                       // ej: "Limpieza de departamento"
  descripcion: String                    // detalles de lo que se necesita
  
  fechaServicio: Date                    // cuándo se va a realizar el servicio
  duracion: Number                       // horas, ej: 4
  precio: Number                         // acordado entre ambas, en pesos
  
  estado: enum [
    'pendiente',                         // recién creado, trabajadora no respondió
    'aceptado',                          // trabajadora aceptó
    'rechazado',                         // trabajadora rechazó
    'completado',                        // servicio realizado
    'cancelado'                          // alguna de las dos canceló
  ]
  
  notasClienta: String                   // lo que necesita o instrucciones especiales
  notasTrabajadora: String               // respuesta o detalles adicionales
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Colección: Review

Una reseña solo puede existir si ya existe un Booking completado. No se puede evaluar a alguien que no te prestó el servicio.

```javascript
{
  _id: ObjectId
  
  bookingId: ObjectId                    // referencia Booking._id (1:1, un booking = máximo una review)
  reviewadoId: ObjectId                  // referencia User._id de quien se evalúa
  reviewerId: ObjectId                   // referencia User._id de quien evalúa
  
  puntaje: Number                        // 1-5, calificación general
  comentario: String                     // opinión detallada
  
  metricas: {
    puntualidad: Number                  // 1-5
    calidad: Number
    comunicacion: Number
    precio: Number
  }
  
  fotos: [
    {
      url: String                        // URL en Cloudinary
      uploadedAt: Date
      descripcion: String                // ej: "Resultado final limpieza"
    }
  ]
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Colección: Message

Los mensajes de chat están siempre asociados a un Booking. No hay chat libre entre usuarias, todo el contexto de comunicación gira en torno a una reserva.

```javascript
{
  _id: ObjectId
  
  bookingId: ObjectId                    // referencia Booking._id
  de: ObjectId                           // referencia User._id de quien envía
  hacia: ObjectId                        // referencia User._id de quien recibe
  
  contenido: String
  leido: Boolean                         // si el receptor ya lo leyó
  
  createdAt: Date
}
```

---

## Diagrama de relaciones

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
                            ▼
                    ┌───────────────┐
                    │    Review     │
                    │ (evaluaciones)│
                    └───────────────┘
```

Tabla de relaciones:

| Entidad A | Entidad B | Tipo | Descripción |
|---|---|---|---|
| User | WorkerProfile | 1:1 | Cada trabajadora tiene un solo perfil profesional |
| User (clienta) | Booking | 1:N | Una clienta puede tener muchas reservas |
| User (trabajadora) | Booking | 1:N | Una trabajadora puede recibir muchas reservas |
| Booking | Review | 1:1 | Una reserva puede tener máximo una reseña |
| User | Review | 1:N | Una usuaria puede recibir muchas reseñas |
| Booking | Message | 1:N | Un booking puede tener muchos mensajes |

---

## Flujos principales de datos

**Cuando una trabajadora se registra:**

```
POST /api/auth/register → Crear User (tipo='trabajadora')
POST /api/workers/profile → Crear WorkerProfile (usuario = User._id)
```

El WorkerProfile no se crea automáticamente, la trabajadora tiene que completar su perfil profesional en un segundo paso.

**Cuando una clienta reserva:**

```
Clienta hace click en "Reservar"
→ POST /api/bookings → Crear Booking (clientaId, trabajadoraId, estado='pendiente')
→ Trabajadora ve la notificación
→ PUT /api/bookings/:id/aceptar → Booking.estado = 'aceptado'
→ Se realiza el servicio
→ PUT /api/bookings/:id/completar → Booking.estado = 'completado'
→ Clienta puede dejar reseña
→ POST /api/reviews → Crear Review (bookingId, reviewadoId)
→ Se recalcula indiceConfianza de la trabajadora
```

**Chat sobre una reserva:**

```
POST /api/messages → Crear Message (bookingId, de=Clienta._id, hacia=Trabajadora._id)
GET /api/messages/:bookingId → Traer todos los mensajes del booking
```

---

## Índices recomendados en MongoDB

Sin índices, MongoDB revisa todos los documentos de una colección para encontrar lo que buscas. Con índices es mucho más rápido porque mantiene una estructura ordenada de antemano.

```javascript
// User — para login y filtrar por tipo
db.users.createIndex({ email: 1 })
db.users.createIndex({ tipo: 1 })

// WorkerProfile — para búsquedas y ordenamiento
db.workerprofiles.createIndex({ usuario: 1 })
db.workerprofiles.createIndex({ categoria: 1 })
db.workerprofiles.createIndex({ indiceConfianza: -1 })   // -1 = descendente (mayor rating primero)

// Booking — para ver "mis reservas"
db.bookings.createIndex({ clientaId: 1 })
db.bookings.createIndex({ trabajadoraId: 1 })
db.bookings.createIndex({ estado: 1 })

// Review — para ver reseñas de una trabajadora
db.reviews.createIndex({ reviewadoId: 1 })
db.reviews.createIndex({ bookingId: 1 })

// Message — para cargar el chat de una reserva
db.messages.createIndex({ bookingId: 1 })
db.messages.createIndex({ leido: 1 })
```

---

## Ejemplo de documentos reales

Para que quede claro cómo se ve todo junto, acá está un ejemplo de cómo se vería una trabajadora llamada María en la base de datos:

```json
// Documento en la colección users
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "María",
  "apellido": "García",
  "email": "maria.garcia@gmail.com",
  "password": "$2a$10$...(hash bcrypt)...",
  "tipo": "trabajadora",
  "rut": "12345678-K",
  "región": "Metropolitana",
  "comuna": "Santiago",
  "foto": "https://res.cloudinary.com/.../maria.jpg",
  "estadoVerificacion": "aprobado",
  "verificada": true,
  "aceptoCompromiso": true,
  "activa": true,
  "createdAt": "2026-04-01T10:30:00Z"
}

// Documento en la colección workerprofiles (asociado al User de arriba)
{
  "_id": "507f1f77bcf86cd799439012",
  "usuario": "507f1f77bcf86cd799439011",   // ← apunta al _id del User
  "categoria": "Hogar y limpieza",
  "subcategoria": "Limpieza profunda",
  "descripcion": "Limpieza profesional con 5 años de experiencia",
  "tarifaHora": 25000,
  "disponible": true,
  "modalidad": "A domicilio",
  "nivelExperiencia": "3 a 5 años",
  "serviciosCompletados": 45,
  "tasaRespuesta": 98,
  "metricas": {
    "puntualidad": 4.8,
    "confiabilidad": 4.9,
    "calidad": 4.7,
    "comunicacion": 4.6,
    "precio": 4.5
  },
  "indiceConfianza": 4.7
}
```

---

Notas finales sobre el diseño:

- `User` es la entidad central de todo el sistema
- Las clientas no tienen un `ClientProfile` separado, toda su info está en `User`
- No se puede crear una `Review` sin que exista un `Booking` completado (lo valida el backend)
- El campo `activa` de User permite que un admin desactive una cuenta sin perder los datos históricos

---

Última actualización: 13/04/2026 — Documentación Semana 1 EP2
