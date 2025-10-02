// components/WebstoryViewer.tsx
'use client'

import { Fragment, useEffect, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { WebStory } from '@/services/webstories'

interface Props {
  open: boolean
  onClose: () => void
  webstory: WebStory | null
}

const SLIDE_DURATION = 10000 // 10 seconds

export default function WebstoryViewer({ open, onClose, webstory }: Props) {
  const [index, setIndex] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  useEffect(() => {
    if (!open || !webstory) return

    const timer = setTimeout(() => {
      nextSlide()
    }, SLIDE_DURATION)

    // Reset & animate progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = 'none'
      progressRef.current.style.width = '0%'
      requestAnimationFrame(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = `width ${SLIDE_DURATION}ms linear`
          progressRef.current.style.width = '100%'
        }
      })
    }

    return () => clearTimeout(timer)
  }, [index, open, webstory])

  const nextSlide = () => {
    if (!webstory) return
    if (index < webstory.slides.length - 1) {
      setIndex(index + 1)
    } else {
      onClose()
    }
  }

  const prevSlide = () => {
    if (index > 0) setIndex(index - 1)
  }

  if (!webstory) return null

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 backdrop-blur-2xl" />
        <div className="fixed inset-0 bg-black/80" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="relative">
            {/* Botão fechar */}
            <button
              className="absolute top-4 right-4 z-20 text-white cursor-pointer"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Container da imagem */}
            <div className="relative aspect-[9/16] h-[90vh] max-h-[90vh]">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-20">
                <div ref={progressRef} className="h-full bg-white w-0"></div>
              </div>

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

                  {/* Texto sobreposto */}
                  {webstory.slides[index].text && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute bottom-6 left-4 right-4 text-white lg:text-[1vw] text-xl font-medium bg-black/50 px-4 py-2 rounded-lg"
                    >
                      {webstory.slides[index].text}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navegação lateral */}
              <div className="absolute inset-y-0 left-2 flex items-center z-20">
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide() }}
                  className="text-white cursor-pointer hover:scale-110 transition"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-2 flex items-center z-20">
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide() }}
                  className="text-white cursor-pointer hover:scale-110 transition"
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