import LogoCarousel from "@/components/ui/logo-carousel"

const ServicesCarouselSection = () => {
  return (
    <section className="py-14 bg-muted/30 border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Para cada rincón de tu hogar
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
            Servicios disponibles
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Mujeres profesionales verificadas, listas para ayudarte en lo que necesites
          </p>
        </div>

        {/* Desktop: 4 columnas · Mobile: 2 columnas con scroll */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="hidden md:block">
            <LogoCarousel columnCount={4} />
          </div>
          <div className="md:hidden">
            <LogoCarousel columnCount={2} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesCarouselSection
