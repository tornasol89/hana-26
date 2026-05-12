import React from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import {
  LimpiezaIcon,
  CocinaIcon,
  JardinIcon,
  NineraIcon,
  CuidadoAdultosIcon,
  MascotasIcon,
  LavaderiaIcon,
  ReparacionesIcon,
  PinturaIcon,
  PlomeriaIcon,
  ElectricidadIcon,
  MecanicaIcon,
} from "@/components/ui/hana-service-icons"

interface Palette {
  card: string
  iconBg: string
  border: string
  hoverBorder: string
}

interface Service {
  name: string
  slug: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  palette: Palette
}

// Paleta de 4 tonos Hana que cicla ordenadamente: púrpura → dorado → rosa → violeta
const PALETTES: Palette[] = [
  { card: "#f5f3ff", iconBg: "#ede9fe", border: "#c4b5fd", hoverBorder: "#7c3aed" }, // púrpura
  { card: "#fffbeb", iconBg: "#fef3c7", border: "#fde68a", hoverBorder: "#b45309" }, // dorado
  { card: "#fff1f2", iconBg: "#ffe4e6", border: "#fda4af", hoverBorder: "#be123c" }, // rosa
  { card: "#faf5ff", iconBg: "#f3e8ff", border: "#d8b4fe", hoverBorder: "#9333ea" }, // violeta
]

const allServices: Service[] = [
  {
    name: "Limpieza del Hogar",
    slug: "Limpieza",
    icon: LimpiezaIcon,
    description: "Aseo profundo y mantención del hogar",
    palette: PALETTES[0],
  },
  {
    name: "Cocina",
    slug: "Cocina",
    icon: CocinaIcon,
    description: "Preparación de comidas y nutrición",
    palette: PALETTES[1],
  },
  {
    name: "Jardinería",
    slug: "Jardinería",
    icon: JardinIcon,
    description: "Poda, mantención y diseño de jardines",
    palette: PALETTES[2],
  },
  {
    name: "Cuidado Infantil",
    slug: "Cuidado Infantil",
    icon: NineraIcon,
    description: "Niñeras, apoyo escolar y actividades",
    palette: PALETTES[3],
  },
  {
    name: "Cuidado de Adultos",
    slug: "Cuidado de Adultos",
    icon: CuidadoAdultosIcon,
    description: "Acompañamiento y asistencia a adultos mayores",
    palette: PALETTES[0],
  },
  {
    name: "Cuidado de Mascotas",
    slug: "Mascotas",
    icon: MascotasIcon,
    description: "Paseos, alimentación y cuidado animal",
    palette: PALETTES[1],
  },
  {
    name: "Lavandería",
    slug: "Lavado y Planchado",
    icon: LavaderiaIcon,
    description: "Lavado, planchado y cuidado de ropa",
    palette: PALETTES[2],
  },
  {
    name: "Reparaciones",
    slug: "Reparaciones",
    icon: ReparacionesIcon,
    description: "Arreglos generales del hogar",
    palette: PALETTES[3],
  },
  {
    name: "Pintura",
    slug: "Pintura",
    icon: PinturaIcon,
    description: "Pintura interior, exterior y decorativa",
    palette: PALETTES[0],
  },
  {
    name: "Plomería",
    slug: "Plomería",
    icon: PlomeriaIcon,
    description: "Tuberías, filtraciones y gasfitería",
    palette: PALETTES[1],
  },
  {
    name: "Electricidad",
    slug: "Electricidad",
    icon: ElectricidadIcon,
    description: "Instalaciones y reparaciones eléctricas",
    palette: PALETTES[2],
  },
  {
    name: "Mecánica",
    slug: "Mecánica",
    icon: MecanicaIcon,
    description: "Mantención básica de vehículos",
    palette: PALETTES[3],
  },
]

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Servicios{" "}
            <span className="italic text-gradient-primary">disponibles</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            12 categorías de servicios profesionales — haz clic para explorar
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allServices.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Link
                to={`/buscar?categoria=${encodeURIComponent(service.slug)}`}
                className="group rounded-xl border p-5 flex flex-col items-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md h-full"
                style={{
                  backgroundColor: service.palette.card,
                  borderColor: service.palette.border,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = service.palette.hoverBorder;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = service.palette.border;
                }}
              >
                <div
                  className="w-12 h-12 mb-3 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: service.palette.iconBg }}
                >
                  <service.icon
                    className="w-7 h-7"
                    style={{
                      animationDuration: `${1.6 + (index % 6) * 0.35}s`,
                      animationDelay: `${(index * 0.18) % 1.4}s`,
                    }}
                  />
                </div>
                <h3 className="font-semibold text-card-foreground text-sm leading-snug mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
