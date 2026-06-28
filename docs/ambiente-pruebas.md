# Cómo levantar el ambiente de pruebas

Esta guía explica cómo configurar todo para probar Hana localmente. La escribí pensando en que alguien la va a seguir desde cero, así que trato de ser lo más clara posible con los errores típicos que me pasaron a mí.

---

## Antes de empezar

Necesitas tener instalado Node.js v18 o superior. Para verificar:

```bash
node --version
git --version
npm --version
```

Si `node --version` te tira algo como `v16.x.x`, actualiza desde nodejs.org porque algunas dependencias del proyecto lo necesitan en 18+.

También vas a necesitar cuentas en:
- **MongoDB Atlas** — la base de datos está en cloud, no local
- **Cloudinary** — para el almacenamiento de fotos
- Git configurado con tu usuario y email (si no lo tienes: `git config --global user.name "Tu Nombre"`)

---

## Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tornasol89/hana.git
cd hana
git checkout develop
git status
```

Debería decir `On branch develop` y `Your branch is up to date`. Si ves otra rama, asegúrate de hacer el checkout.

> **Nota Windows**: Si estás en PowerShell y el `cd` no te funciona como esperas, prueba con la ruta completa: `cd C:\Users\TuUsuario\Documentos`. No uses tildes en rutas porque PowerShell a veces las rompe.

---

## Paso 2: Instalar dependencias

Primero el backend:

```bash
cd backend
npm install
```

Después el frontend:

```bash
cd ../frontend
npm install
```

Cada uno tarda 2-3 minutos. Es normal que salgan warnings de `deprecated`, eso no es un error. El error real se ve cuando dice `npm ERR!` con letras rojas.

> **Problema común**: En Windows a veces `npm install` falla con errores de permisos del tipo `EACCES` o `EPERM`. Si pasa eso, cierra VSCode, abre PowerShell **como administrador** y vuelve a intentar. O mejor, usa la terminal integrada de VSCode que generalmente tiene menos problemas con esto.

Para verificar que instaló bien, las carpetas `backend/node_modules` y `frontend/node_modules` deben existir y tener cosas adentro.

---

## Paso 3: Configurar las variables de entorno

Esta es la parte donde más gente se traba.

Dentro de `backend/`, copia el archivo de ejemplo:

```bash
cd backend
cp .env.example .env
```

> **En Windows PowerShell**, `cp` puede no funcionar. Usa esto en su lugar:
> ```powershell
> Copy-Item .env.example .env
> ```
> O simplemente copia el archivo manualmente desde el explorador de archivos.

Ahora abre `backend/.env` con tu editor y llena los valores:

```
NODE_ENV=development
PORT=5000

DB_URI=mongodb+srv://[tu_usuario]:[tu_contraseña]@cluster.mongodb.net/hana

JWT_SECRET=cualquier_string_largo_y_aleatorio_minimo_32_caracteres

CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

NODEMAILER_USER=tu_email@gmail.com
NODEMAILER_PASS=tu_app_password_de_16_caracteres

FRONTEND_URL=http://localhost:5173
```

**Dónde sacar cada cosa:**

- `DB_URI`: En MongoDB Atlas → tu cluster → Connect → Drivers → copia el connection string y reemplaza `<password>` con tu contraseña real
- `CLOUDINARY_*`: En cloudinary.com → Dashboard → arriba a la derecha en Settings ves los tres valores
- `NODEMAILER_PASS`: Esto NO es tu contraseña de Gmail normal. Tienes que generar una "app password" en tu cuenta de Google (Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones). Son 16 caracteres sin espacios.
- `JWT_SECRET`: Puedes inventar cualquier string largo. Yo uso algo tipo `hana_super_secret_2026_key_aqui_va_algo_largo`

El archivo `.env` **nunca** se sube a Git (está en `.gitignore`). Si accidentalmente lo subes, cambia todas las claves inmediatamente.

Para el frontend, por defecto no necesita un `.env` propio. Si en algún momento necesitas cambiar la URL del backend:

```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:5000" > .env
```

---

## Paso 4: Verificar que MongoDB conecta

La forma más fácil es simplemente intentar levantar el servidor (paso siguiente) y ver si aparece `Conectado a MongoDB ✓` en los logs. Si no aparece, antes de seguir revisa:

1. Que el `DB_URI` en `.env` esté bien copiado (sin espacios extra, sin el `<password>` literal)
2. Que tu IP esté permitida en MongoDB Atlas → Network Access → Add IP Address. Para pruebas locales, agrega `0.0.0.0/0` (permite cualquier IP, esto está bien para desarrollo)

---

## Paso 5: Levantar el proyecto

Necesitas **dos terminales abiertas al mismo tiempo**.

**Terminal 1 — Backend:**

```bash
cd hana/backend
npm run dev
```

Deberías ver:
```
[nodemon] starting `node src/server.js`
Servidor corriendo en puerto 5000
Conectado a MongoDB ✓
```

Si ves el `Conectado a MongoDB ✓`, el backend está funcionando bien.

**Terminal 2 — Frontend:**

```bash
cd hana/frontend
npm run dev
```

Deberías ver algo así:
```
VITE v8.0.0  ready in 156 ms
➜  Local:   http://localhost:5173/
```

Con eso puedes abrir el navegador en `http://localhost:5173` y ver la app.

