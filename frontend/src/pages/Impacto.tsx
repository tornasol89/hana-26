import { Link } from "react-router-dom";
import { Heart, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ESTADISTICAS_PRINCIPALES,
  ESTADISTICAS_FINALES,
  HOGARES_UNIPERSONALES,
  JEFATURA_FEMENINA,
  SEGURIDAD_MUJERES,
  type EstadisticaImpacto,
} from "@/config/content";

const TONO_CLASSES: Record<EstadisticaImpacto["tono"], string> = {
  primary: "text-primary border-t-primary",
  accent: "text-amber-600 border-t-amber-500",
  success: "text-green-600 border-t-green-500",
  warning: "text-orange-600 border-t-orange-500",
};

function StatCard({ estadistica }: { estadistica: EstadisticaImpacto }) {
  return (
    <Card className={`border-t-4 ${TONO_CLASSES[estadistica.tono]}`}>
      <CardContent className="p-5 text-center">
        <div className={`text-3xl md:text-4xl font-bold font-display ${TONO_CLASSES[estadistica.tono]} mb-2`}>
          {estadistica.num}
        </div>
        <p className="text-sm text-card-foreground leading-snug mb-2">
          {estadistica.label}
        </p>
        <p className="text-xs text-muted-foreground italic">
          {estadistica.fuente}
        </p>
      </CardContent>
    </Card>
  );
}

function BarraHistorica({
  año,
  valor,
  max,
}: {
  año: string;
  valor: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-10 text-right shrink-0">
        {año}
      </span>
      <Progress value={(valor / max) * 100} className="flex-1 h-2.5" />
      <span className="text-sm font-semibold text-card-foreground w-12 text-right shrink-0">
        {valor}%
      </span>
    </div>
  );
}

function SectionDivider({ titulo }: { titulo: string }) {
  return (
    <div className="my-12 text-center">
      <div className="inline-block">
        <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] px-4">
          {titulo}
        </p>
      </div>
      <div className="h-px bg-border mt-3" />
    </div>
  );
}

