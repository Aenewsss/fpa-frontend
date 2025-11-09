import { Fragment, useEffect, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { WebStory } from '@/services/webstories'

const SLIDE_DURATION = 10000 // 10s

interface Props {
  open: boolean
  onClose: () => void
  onNextStory?: () => void
  onPrevStory?: () => void
  webstory: WebStory | null
  startFromEnd?: boolean
}

export default function WebstoryViewer({
  open,
  onClose,
  onNextStory,
  onPrevStory,
  webstory,
  startFromEnd = false
}: Props) {
  const [index, setIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0) // 👈 força reset da barra
  const progressRef = useRef<HTMLDivElement>(null)

  // Reinicia índice e progresso ao trocar de story group
  useEffect(() => {
    if (open && webstory) {
      if (startFromEnd) setIndex(webstory.slides.length - 1)
      else setIndex(0)
      setProgressKey((prev) => prev + 1) // 👈 força re-render das barras
    }
  }, [open, webstory, startFromEnd])

  useEffect(() => {
    if (!open || !webstory) return

    const timer = setTimeout(() => nextSlide(), SLIDE_DURATION)

    return () => clearTimeout(timer)
  }, [index, open, webstory])

  const nextSlide = () => {
    if (!webstory) return
    if (index < webstory.slides.length - 1) setIndex(index + 1)
    else onNextStory?.()
  }

  const prevSlide = () => {
    if (!webstory) return
    if (index > 0) setIndex(index - 1)
    else onPrevStory?.()
  }

  if (!webstory) return null

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[9999999999999]" onClose={onClose}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="relative">
            {/* Botão fechar */}
            <button
              className="absolute top-4 right-4 z-50 text-white cursor-pointer"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative aspect-[9/16] h-[90vh] max-h-[90vh]">

              {/* 🔹 Barras de progresso (resetam com progressKey) */}
              <div
                key={progressKey}
                className="absolute top-4 left-0 w-full px-3 flex gap-1 z-30"
              >
                {webstory.slides.map((_, i) => (
                  <div key={i} className="flex-1 bg-white/30 h-1 rounded overflow-hidden">
                    <div
                      ref={i === index ? progressRef : null}
                      className={`h-full bg-white transition-all ${i < index
                          ? 'w-full' // ✅ já passou
                          : i === index
                            ? 'w-0 animate-progress' // ✅ anima a barra atual
                            : 'w-0' // ✅ futuros slides (ainda não vistos)
                        }`}
                    />
                  </div>
                ))}
              </div>

              {/* Slide atual */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative cursor-pointer"
                  onClick={nextSlide}
                >
                  <Image
                    src={webstory.slides[index].imageUrl!}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    priority
                  />
                  {webstory.slides[index].text && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute bottom-6 left-4 right-4 text-white text-xl font-medium bg-black/50 px-4 py-2 rounded-lg"
                    >
                      {webstory.slides[index].text}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navegação */}
              <div className="absolute inset-y-0 left-2 flex items-center z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevSlide()
                  }}
                  className="text-white hover:scale-110 transition"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-2 flex items-center z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextSlide()
                  }}
                  className="text-white hover:scale-110 transition"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition.Root>
  )
}