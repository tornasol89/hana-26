import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API de Hana',
      version: '1.0.0',
      description: 'Plataforma que conecta mujeres que ofrecen y contratan servicios.',
    },
    servers: [
      { url: 'http://localhost:5001', description: 'Desarrollo' },
      { url: process.env.BACKEND_URL || '', description: 'Producción (Render)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en /api/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            mensaje: { type: 'string', example: 'Email o contraseña incorrectos' },
            error: { type: 'string' },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6651...' },
            nombre: { type: 'string', example: 'Ana' },
            apellido: { type: 'string', example: 'Pérez' },
            email: { type: 'string', format: 'email' },
            tipo: { type: 'string', enum: ['clienta', 'trabajadora', 'admin'] },
            region: { type: 'string' },
            comuna: { type: 'string' },
            verificada: { type: 'boolean' },
          },
        },
        WorkerProfile: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6651a...' },
            usuario: {
              oneOf: [
                { type: 'string', description: 'ObjectId sin popular' },
                { $ref: '#/components/schemas/Usuario' },
            ],
        },
        categoria: {
          type: 'string',
          enum: [
        'Estética y belleza', 'Hogar y limpieza', 'Clases y tutorías',
        'Cocina y catering', 'Bienestar y salud', 'Cuidado de mascotas',
        'Cuidado infantil', 'Tecnología y diseño', 'Gasfitería',
        'Electricidad', 'Mecánica', 'Carpintería', 'Plomería',
        'Pintura de interiores', 'Mudanzas y fletes', 'Jardinería',
        'Transporte y traslados',
            ],
        },
        subcategoria: { type: 'string', example: 'Manicure' },
        descripcion: { type: 'string' },
        tarifaHora: { type: 'number', example: 12000 },
        disponible: { type: 'boolean', default: true },
        modalidad: {
          type: 'string',
          enum: ['A domicilio', 'Remoto', 'Retiro y entrega', ''],
        },
        nivelExperiencia: {
          type: 'string',
          enum: ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años', ''],
        },
        serviciosCompletados: { type: 'integer', default: 0 },
        tasaRespuesta: { type: 'integer', default: 100 },
        certificados: {
          type: 'array',
          items: { $ref: '#/components/schemas/Certificado' },
        },
        metricas: { $ref: '#/components/schemas/Metricas' },
        indiceConfianza: { type: 'number', default: 0 },
        certificadaChilevalora: { type: 'boolean', default: false },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        },
    },

    Certificado: {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        nombre: { type: 'string', example: 'Curso de manicure profesional' },
        institucion: { type: 'string', example: 'Chilevalora' },
        urlImagen: { type: 'string', format: 'uri' },
    },
    },

    Metricas: {
    type: 'object',
    description: 'Puntajes 0–5 por dimensión',
    properties: {
        puntualidad: { type: 'number', default: 0 },
        confiabilidad: { type: 'number', default: 0 },
        calidad: { type: 'number', default: 0 },
        comunicacion: { type: 'number', default: 0 },
        precio: { type: 'number', default: 0 },
    },
    },

    Booking: {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        clienta: {
        oneOf: [
            { type: 'string' },
            { $ref: '#/components/schemas/Usuario' },
        ],
        },
        trabajadora: {
        oneOf: [
            { type: 'string' },
            { $ref: '#/components/schemas/WorkerProfile' },
        ],
        },
        servicio: { type: 'string', example: 'Limpieza profunda departamento' },
        fecha: { type: 'string', format: 'date-time', nullable: true },
        descripcion: { type: 'string' },
        estado: {
        type: 'string',
        enum: ['pendiente', 'aceptada', 'en_curso', 'completada', 'rechazada', 'cancelada', 'en_disputa'],
        default: 'pendiente',
        },
        regionServicio: { type: 'string' },
        comunaServicio: { type: 'string' },
        direccionServicio: { type: 'string' },
        inicioConfirmadoPor: { $ref: '#/components/schemas/ConfirmacionDoble' },
        finConfirmadoPor: { $ref: '#/components/schemas/ConfirmacionDoble' },
        disputa: { $ref: '#/components/schemas/Disputa' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    },

    ConfirmacionDoble: {
    type: 'object',
    properties: {
        trabajadora: { type: 'string', format: 'date-time', nullable: true },
        clienta: { type: 'string', format: 'date-time', nullable: true },
    },
    },

    Disputa: {
    type: 'object',
    properties: {
        activa: { type: 'boolean', default: false },
        fase: { type: 'string', enum: ['inicio', 'fin', null], nullable: true },
        motivoTrabajadora: { type: 'string' },
        motivoClienta: { type: 'string' },
        creadaEn: { type: 'string', format: 'date-time', nullable: true },
    },
    },

    Review: {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        reserva: { type: 'string', description: 'ObjectId de la Booking evaluada' },
        autor: {
        oneOf: [
            { type: 'string' },
            { $ref: '#/components/schemas/Usuario' },
        ],
        },
        destinataria: { type: 'string', description: 'ObjectId del usuario evaluado' },
        tipo: {
        type: 'string',
        enum: ['clienta_a_trabajadora', 'trabajadora_a_clienta'],
        },
        estrellas: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
        comentario: { type: 'string' },
        metricas: { $ref: '#/components/schemas/Metricas' },
        createdAt: { type: 'string', format: 'date-time' },
    },
    },

    PortfolioItem: {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        trabajadora: { type: 'string', description: 'ObjectId del WorkerProfile' },
        titulo: { type: 'string', maxLength: 100, example: 'Renovación de baño' },
        descripcion: { type: 'string', maxLength: 300 },
        fotoUrl: { type: 'string', format: 'uri' },
        reserva: { type: 'string', nullable: true, description: 'Booking vinculada (opcional)' },
        respaldada: { type: 'boolean', default: false },
        respaldadaPor: { type: 'string', nullable: true, description: 'ObjectId de la clienta que respalda' },
        fechaRespaldo: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    },       
      },
    },
    AggregacionConteo: {
      type: 'array',
      description: 'Resultado de agregación: pares categoría/conteo',
      items: {
        type: 'object',
        properties: {
            _id:   { type: 'string', description: 'Valor agrupado (estado, categoría, región, etc.)' },
            count: { type: 'integer' },
        },
      },
    },
    Message: {
        type: 'object',
        properties: {
            _id:     { type: 'string' },
            reserva: { type: 'string', description: 'ObjectId de la Booking' },
            autor: {
                oneOf: [
                    { type: 'string' },
                    {
                      type: 'object',
                      properties: {
                        _id:      { type: 'string' },
                        nombre:   { type: 'string' },
                        apellido: { type: 'string' },
                        foto:     { type: 'string', nullable: true },
                        tipo:     { type: 'string', enum: ['clienta', 'trabajadora', 'admin'] },
                    },
        },
      ],
    },
    texto:     { type: 'string' },
    leidoPor:  { type: 'array', items: { type: 'string' }, description: 'ObjectIds que ya leyeron el mensaje' },
    createdAt: { type: 'string', format: 'date-time' },
  },
},
    // Seguridad por defecto: todo protegido salvo donde se sobreescriba con `security: []`
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Registro, login y sesión' },
      { name: 'Workers', description: 'Perfiles profesionales' },
      { name: 'Bookings', description: 'Reservas' },
      { name: 'Reviews', description: 'Evaluaciones mutuas' },
      { name: 'Messages', description: 'Mensajería' },
      { name: 'Admin', description: 'Panel administrativo' },
      { name: 'Portfolio', description: 'Portafolio de trabajos' },
      { name: 'EmailVerification', description: 'Verificación de correo electrónico' },
      { name: 'Messages', description: 'Mensajería entre clienta y trabajadora' },
      { name: 'Portfolio', description: 'Portafolio de trabajos de las trabajadoras' },
    ],
  },
  
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJSDoc(options)