import { Clock, IdCard, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarnetUploader } from "@/features/profile/components/CarnetUploader";
import { useUploadCarnet } from "@/features/auth/hooks";
import type { Usuario } from "@/features/auth/types";

interface Props {
  user: Usuario;
}

export function VerificacionTab({ user }: Props) {
  const uploadCarnet = useUploadCarnet();

  const verificada = user.estadoVerificacion === "aprobado";
  const enRevision = user.estadoVerificacion === "enviado";

  function subir(lado: "frente" | "dorso") {
    return (file: File) => uploadCarnet.mutate({ file, lado });
  }

  const ladoSubiendo = uploadCarnet.isPending ? uploadCarnet.variables?.lado : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Estado de verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {verificada ? (
              <ShieldCheck className="h-10 w-10 text-green-600 shrink-0" />
            ) : enRevision ? (
              <Clock className="h-10 w-10 text-amber-600 shrink-0" />
            ) : (
              <IdCard className="h-10 w-10 text-primary shrink-0" />
            )}
            <div>
              <p className="font-semibold text-card-foreground">
                {verificada
                  ? "Identidad verificada"
                  : enRevision
                  ? "En revisión"
                  : "Sin verificar"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {verificada
                  ? "Tu identidad fue confirmada por el equipo Hana. Puedes usar la plataforma con plenos permisos."
                  : enRevision
                  ? "Tus documentos están siendo revisados. Te notificaremos en 24–48 hrs hábiles."
                  : "Sube ambas caras de tu cédula de identidad (RUT) para que el equipo Hana confirme tu identidad."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!verificada && (
        <>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Sube tu cédula de identidad</CardTitle>
              <p className="text-xs text-muted-foreground">
                Necesitamos ambas caras. Solo el equipo Hana accede a estas imágenes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CarnetUploader
                titulo="Frente"
                descripcion="Lado con tu foto y nombre"
                urlActual={user.carnetFrenteUrl}
                uploading={ladoSubiendo === "frente"}
                onFileSelected={subir("frente")}
                disabled={ladoSubiendo === "dorso"}
              />

              <CarnetUploader
                titulo="Dorso"
                descripcion="Lado con el código de barras"
                urlActual={user.carnetDorsoUrl}
                uploading={ladoSubiendo === "dorso"}
                onFileSelected={subir("dorso")}
                disabled={ladoSubiendo === "frente"}
              />

              {user.carnetFrenteUrl && user.carnetDorsoUrl && enRevision && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                  ✓ Ambos documentos enviados. Revisión en 24–48 hrs hábiles.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Consejos para una buena foto</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Fotografía el lado completo, sin cortar bordes",
                  "Asegúrate de que el texto sea legible y sin reflejos",
                  "Usa fondo claro y buena iluminación",
                  "No cubras ningún dato con los dedos",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-semibold shrink-0 w-6">
                      0{i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}