import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/features/auth/hooks";
import { useRegistroDraft } from "@/features/auth/hooks/useRegistroDraft";
import { capitalizarNombre, validarRut, validarFechaNacimiento } from "@/lib/validators";
import type { UserType } from "@/features/auth/types";

import { TipoCuentaSelector } from "./TipoCuentaSelector";
import { NombreApellidoFields } from "./NombreApellidoFields";
import { RutInput } from "./RutInput";
import { FechaNacimientoInput } from "./FechaNacimientoInput";
import { UbicacionFields } from "./UbicacionFields";
import { PasswordFields } from "./PasswordFields";
import { CompromisoBox } from "./CompromisoBox";

const registroSchema = z
  .object({
    nombre: z.string().min(1, "Ingresa tu nombre"),
    apellido: z.string().min(1, "Ingresa tu apellido"),
    email: z
      .string()
      .min(1, "Ingresa tu correo electrónico")
      .email("Correo electrónico inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmarPassword: z.string().min(1, "Confirma tu contraseña"),
    rut: z
      .string()
      .min(1, "Ingresa tu RUT")
      .refine(validarRut, "RUT inválido. Verifica el número y el dígito verificador."),
    fechaNacimiento: z
      .string()
      .min(1, "Ingresa tu fecha de nacimiento")
      .refine(
        (v) => validarFechaNacimiento(v).valida,
        (v) => ({ message: validarFechaNacimiento(v).mensaje ?? "Fecha inválida" }),
      ),
    region: z.string().min(1, "Selecciona tu región"),
    comuna: z.string().min(1, "Selecciona tu comuna"),
  })
  .refine((d) => d.password === d.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

type RegistroFormData = z.infer<typeof registroSchema>;

export function RegistroForm() {
  const { draftInicial, guardarDraft, limpiarDraft } = useRegistroDraft();

  const [tipo, setTipo] = useState<UserType>(draftInicial.tipo);
  const [aceptoCompromiso, setAceptoCompromiso] = useState(false);

  const register = useRegister();
  const navigate = useNavigate();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    mode: "onBlur",
    defaultValues: {
      nombre: draftInicial.nombre,
      apellido: draftInicial.apellido,
      email: draftInicial.email,
      password: "",
      confirmarPassword: "",
      rut: draftInicial.rut,
      fechaNacimiento: draftInicial.fechaNacimiento,
      region: draftInicial.region,
      comuna: draftInicial.comuna,
    },
  });

  const [nombre, apellido, email, password, confirmarPassword, rut, fechaNacimiento, region, comuna] =
    watch(["nombre", "apellido", "email", "password", "confirmarPassword", "rut", "fechaNacimiento", "region", "comuna"]);

  useEffect(() => {
    const aceptado = sessionStorage.getItem("aceptoCompromiso") === "true";
    setAceptoCompromiso(aceptado);
  }, []);

  function handleIrACompromiso() {
    guardarDraft({ tipo, nombre, apellido, email, rut, fechaNacimiento, region, comuna });
    navigate("/compromiso?destino=registro");
  }

  function onSubmit(data: RegistroFormData) {
    register.mutate(
      {
        nombre: capitalizarNombre(data.nombre.trim()),
        apellido: capitalizarNombre(data.apellido.trim()),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        tipo,
        rut: data.rut.trim(),
        fechaNacimiento: data.fechaNacimiento,
        region: data.region,
        comuna: data.comuna.trim(),
        aceptoCompromiso: true,
      },
      {
        onSuccess: ({ usuario }) => {
          limpiarDraft();
          toast.success(`¡Bienvenida a Hana, ${usuario.nombre}!`);
          if (usuario.tipo === "admin") navigate("/perfil/admin", { replace: true });
          else navigate("/mi-perfil", { replace: true });
        },
      },
    );
  }

  const isSubmitting = register.isPending;

  return (
    <>
      <TipoCuentaSelector value={tipo} onChange={setTipo} disabled={isSubmitting} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <NombreApellidoFields
          nombre={nombre}
          apellido={apellido}
          onNombreChange={(v) => setValue("nombre", v, { shouldValidate: true })}
          onApellidoChange={(v) => setValue("apellido", v, { shouldValidate: true })}
          disabled={isSubmitting}
          errorNombre={errors.nombre?.message}
          errorApellido={errors.apellido?.message}
        />

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
            disabled={isSubmitting}
            className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <RutInput
          value={rut}
          onChange={(v) => setValue("rut", v, { shouldValidate: true })}
          disabled={isSubmitting}
        />

        <FechaNacimientoInput
          value={fechaNacimiento}
          onChange={(v) => setValue("fechaNacimiento", v, { shouldValidate: true })}
          disabled={isSubmitting}
          error={errors.fechaNacimiento?.message}
        />

        <UbicacionFields
          region={region}
          comuna={comuna}
          onRegionChange={(v) => {
            setValue("region", v, { shouldValidate: true });
            setValue("comuna", "", { shouldValidate: false });
          }}
          onComunaChange={(v) => setValue("comuna", v, { shouldValidate: true })}
          disabled={isSubmitting}
          errorRegion={errors.region?.message}
          errorComuna={errors.comuna?.message}
        />

        <PasswordFields
          password={password}
          confirmarPassword={confirmarPassword}
          onPasswordChange={(v) => setValue("password", v, { shouldValidate: true })}
          onConfirmarPasswordChange={(v) => setValue("confirmarPassword", v, { shouldValidate: true })}
          disabled={isSubmitting}
          errorPassword={errors.password?.message}
          errorConfirmar={errors.confirmarPassword?.message}
        />

        <CompromisoBox aceptado={aceptoCompromiso} onIrACompromiso={handleIrACompromiso} />

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