> **Problema típico en Windows**: A veces nodemon no detecta cambios en archivos porque Windows tiene un límite en el número de watchers del sistema. Si el servidor no se recarga solo cuando editas código, no te preocupes mucho por eso ahora, igual funciona para pruebas manuales.

---

## Paso 6: Verificar el health check

El endpoint `/api/health` sirve para confirmar que todo está conectado. Abre en el navegador:

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

Si `"db"` dice `"connected"`, genial, el ambiente está listo. Si dice `"disconnected"`, el problema es la conexión a MongoDB (revisa el paso 4).

También puedes probarlo desde PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" | Select-Object -ExpandProperty Content
```

---

## Paso 7: Prueba manual rápida

Para asegurarte que el registro funciona, usa Postman o Thunder Client (el plugin de VSCode):

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

Si responde con código 201 y un `token` en el JSON, el registro está funcionando.

Para ver trabajadoras:
```
GET http://localhost:5000/api/workers
```

Si devuelve `[]` (array vacío), es normal cuando la base de datos está recién creada. No hay nadie registrado todavía.

---

## Errores comunes y cómo arreglarlos

**"Cannot find module 'express'"**

Significa que `npm install` no se completó bien. Borra la carpeta y vuelve a instalar:

```bash
cd backend
rm -rf node_modules
npm cache clean --force
npm install
```

En PowerShell, `rm -rf` puede no funcionar. Usa:
```powershell
Remove-Item -Recurse -Force node_modules
```

**"MongoDB connection failed"**

Casi siempre es por una de estas dos cosas: el `DB_URI` está mal copiado, o tu IP no está en el whitelist de MongoDB Atlas. Ve a Network Access en Atlas y agrega tu IP o usa `0.0.0.0/0`.

**"Port 5000 already in use"**

Hay otro proceso usando ese puerto. Para matarlo en PowerShell:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process
```

O cambia el puerto en `backend/.env`:
```
PORT=5001
```

Si cambias el puerto, también actualiza `FRONTEND_URL` en el `.env` del backend y el proxy en `frontend/vite.config.js`.

**"Cloudinary credentials invalid"**

Ve a cloudinary.com, entra a Settings y copia los tres valores (Cloud Name, API Key, API Secret) de nuevo. A veces se copian con espacios al final que no se ven.

**Página en blanco en el frontend**

Verifica que el servidor de Vite esté corriendo (`npm run dev` en la carpeta frontend). Si está corriendo y sigue en blanco, abre las DevTools del navegador (F12) y mira la pestaña Console para ver el error específico.

---

## Comandos útiles

```bash
# Ver qué está usando el puerto 5000 (PowerShell)
netstat -ano | findstr :5000

# Reinstalar todo desde cero (útil cuando algo raro pasa)
rm -rf node_modules package-lock.json
npm install

# Buildear el frontend para producción (no necesario para pruebas)
cd frontend && npm run build

# Limpiar caché de npm
npm cache clean --force
```

---

## Cómo saber que todo está bien

Si ves todas estas cosas al mismo tiempo, el ambiente está listo:

- `npm run dev` en backend sin errores y con `Conectado a MongoDB ✓`
- `npm run dev` en frontend sin errores
- `http://localhost:5000/api/health` devuelve `"db": "connected"`
- `http://localhost:5173` carga la app en el navegador
- POST a `/api/auth/register` devuelve 201 con token

---

Última actualización: 13/04/2026 — Guía setup Semana 1 EP2
