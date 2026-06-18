interface EdgeBlurProps {
  position?: "top" | "bottom"
  height?: number
}

export function EdgeBlur({ position = "bottom", height = 72 }: EdgeBlurProps) {
  const blurLayers = [1, 2, 3, 6, 12]
  const isTop = position === "top"
  const dir = isTop ? "bottom" : "top"

  return (
    <div
      className="absolute inset-x-0 isolate z-10 pointer-events-none"
      style={{ height, [isTop ? "top" : "bottom"]: 0 }}
    >
      {/* Capas de backdrop-filter progresivo */}
      {blurLayers.map((blur) => (
        <div
          key={blur}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: `linear-gradient(to ${dir}, black 0%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to ${dir}, black 0%, transparent 100%)`,
          }}
        />
      ))}
      {/* Gradient de color visible siempre (fallback + refuerzo visual) */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to ${dir}, hsl(var(--card)) 0%, transparent 100%)`,
          opacity: 0.85,
        }}
      />
    </div>
  )
}

export function TopBlur({ height = 72 }: { height?: number }) {
  return <EdgeBlur position="top" height={height} />
}

export function BottomBlur({ height = 72 }: { height?: number }) {
  return <EdgeBlur position="bottom" height={height} />
}
