# ⚙️ CONFIGURACIÓN DEL AMBIENTE DE PRUEBAS

## 1. Requisitos Previos

Antes de empezar, verifica que tienes instalado:

```bash
# Node.js v18 o superior
node --version
# Output esperado: v18.x.x o superior

# Git
git --version
# Output esperado: git version 2.x.x

# npm (viene con Node.js)
npm --version
# Output esperado: 9.x.x o superior
```

Si no tienes Node.js, descárgalo desde: https://nodejs.org/

**También necesitas:**
- Cuenta MongoDB Atlas (base de datos cloud)
- Cuenta Cloudinary (almacenamiento fotos)
- Git configurado con usuario y email

---

## 2. Paso 1: Clonar Repositorio

```bash
# Ve a carpeta donde quieras el proyecto
cd C:\Usuarios\TuUsuario\Documentos

# Clona el repositorio
git clone https://github.com/tornasol89/hana.git
cd hana

# Asegúrate estar en rama develop
git checkout develop
git status

# Output esperado:
# On branch develop
# Your branch is up to date with 'origin/develop'.
```

---

## 3. Paso 2: Instalar Dependencias

### 2.1 Backend

```bash
cd backend
npm install

# Espera 2-3 minutos mientras instala paquetes
# Output final esperado:
# added XXX packages, and audited YYY packages in 2m
```

### 2.2 Frontend

```bash
cd ../frontend
npm install

# Similar, tarda 2-3 minutos
```

**Verificar instalación:**
```bash
# Volver a raíz
cd ..

# Ambas carpetas deben tener carpeta node_modules
ls backend/node_modules | wc -l   # Debe ser > 100
ls frontend/node_modules | wc -l  # Debe ser > 100
```

---

## 4. Paso 3: Configurar Variables de Entorno

### 3.1 Backend .env

```bash
# Ir a carpeta backend
cd backend

# Copiar plantilla .env.example a .env
cp .env.example .env

# Abrir .env con tu editor (Notepad++, VSCode, etc)
# Y llenar con TUS valores:
```

**Contenido de backend/.env:**

```
NODE_ENV=development
PORT=5000

# MongoDB Atlas
# Obtén esta URL de: MongoDB Atlas → Cluster → Connect → Copy connection string
DB_URI=mongodb+srv://[tu_usuario]:[tu_contraseña]@cluster.mongodb.net/hana

# JWT (puede ser cualquier string aleatorio, mínimo 32 caracteres)
JWT_SECRET=tu_clave_super_secreta_aleatoria_minimo_32_caracteres_qqqqqqqqqqqqq

# Cloudinary
# Obtén estos de: cloudinary.com → Dashboard → Settings
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Nodemailer (para enviar emails)
# Usa email Gmail + app password
NODEMAILER_USER=tu_email@gmail.com
NODEMAILER_PASS=tu_app_password_16_caracteres

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANTE:**
- `.env` NO se versionea en Git (está en `.gitignore`)
- Nunca compartas tu `.env` con otros
- `.env.example` SÍ se versionea (sin valores secretos)

### 3.2 Frontend .env (opcional)

Frontend puede funcionar sin .env adicional. Si lo necesitas:

```bash
cd ../frontend

# Crear .env si es necesario
echo "VITE_API_URL=http://localhost:5000" > .env
```

---

## 5. Paso 4: Verificar Conexión a MongoDB

```bash
cd backend

# Ejecuta un comando simple de Node para testear BD
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('✓ MongoDB conectado'))
  .catch(err => console.log('✗ Error:', err.message));
" 2>/dev/null

# O simplemente levanta el servidor (paso siguiente)
```

---

## 6. Paso 5: Levantar Backend y Frontend

### En Terminal 1 - Backend

```bash
cd C:\Users\LENOVO\Desktop\hana\backend
npm run dev

# Output esperado:
# [nodemon] starting `node src/server.js`
# Servidor corriendo en puerto 5000
# Conectado a MongoDB ✓
```

### En Terminal 2 - Frontend

```bash
cd C:\Users\LENOVO\Desktop\hana\frontend
npm run dev

