import { Link } from "react-router-dom";
import { Sparkles, Home, Heart, Baby, UtensilsCrossed, Shirt } from "lucide-react";

const categories = [
  { name: "Limpieza", icon: Sparkles, description: "Aseo profundo, mantención del hogar" },
  { name: "Cuidado de Adultos", icon: Heart, description: "Acompañamiento y asistencia" },
  { name: "Cuidado Infantil", icon: Baby, description: "Niñeras y apoyo escolar" },
  { name: "Cocina", icon: UtensilsCrossed, description: "Preparación de comidas" },
  { name: "Lavado y Planchado", icon: Shirt, description: "Cuidado de ropa y textiles" },
  { name: "Asistencia del Hogar", icon: Home, description: "Organización y tareas varias" },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Servicios disponibles
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Encuentra la profesional que necesitas en la categoría que buscas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/buscar?categoria=${encodeURIComponent(cat.name)}`}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-soft hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center mb-4 group-hover:bg-primary group-hover:shadow-soft transition-all duration-300">
                <cat.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">{cat.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
