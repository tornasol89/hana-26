import React, { useEffect, useMemo, useState, type CSSProperties } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textBaseVariants = cva("", {
  variants: {
    size: {
      default: "text-2xl sm:text-3xl lg:text-4xl",
      xxs: "text-base sm:text-lg lg:text-lg",
      xs: "text-lg sm:text-xl lg:text-2xl",
      sm: "text-xl sm:text-2xl lg:text-3xl",
      md: "text-2xl sm:text-3xl lg:text-4xl",
      lg: "text-3xl sm:text-4xl lg:text-5xl",
      xl: "text-4xl sm:text-5xl lg:text-6xl",
      xxl: "text-[2.5rem] sm:text-6xl lg:text-[6rem]",
      xll: "text-5xl sm:text-6xl lg:text-[7rem]",
      xxxl: "text-[6rem] leading-5 lg:leading-8 sm:text-6xl lg:text-[8rem]",
    },
    weight: {
      default: "font-bold",
      thin: "font-thin",
      semi: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    font: {
      default: "font-display",
      serif: "font-serif",
      mono: "font-mono",
    },
  },
  defaultVariants: {
    size: "default",
    weight: "bold",
    font: "default",
  },
})

interface TextGifProps extends VariantProps<typeof textBaseVariants> {
  gifUrl: string
  text: string
  className?: string
  fallbackColor?: string
  transitionDuration?: number
}

const TextGif = React.memo(function TextGifComponent({
  gifUrl,
  text,
  size,
  weight,
  font,
  className,
  fallbackColor = "white",
  transitionDuration = 400,
}: TextGifProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [gifUrl])

  const textClassName = useMemo(
    () =>
      cn(
        textBaseVariants({ size, weight, font }),
        loaded && !error ? "text-transparent bg-clip-text" : "",
        className
      ),
    [size, weight, font, className, loaded, error]
  )

  const textStyle = useMemo(() => {
    const style: CSSProperties = {
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      WebkitBackgroundClip: "text",
      // lineHeight forzado en style para ganar sobre cualquier clase leading-*
      lineHeight: 1.3,
      color: fallbackColor,
      WebkitTextFillColor: fallbackColor,
      transition: `opacity ${transitionDuration}ms ease-in-out`,
    }
    if (loaded && !error) {
      style.backgroundImage = `url(${gifUrl})`
      style.color = "transparent"
      style.WebkitTextFillColor = "transparent"
    }
    return style
  }, [loaded, error, gifUrl, transitionDuration, fallbackColor])

  return (
    // block + overflow-hidden contiene los ascendentes de Playfair Display italic
    <span className="relative block w-full overflow-hidden">
      {gifUrl && (
        <img
          src={gifUrl}
          alt=""
          className="absolute opacity-0 pointer-events-none w-px h-px"
          onLoad={() => { setLoaded(true); setError(false) }}
          onError={() => { setError(true); setLoaded(false) }}
        />
      )}
      <span className={textClassName} style={textStyle}>
        {text}
      </span>
    </span>
  )
})

// GIFs seleccionados para la paleta Hana (púrpura · dorado · aurora · floral)
export const HANA_GIFS = {
  galaxy:  "https://media.giphy.com/media/3zvbrvbRe7wxBofOBI/giphy.gif",
  shimmer: "https://media.giphy.com/media/fnglNFjBGiyAFtm6ke/giphy.gif",
  aurora:  "https://media.giphy.com/media/9Pmfazv34l7aNIKK05/giphy.gif",
  flowers: "https://media.giphy.com/media/4bhs1boql4XVJgmm4H/giphy.gif",
}

export { TextGif }
export default TextGif
