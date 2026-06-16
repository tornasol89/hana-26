import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/features/auth/hooks";
import { useRegistroDraft } from "@/features/auth/hooks/useRegistroDraft";
import { validarRegistro } from "@/features/auth/utils/validacionRegistro";
import { capitalizarNombre } from "@/lib/validators";
import type { UserType } from "@/features/auth/types";

import { TipoCuentaSelector } from "./TipoCuentaSelector";
import { NombreApellidoFields } from "./NombreApellidoFields";
import { RutInput } from "./RutInput";
import { FechaNacimientoInput } from "./FechaNacimientoInput";
import { UbicacionFields } from "./UbicacionFields";
import { PasswordFields } from "./PasswordFields";
import { CompromisoBox } from "./CompromisoBox";

/**
 * Formulario completo de registro. Maneja:
 * - State de los 11 campos
 * - Persistencia en sessionStorage (draft) vía useRegistroDraft
 * - Validación centralizada vía validarRegistro
 * - Submit a través de useRegister (mutation de TanStack Query)
 * - Navegación al compromiso y, tras registrar, a la pantalla de "verificá tu email"
 */
export function RegistroForm() {
  const { draftInicial, guardarDraft, limpiarDraft } = useRegistroDraft();

  const [tipo, setTipo] = useState<UserType>(draftInicial.tipo);
  const [nombre, setNombre] = useState(draftInicial.nombre);
  const [apellido, setApellido] = useState(draftInicial.apellido);
  const [email, setEmail] = useState(draftInicial.email);
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [rut, setRut] = useState(draftInicial.rut);
  const [fechaNacimiento, setFechaNacimiento] = useState(
    draftInicial.fechaNacimiento,
  );
  const [region, setRegion] = useState(draftInicial.region);
  const [comuna, setComuna] = useState(draftInicial.comuna);
  const [aceptoCompromiso, setAceptoCompromiso] = useState(false);

  const register = useRegister();
  const navigate = useNavigate();

  // Leer flag de compromiso al montar
  useEffect(() => {
    const aceptado = sessionStorage.getItem("aceptoCompromiso") === "true";
    setAceptoCompromiso(aceptado);
  }, []);

  function handleIrACompromiso() {
    guardarDraft({
      tipo,
      nombre,
      apellido,
      email,
      rut,
      fechaNacimiento,
      region,
      comuna,
    });
    navigate("/compromiso?destino=registro");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validarRegistro({
      nombre,
      apellido,
      email,
      password,
      confirmarPassword,
      rut,
      fechaNacimiento,
      region,
      comuna,
      aceptoCompromiso,
    });

    if (error) {
      toast.error(error);
      return;
    }

    register.mutate(
      {
        nombre: capitalizarNombre(nombre.trim()),
        apellido: capitalizarNombre(apellido.trim()),
        email: email.trim().toLowerCase(),
        password,
        tipo,
        rut: rut.trim(),
        fechaNacimiento,
        region,
        comuna: comuna.trim(),
        aceptoCompromiso: true,
      },
      {
        // El registro ya NO crea sesión: la usuaria debe verificar su email.
        // Redirigimos a la pantalla de "email enviado" pasando el email por state.
        onSuccess: ({ email: emailRegistrado }) => {
          limpiarDraft();
          navigate("/registro/email-enviado", {
            state: { email: emailRegistrado },
          });
        },
      },
    );
  }

  const isSubmitting = register.isPending;

  return (
    <>
      <TipoCuentaSelector
        value={tipo}
        onChange={setTipo}
        disabled={isSubmitting}
      />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <NombreApellidoFields
          nombre={nombre}
          apellido={apellido}
          onNombreChange={setNombre}
          onApellidoChange={setApellido}
          disabled={isSubmitting}
        />

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
            className="h-11"
          />
        </div>

        <RutInput
          value={rut}
          onChange={setRut}
          disabled={isSubmitting}
        />

        <FechaNacimientoInput
          value={fechaNacimiento}
          onChange={setFechaNacimiento}
          disabled={isSubmitting}
        />

        <UbicacionFields
          region={region}
          comuna={comuna}
          onRegionChange={setRegion}
          onComunaChange={setComuna}
          disabled={isSubmitting}
        />

        <PasswordFields
          password={password}
          confirmarPassword={confirmarPassword}
          onPasswordChange={setPassword}
          onConfirmarPasswordChange={setConfirmarPassword}
          disabled={isSubmitting}
        />

        <CompromisoBox
          aceptado={aceptoCompromiso}
          onIrACompromiso={handleIrACompromiso}
        />

        <Button
          variant="hero"
          className="w-full h-11 font-semibold gap-2"
          type="submit"
          disabled={isSubmitting || !aceptoCompromiso}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {`Unirme como ${tipo === "clienta" ? "Clienta" : "Trabajadora"}`}
            </>
          )}
        </Button>
      </form>
    </>
  );
}