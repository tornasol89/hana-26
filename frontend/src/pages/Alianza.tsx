import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, CheckCircle2, ExternalLink, HandshakeIcon, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BENEFICIOS_CHILEVALORA = [
  "Certificación reconocida por el Estado chileno en más de 50 competencias laborales",
  "Aumenta tu Índice Hana en +10 puntos y aparece destacada en búsquedas",
  "Demuestra a las clientas que tu especialidad está avalada oficialmente",
  "Acceso a más oportunidades laborales formales y mejor remuneradas",
];

const BENEFICIOS_SERCOTEC = [
  "Capital Semilla y Capital Abeja para emprendedoras que necesitan financiamiento",
  "Talleres gratuitos de gestión, marketing y herramientas digitales",
  "Asesoría personalizada para formalizar tu negocio de servicios",
  "Red de emprendedoras conectadas a través de los Centros de Negocios regionales",
];

const PASOS_CHILEVALORA = [
  {
    num: "01",
    titulo: "Inscríbete en el proceso",
    desc: "Contacta a un organismo evaluador acreditado por Chilevalora en tu región.",
  },
  {
    num: "02",
    titulo: "Evaluación de competencias",
    desc: "Un evaluador certifica tus habilidades a través de una evaluación práctica y teórica.",
  },
  {
    num: "03",
    titulo: "Obtén tu certificado",
    desc: "Recibes un certificado oficial que acredita tu especialidad a nivel nacional.",
  },
  {
    num: "04",
    titulo: "Súbelo a tu perfil Hana",
    desc: "En «Mis servicios → Certificados», carga tu documento y tu Índice Hana sube automáticamente.",
  },
];

export default function Alianza() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navbar />

      <div className="pt-20">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 max-w-4xl text-center space-y-6">
          <Badge className="mx-auto gap-1.5 bg-primary/15 text-primary border border-primary/30">
            <HandshakeIcon className="h-3.5 w-3.5" />
            Alianzas estratégicas
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground">
            Hana + Chilevalora + Sercotec
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Trabajamos junto a dos organismos del Estado para que las mujeres que ofrecen
            servicios a través de Hana tengan acceso a certificación oficial, financiamiento
            y capacitación gratuita.
          </p>
        </section>

        {/* Chilevalora */}
        <section className="bg-card border-y border-border py-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-amber-100 border border-amber-200 mx-auto">
                <Award className="h-7 w-7 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold font-display">Chilevalora</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                La Comisión del Sistema Nacional de Certificación de Competencias Laborales
                certifica habilidades y conocimientos adquiridos por la experiencia, sin
                importar si completaste estudios formales.
              </p>
            </div>

            {/* Beneficios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Beneficios para trabajadoras Hana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {BENEFICIOS_CHILEVALORA.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-card-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pasos */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-center">
                Cómo obtener tu certificado Chilevalora
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PASOS_CHILEVALORA.map((paso) => (
                  <Card key={paso.num} className="border-l-4 border-l-amber-500">
                    <CardContent className="p-5">
                      <p className="text-3xl font-bold font-display text-amber-500/50 mb-1">
                        {paso.num}
                      </p>
                      <p className="font-semibold text-sm text-card-foreground mb-1">
                        {paso.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {paso.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="hero">
                <Link to="/mi-perfil">Subir mi certificado Chilevalora</Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://www.chilevalora.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visitar sitio de Chilevalora
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Sercotec */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/20 mx-auto">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display">Sercotec</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                El Servicio de Cooperación Técnica apoya a micro y pequeñas empresas
                y emprendedoras de todo Chile con financiamiento, capacitación y asesoría,
                especialmente para mujeres que lideran sus propios negocios.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Programas disponibles para trabajadoras Hana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {BENEFICIOS_SERCOTEC.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-card-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <p className="font-semibold text-card-foreground">
                  ¿Querés postular a un programa Sercotec?
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Visita el sitio oficial o busca el Centro de Negocios Sercotec
                  más cercano a tu región para recibir asesoría presencial gratuita.
                </p>
                <Button asChild variant="outline">
                  <a
                    href="https://www.sercotec.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visitar sitio de Sercotec
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-primary/5 border-t border-primary/20 py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center space-y-6">
            <HandshakeIcon className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-2xl font-bold font-display">
              Juntas construimos una economía más justa
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Estas alianzas no son solo papeles: son el camino para que tu trabajo
              sea reconocido, valorado y mejor pagado. Hana conecta tu talento con
              quien lo necesita; Chilevalora y Sercotec lo respaldan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/registro">Únete a Hana</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/impacto">Ver nuestro impacto</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
