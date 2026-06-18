import { useState } from "react";
import { Award, ExternalLink, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CertificadoUploader } from "./CertificadoUploader";
import {
  useAgregarCertificado,
  useEliminarCertificado,
  useMyWorkerProfile,
} from "../hooks";

const INSTITUCION_CHILEVALORA = "Chilevalora";

function esChilevalora(institucion: string) {
  return institucion.trim().toLowerCase().includes("chilevalora");
}

export function CertificadosSection() {
  const { data: perfil } = useMyWorkerProfile();
  const agregar = useAgregarCertificado();
  const eliminar = useEliminarCertificado();

  const [nombre, setNombre] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);

  const certificados = perfil?.certificados ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !institucion.trim()) return;

    const fd = new FormData();
    fd.append("nombre", nombre.trim());
    fd.append("institucion", institucion.trim());
    if (archivo) fd.append("imagen", archivo);

    agregar.mutate(fd, {
      onSuccess: () => {
        setNombre("");
        setInstitucion("");
        setArchivo(null);
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-primary" />
          Certificados y habilitaciones
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Los certificados de{" "}
          <span className="font-semibold text-primary">Chilevalora</span> aumentan
          tu Índice Hana en +10 puntos y aparecen destacados en tu perfil.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lista de certificados existentes */}
        {certificados.length > 0 ? (
          <ul className="space-y-3">
            {certificados.map((cert) => (
              <li
                key={cert._id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Award className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cert.nombre}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {cert.institucion}
                      </p>
                      {esChilevalora(cert.institucion) && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 shrink-0">
                          Chilevalora
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cert.urlImagen && (
                    <a
                      href={cert.urlImagen}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Ver certificado"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => eliminar.mutate(cert._id)}
                    disabled={eliminar.isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Eliminar certificado"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aún no tienes certificados cargados.
          </p>
        )}

        {/* Formulario para agregar */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border">
          <p className="text-sm font-medium">Agregar certificado</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cert-nombre">
                Nombre del certificado <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cert-nombre"
                placeholder="Ej: Técnico en Gastronomía"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={agregar.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cert-institucion">
                Institución <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cert-institucion"
                placeholder={`Ej: ${INSTITUCION_CHILEVALORA}, OTEC, SENCE...`}
                value={institucion}
                onChange={(e) => setInstitucion(e.target.value)}
                disabled={agregar.isPending}
              />
              {esChilevalora(institucion) && (
                <p className="text-xs text-primary font-medium">
                  Certificado Chilevalora detectado — subirá tu Índice Hana
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Imagen o PDF del certificado{" "}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <CertificadoUploader
              archivo={archivo}
              uploading={agregar.isPending}
              onFileSelected={setArchivo}
              disabled={agregar.isPending}
            />
          </div>

          <Button
            type="submit"
            variant="hero"
            disabled={agregar.isPending || !nombre.trim() || !institucion.trim()}
          >
            {agregar.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Agregar certificado
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