# Output esperado:
# VITE v8.0.0 ready in 156 ms
# ➜  Local:   http://localhost:5173/
# ➜  Press q to quit
```

**Ahora puedes acceder a:**
- Frontend: http://localhost:5173 (ver en navegador)
- Backend API: http://localhost:5000/api

---

## 7. Paso 6: Verificar Health Check

El endpoint `/api/health` verifica que el backend y BD están conectados.

### Opción A: Navegador

```
http://localhost:5000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-04-13T15:30:45.123Z",
  "db": "connected",
  "environment": "development"
}
```

### Opción B: PowerShell

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" | ConvertTo-Json
```

### Opción C: curl (Linux/Mac)

```bash
curl http://localhost:5000/api/health
```

**✓ Si ves `"db": "connected"` → Ambiente OK**

---

## 8. Paso 7: Prueba Manual Rápida

### 8.1 Registrar nueva usuaria

Abre Postman o Thunder Client:

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "nombre": "Test",
  "apellido": "Usuario",
  "email": "test@example.com",
  "password": "password123",
  "tipo": "clienta",
  "region": "Metropolitana",
  "comuna": "Santiago",
  "aceptoCompromiso": true
}
```

**Response esperado (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Test",
    "email": "test@example.com",
    "tipo": "clienta"
  }
}
```

### 8.2 Buscar trabajadoras

```
GET http://localhost:5000/api/workers
```

**Response esperado (200):**
```json
[
  {
    "_id": "...",
    "usuario": {...},
    "categoria": "Limpieza",
    "indiceConfianza": 4.7
  }
]
```

Si devuelve `[]`, es normal (primer uso, sin trabajadoras registradas aún).

---

## 9. Solución de Problemas

### Error: "Cannot find module 'express'"

**Causa:** npm install falló  
**Solución:**
```bash
cd backend
rm -rf node_modules
npm cache clean --force
npm install
```

### Error: "MongoDB connection failed"

**Causas posibles:**
1. `DB_URI` en `.env` es incorrecto
2. IP no está whitelisted en MongoDB Atlas

**Solución:**
```bash
# Verifica DB_URI
cat backend/.env | grep DB_URI

# En MongoDB Atlas:
# 1. Click "Network Access"
# 2. Click "Add IP Address"
# 3. Selecciona "Allow access from anywhere" (0.0.0.0/0)
# 4. Reintentar
```

### Error: "Port 5000 already in use"

**Causa:** Algo más está usando el puerto  
**Solución:**
```bash
# Opción 1: Cambiar puerto
# En backend/.env:
# PORT=5001

# Opción 2: Matar proceso en puerto 5000 (PowerShell)
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process
```

### Error: "Cloudinary credentials invalid"

**Causa:** `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY` o `SECRET` incorrectos  
**Solución:**
```bash
# En cloudinary.com:
# 1. Login
# 2. Click "Settings" (engranaje)
# 3. Copy "Cloud Name", "API Key", "API Secret"
# 4. Pegar en backend/.env
# 5. Reintentar
```

### Frontend página en blanco

**Causa:** Frontend no está corriendo  
**Solución:**
```bash
cd frontend
npm run dev
```

---

## 10. Ambiente Configurado ✅

Cuando veas TODOS estos signos:

- ✅ `npm run dev` en backend sin errores
- ✅ `npm run dev` en frontend sin errores  
- ✅ `curl http://localhost:5000/api/health` devuelve JSON con `"db": "connected"`
- ✅ Frontend carga en http://localhost:5173 sin errores
- ✅ Puedes registrar usuario en Postman (POST /register devuelve 201)

**→ AMBIENTE DE PRUEBAS COMPLETAMENTE LISTO** 🎉

---

## 11. Comandos Útiles

```bash
# Ver logs de backend (con nodemon)
cd backend && npm run dev

# Buildear frontend para producción
cd frontend && npm run build

# Limpiar caches
npm cache clean --force

# Ver qué puerto está usando
# PowerShell:
netstat -ano | findstr :5000

# Reinstalar dependencias limpias
rm -rf node_modules package-lock.json
npm install
```

---

## 12. Verificar Estructura Final

```
hana/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── server.js
│   ├── .env          (con tus valores)
│   ├── .env.example  (plantilla)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── arquitectura.md
│   ├── diagrama-ER.md
│   ├── plan-pruebas.md
│   ├── ambiente-pruebas.md
│   └── PROGRESO.md
│
└── .git/ (repositorio)
```

---

**Fecha de actualización:** 13/04/2026  
**Estado:** Guía setup Semana 1 EP2  
**Responsable:** Equipo Hana
