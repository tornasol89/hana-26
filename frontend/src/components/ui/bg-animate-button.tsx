import { cn } from "@/lib/utils"
import React from "react"

type GradientVariant = "nebula" | "gold" | "violet"

const GRADIENTS: Record<GradientVariant, string> = {
  nebula: "conic-gradient(from 90deg at 50% 50%, #C4B5FD 0%, #7C3AED 50%, #A77BFE 100%)",
  gold:   "conic-gradient(from 90deg at 50% 50%, #F0D090 0%, #D4A853 50%, #B8860B 100%)",
  violet: "conic-gradient(from 90deg at 50% 50%, #DDD6FE 0%, #8B5CF6 50%, #4C1D95 100%)",
}

interface AnimatedButtonWrapperProps {
  children: React.ReactNode
  gradient?: GradientVariant
  className?: string
}

export function AnimatedButtonWrapper({
  children,
  gradient = "nebula",
  className,
}: AnimatedButtonWrapperProps) {
  return (
    <div
      className={cn(
        "relative inline-flex p-[2px] rounded-[calc(0.375rem+2px)]",
        className
      )}
      /*
       * clip-path:inset() en lugar de overflow:hidden porque en iOS Safari
       * overflow:hidden no clipea correctamente elementos con animate-spin
       * y valores de inset muy grandes, causando scroll horizontal en móvil.
       */
      style={{ clipPath: "inset(0 round calc(0.375rem + 2px))" }}
    >
      {/*
       * Usamos inset-0 + scale-[6] en vez de inset-[-1000%].
       * scale() es una transformación CSS que no afecta el layout —
       * el elemento sigue ocupando inset-0 en el DOM, pero visualmente
       * se escala 6× para cubrir todas las esquinas durante la rotación.
       * Esto elimina el overflow de layout que causaba el scroll horizontal.
       */}
      <span
        className="absolute inset-0 animate-[spin_3s_linear_infinite] scale-[6]"
        style={{ background: GRADIENTS[gradient] }}
      />
      <div className="relative z-10 flex w-full">
        {children}
      </div>
    </div>
  )
}
