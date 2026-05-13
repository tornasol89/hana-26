import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "motion/react"
import worker1 from "@/assets/worker-1.jpg"
import worker2 from "@/assets/worker-2.jpg"
import worker3 from "@/assets/worker-3.jpg"
import worker4 from "@/assets/worker-4.jpg"
import worker5 from "@/assets/worker-5.jpg"
import worker6 from "@/assets/worker-6.jpg"

export interface WorkerCarouselItem {
  id: string
  url: string
  label: string
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

const IS_SERVER = typeof window === "undefined"

function useMediaQuery(query: string, defaultValue = false): boolean {
  const getMatches = () => (IS_SERVER ? defaultValue : window.matchMedia(query).matches)
  const [matches, setMatches] = useState(getMatches)

  useIsomorphicLayoutEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const handler = () => setMatches(media.matches)
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [query])

  return matches
}

const HANA_IMAGES = [worker1, worker2, worker3, worker4, worker5, worker6]

const transition = { duration: 0.15, ease: [0.32, 0.72, 0, 1] as const }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const }

// ─── Cilindro 3D ──────────────────────────────────────────────────────────────

const Carousel = memo(function Carousel({
  handleClick,
  controls,
  cards,
  isCarouselActive,
}: {
  handleClick: (imgUrl: string, index: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controls: any
  cards: string[]
  isCarouselActive: boolean
}) {
  const isSmall = useMediaQuery("(max-width: 640px)")
  const cylinderWidth = isSmall ? 1100 : 1800
  const faceCount = cards.length
  const faceWidth = cylinderWidth / faceCount
  const radius = cylinderWidth / (2 * Math.PI)
  const rotation = useMotionValue(0)
  const transform = useTransform(rotation, (v) => `rotate3d(0, 1, 0, ${v}deg)`)
  const isDragging = useRef(false)

  // Auto-rotación lenta: ~0.08 grados por frame → ~75 seg por vuelta completa
  useEffect(() => {
    if (!isCarouselActive) return
    const id = setInterval(() => {
      if (!isDragging.current) {
        rotation.set(rotation.get() - 0.08)
      }
    }, 16)
    return () => clearInterval(id)
  }, [isCarouselActive, rotation])

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ perspective: "1000px", transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <motion.div
        drag={isCarouselActive ? "x" : false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{
          transform,
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: "preserve-3d",
        }}
        onDragStart={() => { isDragging.current = true }}
        onDrag={(_, info) =>
          isCarouselActive && rotation.set(rotation.get() + info.offset.x * 0.05)
        }
        onDragEnd={(_, info) => {
          isDragging.current = false
          isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: { type: "spring" as const, stiffness: 100, damping: 30, mass: 0.1 },
            })
        }}
        animate={controls}
      >
        {cards.map((imgUrl, i) => (
          <motion.div
            key={`${imgUrl}-${i}`}
            className="absolute flex h-full origin-center items-center justify-center rounded-xl p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
            }}
            onClick={() => handleClick(imgUrl, i)}
          >
            <motion.img
              src={imgUrl}
              alt={`Profesional Hana ${i + 1}`}
              layoutId={`img-${imgUrl}`}
              className="pointer-events-none w-full rounded-xl object-cover aspect-[4/5] shadow-md"
              initial={{ filter: "blur(4px)" }}
              layout="position"
              animate={{ filter: "blur(0px)" }}
              transition={transition}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
})

// ─── Componente principal ──────────────────────────────────────────────────────

interface ThreeDPhotoCarouselProps {
  workers?: WorkerCarouselItem[]
  onWorkerClick?: (id: string) => void
  compact?: boolean
}

function ThreeDPhotoCarousel({ workers, onWorkerClick, compact = false }: ThreeDPhotoCarouselProps = {}) {
  const workerMode = !!workers && !!onWorkerClick
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()
  const cards = useMemo(
    () => (workerMode ? workers!.map((w) => w.url) : HANA_IMAGES),
    [workerMode, workers]
  )

  const handleClick = (imgUrl: string, index: number) => {
    if (workerMode) {
      onWorkerClick!(workers![index]?.id ?? "")
      return
    }
    setActiveImg(imgUrl)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveImg(null)
    setIsCarouselActive(true)
  }

  const heightClass = compact
    ? "h-[220px] sm:h-[280px]"
    : "h-[300px] sm:h-[400px] lg:h-[500px]"

  return (
    <motion.div layout className="relative">
      {/* Overlay (solo modo estático) */}
      {!workerMode && (
        <AnimatePresence mode="sync">
          {activeImg && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              layoutId={`img-container-${activeImg}`}
              layout="position"
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8 md:p-24 rounded-3xl cursor-pointer"
              style={{ willChange: "opacity" }}
              transition={transitionOverlay}
            >
              <motion.img
                layoutId={`img-${activeImg}`}
                src={activeImg}
                alt="Profesional Hana"
                className="max-w-full max-h-full rounded-2xl shadow-2xl object-cover"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
                style={{ willChange: "transform" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Carrusel */}
      <div className={`relative ${heightClass} w-full overflow-hidden`}>
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={cards}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

export default ThreeDPhotoCarousel
