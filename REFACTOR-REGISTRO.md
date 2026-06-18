> cat > /Users/adolfo/Desktop/Hana/hana-26/REFACTOR-REGISTRO.md << 'EOF'
# Refactor pendiente: Registro.tsx → arquitectura modular

> Tarjeta Trello: #T31 (a crear)
> Tiempo estimado: 1.5 - 2 horas
> Prioridad: media-alta (deuda técnica acumulada)

## Contexto

El archivo `frontend/src/pages/Registro.tsx` actualmente tiene ~600
líneas en un solo componente. Mezcla:

- Lógica de UI (gradiente, blobs, animaciones de tornasol)
- Lógica de state (11 campos)
- Lógica de persistencia (sessionStorage draft)
- Lógica de validación (7 validaciones inline en submit)
- Lógica de capitalización + formateo
- Lógica de selects dependientes (región → comuna)

Esto fue resultado de una mezcla de urgencia entre:
1. La versión visual nueva de tornasol (post-merge del 14/05)
2. La lógica de validación que agregó Adolfo (fechaNacimiento + RUT)

Funciona, pero no es sostenible ni testeable.

## Objetivo

Llevar `Registro.tsx` a < 80 líneas. Solo debería ORQUESTAR
componentes pequeños y especializados.

## Estructura propuesta 
frontend/src/features/auth/
├── components/
│   ├── RegistroForm.tsx              (form completo, orquesta sub-componentes)
│   ├── RegistroHeader.tsx            (cabecera con gradiente + shimmer)
│   ├── TipoCuentaSelector.tsx        (botones clienta/trabajadora con íconos)
│   ├── PasswordFields.tsx            (password + confirmar con ojitos)
│   ├── RutInput.tsx                  (input + validación visual rojo/verde + onBlur formato)
│   ├── FechaNacimientoInput.tsx      (input date + min/max calculados + texto ayuda)
│   ├── NombreApellidoFields.tsx      (inputs con capitalización onBlur)
│   ├── UbicacionFields.tsx           (select región + select comuna dependiente)
│   └── CompromisoBox.tsx             (caja de aceptación del compromiso)
├── hooks/
│   └── useRegistroDraft.ts           (persistencia en sessionStorage)
├── utils/
│   └── validacionRegistro.ts         (función central de validación)
└── pages/  (sin cambio)
└── Registro.tsx                  (~50 líneas, solo orquesta RegistroForm) 
## Plan paso a paso (1.5-2 hs)

### Fase 1: hooks y utilidades (30 min)

**A. Crear `frontend/src/features/auth/hooks/useRegistroDraft.ts`**

Encapsula:
- Lectura del sessionStorage
- Guardado del draft
- Limpieza al registrar exitoso

Interfaz tentativa:
```typescript
export function useRegistroDraft() {
  const [draft, setDraft] = useState<RegistroDraft>(...);
  function guardarDraft(parcial: Partial<RegistroDraft>) { ... }
  function limpiarDraft() { ... }
  return { draft, guardarDraft, limpiarDraft };
}
```

**B. Crear `frontend/src/features/auth/utils/validacionRegistro.ts`**

Centraliza todas las validaciones del submit:

```typescript
export interface RegistroFormData {
  nombre: string;
  apellido: string;
  password: string;
  confirmarPassword: string;
  rut: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  aceptoCompromiso: boolean;
}

export function validarRegistro(data: RegistroFormData): string | null {
  // Retorna null si OK, mensaje de error legible si falla
  if (!data.nombre.trim() || !data.apellido.trim()) return "Completa tu nombre y apellido";
  if (data.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  // ... etc
  return null;
}
```

### Fase 2: componentes UI pequeños (45 min)

Cada componente toma props mínimas y se encarga de UNA cosa.

**A. `RegistroHeader.tsx`** (~30 líneas)
- Props: ninguna (es puro UI)
- Renderiza: logo, "Únete a Hana", gradiente, shimmer