export default function Impacto() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-5xl">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            Datos que lo demuestran
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-card-foreground mb-3">
            Por qué Hana existe
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cifras reales de Chile · INE · CASEN · Fundación Sol · Corporación Humanas
            · ChileMujeres 2024–2025
          </p>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ESTADISTICAS_PRINCIPALES.map((e) => (
            <StatCard key={e.num} estadistica={e} />
          ))}
        </div>

        {/* ─── Sección 1: Chile cambia ─── */}
        <SectionDivider titulo="Chile está cambiando — y las mujeres lideran ese cambio" />

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Hogares con jefatura femenina en Chile
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Evolución 1990–2024 · Fuente: CASEN / INE / Fundación Sol
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {JEFATURA_FEMENINA.map((r) => (
                  <BarraHistorica key={r.año} año={r.año} valor={r.valor} max={100} />
                ))}
              </div>
              <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                De 642 mil a 2 millones de hogares — se triplicaron en 30 años
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Hogares unipersonales en Chile
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Mujeres viviendo solas · Fuente: Censo INE
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {HOGARES_UNIPERSONALES.map((r) => (
                  <BarraHistorica key={r.año} año={r.año} valor={r.valor} max={25} />
                ))}
              </div>
              <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                Más de 1 de cada 5 hogares chilenos tiene una sola persona
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ─── Sección 2: Desigualdad laboral ─── */}
        <SectionDivider titulo="La desigualdad laboral que Hana combate" />

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {/* Participación laboral */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participación laboral</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tasa de participación · INE oct–dic 2024
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold font-display text-green-600">71,4%</p>
                  <p className="text-xs text-muted-foreground">Hombres</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-display text-primary">52,1%</p>
                  <p className="text-xs text-muted-foreground">Mujeres</p>
                </div>
              </div>
              <div className="text-center mb-3">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  Brecha de 19,3 puntos
                </span>
              </div>
              <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                Casi 1 de cada 5 mujeres fuera del mercado laboral
              </p>
            </CardContent>
          </Card>

          {/* Quién cuida */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                ¿Quién deja de trabajar por cuidar?
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cuidado de hijos · CASEN 2020
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-primary">98,3%</p>
                  <p className="text-xs text-muted-foreground">Mujeres</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-muted-foreground/60">
                    1,7%
                  </p>
                  <p className="text-xs text-muted-foreground">Hombres</p>
                </div>
              </div>
              <Progress value={98.3} className="h-2 mb-3" />
              <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                Casi la totalidad del sacrificio laboral recae en ellas
              </p>
            </CardContent>
          </Card>

          {/* Brecha salarial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brecha salarial</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ingreso promedio · ChileMujeres 2024
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Hombres</span>
                  <span className="text-xl font-bold font-display text-green-600">
                    $500K
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    −23,3% brecha
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-sm text-card-foreground">Mujeres</span>
                  <span className="text-xl font-bold font-display text-primary">
                    $450K
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary border-t border-border pt-3">
                En empleos informales la brecha sube a 29,2%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ─── Sección 3: Seguridad ─── */}
        <SectionDivider titulo="Seguridad y autonomía — la razón más profunda de Hana" />

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="space-y-4">
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-5">
                <blockquote className="text-base italic text-card-foreground leading-relaxed mb-3">
                  "Un 92% de las mujeres valora el trabajo remunerado como fuente de
                  autonomía económica y desarrollo personal."
                </blockquote>
                <p className="text-xs text-muted-foreground">
                  Corporación Humanas, Encuesta 2025 · 1.301 mujeres encuestadas en
                  Chile
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-5">
                <blockquote className="text-base italic text-card-foreground leading-relaxed mb-3">
                  "Un 77% de las mujeres chilenas declara haberse sentido insegura en
                  espacios públicos. Un 69% en el transporte. Un 67% en plazas y
                  parques."
                </blockquote>
                <p className="text-xs text-muted-foreground">
                  Corporación Humanas, Encuesta 2025
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                ¿Dónde se sienten inseguras las mujeres?
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Chile · Corporación Humanas 2025
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SEGURIDAD_MUJERES.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-card-foreground">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {item.valor}%
                      </span>
                    </div>
                    <Progress value={item.valor} className="h-2" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-primary border-t border-border pt-4 mt-5">
                Elegir a quién abres tu puerta no es un detalle — es una decisión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats finales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ESTADISTICAS_FINALES.map((e) => (
            <StatCard key={e.num} estadistica={e} />
          ))}
        </div>

        {/* CTA final */}
        <Card className="bg-gradient-to-br from-primary/10 to-amber-500/5 border-primary/20">
          <CardContent className="p-8 md:p-12 text-center space-y-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Heart className="h-6 w-6 text-primary" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-display text-card-foreground leading-tight">
              Hana no es solo una app.
              <br />
              Es una decisión.
            </h2>

            <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Chile tiene 2 millones de hogares liderados por mujeres. Mujeres que
                trabajan, que viven solas, que crían solas y que merecen elegir a quién
                abren su puerta.
              </p>
              <p>
                Por eso en Hana cada trabajadora es verificada, maneja su propia
                agenda, fija sus tarifas y construye su reputación con datos reales.
                Porque su seguridad y su autonomía también importan.
              </p>
              <p>
                Y cada clienta contrata con la certeza de saber exactamente a quién
                recibirá en su hogar — una profesional verificada, de confianza.
              </p>
              <p className="font-semibold text-primary">
                Usar Hana no es solo resolver una necesidad. Es apoyar el trabajo
                femenino, fortalecer la economía de otras mujeres y construir una
                comunidad donde todas estamos más seguras.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/registro">
                  <Users className="h-4 w-4" />
                  Quiero contratar servicios
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/registro">Quiero ofrecer mis servicios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}