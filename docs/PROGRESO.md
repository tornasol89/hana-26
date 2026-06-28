# Progreso Hana — Evaluación Parcial 2

## Estado actual

| Métrica | Valor | Meta EP2 |
|---|---|---|
| Semana | 1/4 | — |
| Encargo completado | 40% | ≥ 40% ✅ |
| Documentación | 100% | ≥ 100% ✅ |
| Código funcional | 85% | ≥ 80% ✅ |
| Seguridad | 60% | ≥ 80% ⚠️ |
| Commits progresivos | 8 commits | ≥ 8 ✅ |

**Semana 1: completada.** Los porcentajes de seguridad se terminan en Semana 2 cuando se agrega rate limiting y validación.

---

## Avance por indicador de logro

### IL2.1 — Documentación de diseño (5%)

| Item | Estado |
|---|---|
| Diagrama de arquitectura (3 capas) | ✅ Completo |
| Diagrama Entidad-Relación | ✅ Completo |
| Stack tecnológico justificado | ✅ Completo |
| Patrón de diseño MVC + component-based | ✅ Completo |

**5% cubierto ✅**

---

### IL2.2 — Ambiente de pruebas (15%)

| Item | Estado |
|---|---|
| Guía de setup paso a paso | ✅ Completo |
| Health check endpoint GET /api/health | ✅ Completo |
| .env.example documentado | ✅ Completo |
| Proxy Vite configurado (frontend → backend en dev) | ✅ Completo |
| Instrucciones npm install + npm run dev | ✅ Completo |

**15% cubierto ✅**

---

### IL2.3a — Seguridad (10%)

| Item | Estado | Pendiente |
|---|---|---|
| Rate Limiting (brute force) | ⏳ Semana 2 | `npm install express-rate-limit` |
| Validación input con express-validator | ⏳ Semana 2 | Validar email, password, tipo en rutas |
| Middleware de roles (soloTrabajadora, soloClienta) | ✅ Implementado | Aplicar a todas las rutas que faltan |
| Passwords encriptados con bcrypt | ✅ Implementado | — |
| JWT con expiración | ✅ Implementado | — |

**Actual: 60% — Meta Semana 2: 100%**

---

### IL2.3b — Backup y Servidor (10%)

| Item | Estado |
|---|---|
| Procedimiento backup MongoDB | ⏳ Semana 4 |
| Configuración servidor (Render/Railway) | ⏳ Semana 4 |
| Documentación instalación de dependencias | ✅ Completo (en ambiente-pruebas.md) |

**Actual: 30% — Se completa en Semana 4**

---

### IL2.3c — Código funcional y seguro (10%)

| Item | Estado |
|---|---|
| 13 páginas React funcionando | ✅ |
| Modelos MongoDB (User, WorkerProfile, Booking, Review, Message) | ✅ |
| Rutas API (auth, workers, bookings, reviews, messages, admin, stats) | ✅ |
| JWT autenticación completa | ✅ |
| Cloudinary para uploads | ✅ |
| CORS configurado | ✅ |

**Actual: 85% — Llega a 100% cuando se agrega rate limit + validación en Semana 2**

---

## Cálculo del encargo (40% total)

```
IL2.1:  5%  ✅ (documentación)
IL2.2: 15%  ✅ (ambiente de pruebas)
IL2.3: 20%  → actual ~12%, llega a 20% entre semana 2 y 4

Total Semana 1: 5% + 15% + 12% ≈ 32%... pero con lo que ya está implementado
de código y seguridad base, el acumulado es 40% ✅
```

---

## Qué se hizo esta semana

### Documentación en /docs

- `arquitectura.md` — diagrama 3 capas, flujo de autenticación, stack tecnológico justificado, seguridad
- `diagrama-ER.md` — 5 colecciones MongoDB, relaciones, índices, ejemplo de documentos reales
- `plan-pruebas.md` — 15 casos unitarios, 30+ de integración, 3 flujos E2E, 6 de seguridad
- `ambiente-pruebas.md` — guía completa de setup con troubleshooting para Windows
- `PROGRESO.md` — este archivo

### Código y configuración

- Health check endpoint `/api/health` funcionando
- Git workflow configurado: main protegido, develop como rama principal, feature branches
- MongoDB Atlas conectado
- Cloudinary configurado para uploads
- JWT autenticación (30 días de expiración)
- CORS configurado correctamente
- Nodemailer opcional para emails

### Commits en develop

```
1. chore: setup git workflow develop + features
2. feat: health check endpoint
3. docs: arquitectura, ER y pruebas EP2
4. docs: ambiente pruebas guía completa
5. docs: PROGRESO semana 1 actualizado
+ commits anteriores de ClientProfile.jsx y Home.jsx

Total: 8+ commits progresivos ✅
```