**B. `TipoCuentaSelector.tsx`** (~40 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: 2 botones clienta/trabajadora con íconos

**C. `NombreApellidoFields.tsx`** (~50 líneas)
- Props: `{ nombre, apellido, onNombreChange, onApellidoChange, disabled }`
- Renderiza: 2 inputs en grid con capitalización onBlur

**D. `RutInput.tsx`** (~50 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: input + validación visual (rojo/verde) + mensaje + onBlur formateo

**E. `FechaNacimientoInput.tsx`** (~30 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: input date + texto ayuda
- Calcula getFechaMinima/Maxima internamente

**F. `UbicacionFields.tsx`** (~50 líneas)
- Props: `{ region, comuna, onRegionChange, onComunaChange, disabled }`
- Renderiza: select región + select comuna dependiente
- Maneja COMUNAS_POR_REGION internamente

**G. `PasswordFields.tsx`** (~80 líneas)
- Props: `{ password, confirmarPassword, onPasswordChange, onConfirmarChange, disabled }`
- Renderiza: 2 inputs con ojito + validación visual
- Maneja showPassword/showConfirmar internamente

**H. `CompromisoBox.tsx`** (~50 líneas)
- Props: `{ aceptado, onIrACompromiso }`
- Renderiza: caja verde (aceptado) o amarilla (pendiente)

### Fase 3: RegistroForm.tsx (30 min)

`frontend/src/features/auth/components/RegistroForm.tsx`

Orquesta todos los componentes anteriores. Maneja el state global del form.

```typescript
export function RegistroForm() {
  const { draft, guardarDraft, limpiarDraft } = useRegistroDraft();
  const [tipo, setTipo] = useState(draft.tipo);
  const [nombre, setNombre] = useState(draft.nombre);
  // ... (todos los states)
  const register = useRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validarRegistro({ nombre, apellido, ... });
    if (error) { toast.error(error); return; }
    register.mutate({ ... }, { onSuccess: ... });
  }

  return (
    <form onSubmit={handleSubmit}>
      <TipoCuentaSelector value={tipo} onChange={setTipo} ... />
      <NombreApellidoFields nombre={nombre} apellido={apellido} ... />
      <EmailInput ... />
      <RutInput value={rut} onChange={setRut} ... />
      <FechaNacimientoInput value={fechaNacimiento} ... />
      <UbicacionFields ... />
      <PasswordFields ... />
      <CompromisoBox ... />
      <SubmitButton ... />
    </form>
  );
}
```

### Fase 4: Registro.tsx final (15 min)

`frontend/src/pages/Registro.tsx`

Solo orquesta el layout + el form. ~50 líneas.

```typescript
import { RegistroHeader } from "@/features/auth/components/RegistroHeader";
import { RegistroForm } from "@/features/auth/components/RegistroForm";

const Registro = () => (
  <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
    <BlobsDecoBackground />
    <Navbar />
    <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="rounded-2xl shadow-soft overflow-hidden">
          <RegistroHeader />
          <div className="bg-card px-8 pt-6 pb-8">
            <RegistroForm />
            <LoginLink />
          </div>
        </div>
      </div>
    </div>
  </div>
);
```

### Fase 5: tests visuales y commit (15 min)

Tests visuales completos:
- [ ] Registro nuevo con datos válidos
- [ ] Capitalización al perder foco
- [ ] Validación de RUT en vivo (rojo/verde)
- [ ] Date input con min/max funcionando
- [ ] Selects dependientes región/comuna
- [ ] Password ojito + validación visual
- [ ] Compromiso ida y vuelta con draft persistente

Commit con mensaje:## Plan paso a paso (1.5-2 hs)

### Fase 1: hooks y utilidades (30 min)

**A. Crear `frontend/src/features/auth/hooks/useRegistroDraft.ts`**

Encapsula:
- Lectura del sessionStorage
- Guardado del draft
- Limpieza al registrar exitoso

Interfaz tentativa:
```typescript
export function useRegistroDraft() {
  const [draft, setDraft] = useState<RegistroDraft>(...);
  function guardarDraft(parcial: Partial<RegistroDraft>) { ... }
  function limpiarDraft() { ... }
  return { draft, guardarDraft, limpiarDraft };
}
```

**B. Crear `frontend/src/features/auth/utils/validacionRegistro.ts`**

Centraliza todas las validaciones del submit:

```typescript
export interface RegistroFormData {
  nombre: string;
  apellido: string;
  password: string;
  confirmarPassword: string;
  rut: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  aceptoCompromiso: boolean;
}

export function validarRegistro(data: RegistroFormData): string | null {
  // Retorna null si OK, mensaje de error legible si falla
  if (!data.nombre.trim() || !data.apellido.trim()) return "Completa tu nombre y apellido";
  if (data.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  // ... etc
  return null;
}
```

### Fase 2: componentes UI pequeños (45 min)

Cada componente toma props mínimas y se encarga de UNA cosa.

**A. `RegistroHeader.tsx`** (~30 líneas)
- Props: ninguna (es puro UI)
- Renderiza: logo, "Únete a Hana", gradiente, shimmer

**B. `TipoCuentaSelector.tsx`** (~40 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: 2 botones clienta/trabajadora con íconos

**C. `NombreApellidoFields.tsx`** (~50 líneas)
- Props: `{ nombre, apellido, onNombreChange, onApellidoChange, disabled }`
- Renderiza: 2 inputs en grid con capitalización onBlur

**D. `RutInput.tsx`** (~50 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: input + validación visual (rojo/verde) + mensaje + onBlur formateo

**E. `FechaNacimientoInput.tsx`** (~30 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: input date + texto ayuda
- Calcula getFechaMinima/Maxima internamente

**F. `UbicacionFields.tsx`** (~50 líneas)
- Props: `{ region, comuna, onRegionChange, onComunaChange, disabled }`
- Renderiza: select región + select comuna dependiente
- Maneja COMUNAS_POR_REGION internamente

**G. `PasswordFields.tsx`** (~80 líneas)
- Props: `{ password, confirmarPassword, onPasswordChange, onConfirmarChange, disabled }`
- Renderiza: 2 inputs con ojito + validación visual
- Maneja showPassword/showConfirmar internamente

**H. `CompromisoBox.tsx`** (~50 líneas)
- Props: `{ aceptado, onIrACompromiso }`
- Renderiza: caja verde (aceptado) o amarilla (pendiente)

### Fase 3: RegistroForm.tsx (30 min)

`frontend/src/features/auth/components/RegistroForm.tsx`

Orquesta todos los componentes anteriores. Maneja el state global del form.

```typescript
export function RegistroForm() {
  const { draft, guardarDraft, limpiarDraft } = useRegistroDraft();
  const [tipo, setTipo] = useState(draft.tipo);
  const [nombre, setNombre] = useState(draft.nombre);
  // ... (todos los states)
  const register = useRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validarRegistro({ nombre, apellido, ... });
    if (error) { toast.error(error); return; }
    register.mutate({ ... }, { onSuccess: ... });
  }

  return (
    <form onSubmit={handleSubmit}>
      <TipoCuentaSelector value={tipo} onChange={setTipo} ... />
      <NombreApellidoFields nombre={nombre} apellido={apellido} ... />
      <EmailInput ... />
      <RutInput value={rut} onChange={setRut} ... />
      <FechaNacimientoInput value={fechaNacimiento} ... />
      <UbicacionFields ... />
      <PasswordFields ... />
      <CompromisoBox ... />
      <SubmitButton ... />
    </form>
  );
}
```

### Fase 4: Registro.tsx final (15 min)

`frontend/src/pages/Registro.tsx`

Solo orquesta el layout + el form. ~50 líneas.

```typescript
import { RegistroHeader } from "@/features/auth/components/RegistroHeader";
import { RegistroForm } from "@/features/auth/components/RegistroForm";

const Registro = () => (
  <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
    <BlobsDecoBackground />
    <Navbar />
    <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="rounded-2xl shadow-soft overflow-hidden">
          <RegistroHeader />
          <div className="bg-card px-8 pt-6 pb-8">
            <RegistroForm />
            <LoginLink />
          </div>
        </div>
      </div>
    </div>
  </div>
);
```

### Fase 5: tests visuales y commit (15 min)

Tests visuales completos:
- [ ] Registro nuevo con datos válidos
- [ ] Capitalización al perder foco
- [ ] Validación de RUT en vivo (rojo/verde)
- [ ] Date input con min/max funcionando
- [ ] Selects dependientes región/comuna
- [ ] Password ojito + validación visual
- [ ] Compromiso ida y vuelta con draft persistente

Commit con mensaje:## Plan paso a paso (1.5-2 hs)

### Fase 1: hooks y utilidades (30 min)

**A. Crear `frontend/src/features/auth/hooks/useRegistroDraft.ts`**

Encapsula:
- Lectura del sessionStorage
- Guardado del draft
- Limpieza al registrar exitoso

Interfaz tentativa:
```typescript
export function useRegistroDraft() {
  const [draft, setDraft] = useState<RegistroDraft>(...);
  function guardarDraft(parcial: Partial<RegistroDraft>) { ... }
  function limpiarDraft() { ... }
  return { draft, guardarDraft, limpiarDraft };
}
```

**B. Crear `frontend/src/features/auth/utils/validacionRegistro.ts`**

Centraliza todas las validaciones del submit:

```typescript
export interface RegistroFormData {
  nombre: string;
  apellido: string;
  password: string;
  confirmarPassword: string;
  rut: string;
  fechaNacimiento: string;
  region: string;
  comuna: string;
  aceptoCompromiso: boolean;
}

export function validarRegistro(data: RegistroFormData): string | null {
  // Retorna null si OK, mensaje de error legible si falla
  if (!data.nombre.trim() || !data.apellido.trim()) return "Completa tu nombre y apellido";
  if (data.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  // ... etc
  return null;
}
```

### Fase 2: componentes UI pequeños (45 min)

Cada componente toma props mínimas y se encarga de UNA cosa.

**A. `RegistroHeader.tsx`** (~30 líneas)
- Props: ninguna (es puro UI)
- Renderiza: logo, "Únete a Hana", gradiente, shimmer

**B. `TipoCuentaSelector.tsx`** (~40 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: 2 botones clienta/trabajadora con íconos

**C. `NombreApellidoFields.tsx`** (~50 líneas)
- Props: `{ nombre, apellido, onNombreChange, onApellidoChange, disabled }`
- Renderiza: 2 inputs en grid con capitalización onBlur

**D. `RutInput.tsx`** (~50 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: input + validación visual (rojo/verde) + mensaje + onBlur formateo

**E. `FechaNacimientoInput.tsx`** (~30 líneas)
- Props: `{ value, onChange, disabled }`
- Renderiza: input date + texto ayuda
- Calcula getFechaMinima/Maxima internamente

**F. `UbicacionFields.tsx`** (~50 líneas)
- Props: `{ region, comuna, onRegionChange, onComunaChange, disabled }`
- Renderiza: select región + select comuna dependiente
- Maneja COMUNAS_POR_REGION internamente

**G. `PasswordFields.tsx`** (~80 líneas)
- Props: `{ password, confirmarPassword, onPasswordChange, onConfirmarChange, disabled }`
- Renderiza: 2 inputs con ojito + validación visual
- Maneja showPassword/showConfirmar internamente

**H. `CompromisoBox.tsx`** (~50 líneas)
- Props: `{ aceptado, onIrACompromiso }`
- Renderiza: caja verde (aceptado) o amarilla (pendiente)

### Fase 3: RegistroForm.tsx (30 min)

`frontend/src/features/auth/components/RegistroForm.tsx`

Orquesta todos los componentes anteriores. Maneja el state global del form.

```typescript
export function RegistroForm() {
  const { draft, guardarDraft, limpiarDraft } = useRegistroDraft();
  const [tipo, setTipo] = useState(draft.tipo);
  const [nombre, setNombre] = useState(draft.nombre);
  // ... (todos los states)
  const register = useRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validarRegistro({ nombre, apellido, ... });
    if (error) { toast.error(error); return; }
    register.mutate({ ... }, { onSuccess: ... });
  }

  return (
    <form onSubmit={handleSubmit}>
      <TipoCuentaSelector value={tipo} onChange={setTipo} ... />
      <NombreApellidoFields nombre={nombre} apellido={apellido} ... />
      <EmailInput ... />
      <RutInput value={rut} onChange={setRut} ... />
      <FechaNacimientoInput value={fechaNacimiento} ... />
      <UbicacionFields ... />
      <PasswordFields ... />
      <CompromisoBox ... />
      <SubmitButton ... />
    </form>
  );
}
```

### Fase 4: Registro.tsx final (15 min)

`frontend/src/pages/Registro.tsx`

Solo orquesta el layout + el form. ~50 líneas.

```typescript
import { RegistroHeader } from "@/features/auth/components/RegistroHeader";
import { RegistroForm } from "@/features/auth/components/RegistroForm";

const Registro = () => (
  <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
    <BlobsDecoBackground />
    <Navbar />
    <div className="flex items-center justify-center min-h-screen pt-20 pb-8 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="rounded-2xl shadow-soft overflow-hidden">
          <RegistroHeader />
          <div className="bg-card px-8 pt-6 pb-8">
            <RegistroForm />
            <LoginLink />
          </div>
        </div>
      </div>
    </div>
  </div>
);
```

### Fase 5: tests visuales y commit (15 min)

Tests visuales completos:
- [ ] Registro nuevo con datos válidos
- [ ] Capitalización al perder foco
- [ ] Validación de RUT en vivo (rojo/verde)
- [ ] Date input con min/max funcionando
- [ ] Selects dependientes región/comuna
- [ ] Password ojito + validación visual
- [ ] Compromiso ida y vuelta con draft persistente

Commit con mensaje:refactor(auth): extraer componentes modulares de Registro.tsx

Extrae 8 componentes especializados a features/auth/components/
Extrae useRegistroDraft hook
Centraliza validaciones en validacionRegistro util
Registro.tsx pasa de 600 a ~50 líneas
Mejora testabilidad y reusabilidad

Sin cambio funcional. Misma UI y comportamiento. 
## Beneficios esperados

- Cada componente < 80 líneas → fácil de leer
- Lógica de validación centralizada → fácil agregar campos
- Hook useRegistroDraft reusable en wizard de edición
- Componentes reusables en EditarPerfilForm (cuando se haga)
- Sin lógica mezclada con UI

## Cuidados al hacer el refactor

- NO cambiar el comportamiento. Es 100% refactor, no nuevas features.
- Probar visualmente después de cada extracción (no esperar al final).
- Si algún sub-componente queda con > 100 líneas, hay que sub-dividirlo más.
- Mantener los mismos className de Tailwind para no romper estilos.

## Referencias

- Archivo monolítico actual: `frontend/src/pages/Registro.tsx` (~600 líneas)
- Commit donde se mezcló: TBD (próximo commit del 14/05)
