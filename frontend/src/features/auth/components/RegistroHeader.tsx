import hanaLogo from "@/assets/hana-logo.png";

/**
 * Cabecera del card de registro: gradiente, logo, título con shimmer.
 * Componente puramente visual, sin props.
 */
export function RegistroHeader() {
  return (
    <div className="bg-gradient-hero px-8 pt-10 pb-9 text-center relative overflow-hidden">
      <div className="absolute top-[-30%] right-[-15%] w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-36 h-36 rounded-full bg-gold/15 blur-2xl pointer-events-none" />

      <img
        src={hanaLogo}
        alt="Hana"
        className="h-14 mx-auto mb-5 brightness-0 invert opacity-90 relative z-10"
      />
      <h1 className="font-display text-3xl font-bold text-white leading-tight animate-fade-up relative z-10">
        Únete a <em className="not-italic text-shimmer">Hana</em>
      </h1>
      <p className="text-white/60 text-sm mt-2 relative z-10">
        Forma parte de nuestra comunidad
      </p>
    </div>
  );
}