import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  LimpiezaIcon,
  CocinaIcon,
  JardinIcon,
  NineraIcon,
  MascotasIcon,
  LavaderiaIcon,
  ReparacionesIcon,
  PinturaIcon,
  PlomeriaIcon,
  ElectricidadIcon,
  MecanicaIcon,
  CuidadoAdultosIcon,
} from "@/components/ui/hana-service-icons"

interface Logo {
  name: string
  id: number
  img: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos)
  const columns: Logo[][] = Array.from({ length: columnCount }, () => [])
  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })
  const maxLength = Math.max(...columns.map((col) => col.length))
  columns.forEach((col) => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })
  return columns
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number
}

const LogoColumn: React.FC<LogoColumnProps> = React.memo(
  ({ logos, index, currentTime }) => {
    const cycleInterval = 2000
    const columnDelay = index * 200
    const adjustedTime =
      (currentTime + columnDelay) % (cycleInterval * logos.length)
    const currentIndex = Math.floor(adjustedTime / cycleInterval)

    const CurrentLogo = useMemo(
      () => logos[currentIndex].img,
      [logos, currentIndex]
    )

    return (
      <motion.div
        className="w-24 h-14 md:w-48 md:h-24 overflow-hidden relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${logos[currentIndex].id}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: { type: "tween", ease: "easeIn", duration: 0.3 },
            }}
          >
            <CurrentLogo className="w-20 h-20 md:w-32 md:h-32 max-w-[80%] max-h-[80%] object-contain" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }
)

LogoColumn.displayName = "LogoColumn"

function LogoCarousel({ columnCount = 2 }: { columnCount?: number }) {
  const [logoSets, setLogoSets] = useState<Logo[][]>([])
  const [currentTime, setCurrentTime] = useState(0)

  const allLogos: Logo[] = useMemo(
    () => [
      { name: "Limpieza", id: 1, img: LimpiezaIcon },
      { name: "Cocina", id: 2, img: CocinaIcon },
      { name: "Jardín", id: 3, img: JardinIcon },
      { name: "Cuidado Infantil", id: 4, img: NineraIcon },
      { name: "Cuidado de Adultos", id: 5, img: CuidadoAdultosIcon },
      { name: "Mascotas", id: 6, img: MascotasIcon },
      { name: "Lavandería", id: 7, img: LavaderiaIcon },
      { name: "Reparaciones", id: 8, img: ReparacionesIcon },
      { name: "Pintura", id: 9, img: PinturaIcon },
      { name: "Plomería", id: 10, img: PlomeriaIcon },
      { name: "Electricidad", id: 11, img: ElectricidadIcon },
      { name: "Mecánica", id: 12, img: MecanicaIcon },
    ],
    []
  )

  useEffect(() => {
    setLogoSets(distributeLogos(allLogos, columnCount))
  }, [allLogos, columnCount])

  const updateTime = useCallback(() => {
    setCurrentTime((prev) => prev + 100)
  }, [])

  useEffect(() => {
    const id = setInterval(updateTime, 100)
    return () => clearInterval(id)
  }, [updateTime])

  return (
    <div className="flex space-x-4">
      {logoSets.map((logos, index) => (
        <LogoColumn
          key={index}
          logos={logos}
          index={index}
          currentTime={currentTime}
        />
      ))}
    </div>
  )
}

export { LogoCarousel }
export default LogoCarousel