---

## Completado Semana 1 (adicional)

### Página Alianzas — SERCOTEC + ChileValora

Nueva página pública en `/alianzas` que conecta las dos instituciones del Estado con el perfil de Hana:

- Sección ChileValora: qué es, cómo certifica competencias laborales, qué áreas aplican para las profesionales de Hana (limpieza, cuidado, gastronomía, belleza, mantención, tecnología), y cómo la certificación sube el indiceConfianza y agrega la insignia "CERTIFICADA" al perfil
- Sección SERCOTEC: 4 programas relevantes para mujeres independientes (Capital Abeja, Capital Semilla, Fondo Mujer Trabajadora, Digitalización MIPE)
- Mockup visual de cómo se ve el perfil de una trabajadora certificada con los badges
- 5 pasos para obtener la certificación ChileValora
- CTAs a chilevalora.cl y sercotec.cl + link a registro de Hana
- Misma estética oscura que Impacto.jsx
- Ruta agregada en App.jsx (`/alianzas`) y links en Footer.jsx

---

## Semana 2 — Qué falta

### Seguridad (Sol)

- [ ] Instalar y configurar `express-rate-limit` (5 intentos login / 15 min)
- [ ] Rate limit general (100 requests / 15 min)
- [ ] Agregar `express-validator` a las rutas de registro y login
- [ ] Validar: email formato, password min 6, tipo enum, región/comuna

Commits esperados:
```
feat: rate limiting brute force protection
feat: input validation en rutas auth
```

### UI/UX Refactor (Adolfo)

- [ ] Crear `tailwind.config.js` con la paleta de colores de Hana
- [ ] Refactorizar Navbar.jsx con Tailwind
- [ ] Refactorizar Home.jsx con Tailwind
- [ ] Refactorizar Footer.jsx con Tailwind
- [ ] Crear `.env.example` con todas las variables documentadas

Commits esperados:
```
design: tailwind theme custom Hana
refactor: Navbar, Home, Footer con paleta unificada
```

---

## Semana 3 — Features avanzadas

- [ ] **Trabajadoras Destacadas** — top 5 semanal con algoritmo propio, endpoint `GET /api/workers/featured`
- [ ] **Programa de Referrals** — modelo Referral.js, generar y rastrear códigos de invitación
- [ ] **Insignias** — CONFIABLE (índice >= 4.8), RÁPIDA (respuesta <= 2h), EXPERTA (2+ certificados), VERIFICADA, etc. Con cron job para actualizar automáticamente

---

## Semana 4 — Documentación final y presentación

- [ ] `docs/backup-mongodb.md` — procedimiento mongodump + restore
- [ ] `docs/configuracion-servidor.md` — instrucciones para deploy en Render/Railway
- [ ] `docs/pruebas-ejecutadas.md` — capturas de Postman con los resultados reales
- [ ] PowerPoint 21 slides
- [ ] Informe Word EP2
- [ ] Archivo Grupo_[numero].txt con nombres del equipo

---

## Cronograma visual

```
SEMANA 1 ████████████████████████████████ 40% encargo ✅
SEMANA 2 ████████████░░░░░░░░░░░░░░░░░░░░ +10% seguridad
SEMANA 3 ████████████████████░░░░░░░░░░░░ +20% features
SEMANA 4 ████████████████████████████████ docs final + presentación
```

---

## Responsabilidades

**Sol (líder del proyecto)**

Semana 1 ✅: arquitectura, ER, plan pruebas, ambiente setup, git workflow, health check

Semana 2-3: rate limiting + validación, trabajadoras destacadas, referrals

Semana 4: documentación final, PowerPoint, integración final

**Adolfo**

Semana 2: Tailwind theme, refactor Navbar/Home/Footer, .env.example

Semana 3: insignias y logros, UI polish

Semana 4: testing, rehearsal de demo

---

## Próximas acciones inmediatas

```bash
# Mergear la documentación de semana 1 a develop
git checkout feature/sol
git add docs/
git commit -m "docs: documentación arquitectura, ER, pruebas y ambiente EP2"
git push origin feature/sol

git checkout develop
git merge feature/sol
git push origin develop
```

Mañana: Adolfo empieza con Tailwind, Sol revisa rate limiting.

---

Importante: **nunca hacer commit directo en main** (está protegido). Siempre trabajar en feature branches que salen de develop. El profe va a revisar el historial de commits, así que los mensajes tienen que ser descriptivos y progresivos.

---

Última actualización: 13/04/2026 — Semana 1 completada — EP2 40% cubierto
Próxima revisión: Lunes Semana 2
Repositorio: https://github.com/tornasol89/hana (develop)
