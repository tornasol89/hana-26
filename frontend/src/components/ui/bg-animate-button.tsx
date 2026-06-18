import { cn } from "@/lib/utils"
import React from "react"

type GradientVariant = "nebula" | "gold" | "violet"

const GRADIENTS: Record<GradientVariant, string> = {
  nebula: "conic-gradient(from 90deg at 50% 50%, #C4B5FD 0%, #7C3AED 50%, #A77BFE 100%)",
  gold: "conic-gradient(from 90deg at 50% 50%, #F0D090 0%, #D4A853 50%, #B8860B 100%)",
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
        "relative inline-flex overflow-hidden rounded-[calc(0.375rem+2px)] p-[2px]",
        className
      )}
    >
      <span
        className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
        style={{ background: GRADIENTS[gradient] }}
      />
      <div className="relative z-10 flex w-full">{children}</div>
    </div>
  )
}
