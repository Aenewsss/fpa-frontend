// components/SearchToggle.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

export default function SearchToggle() {
    const [open, setOpen] = useState(false)
    const [q, setQ] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const isMobile = useIsMobile()

    useEffect(() => {
        if (open) inputRef.current?.focus()
    }, [open])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const submit = () => {
        const value = q.trim()
        if (!value) return
        setOpen(false)
        router.push(`${process.env.NEXT_PUBLIC_FRONT_URL}/busca?q=${encodeURIComponent(value)}`)
    }

    return (
        <div ref={containerRef} className="relative flex items-center md:w-auto w-full">

            <button
                aria-label="Buscar"
                onClick={() => setOpen(true)}
                className={`${(open || isMobile) ? "md:block hidden" : ""} cursor-pointer p-2 rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60`}
            >
                <Search className="h-6 w-6 text-white" />
            </button>

            <AnimatePresence>
                {(open || isMobile) && (
                    <motion.div
                        key="search-input"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className={`md:absolute right-0 origin-right flex items-center gap-2 md:bg-white md:border-none border-white border-1 px-3 py-2 md:rounded-full rounded-lg shadow-md w-[76vw] lg:max-w-[400px] ${isMobile? 'w-full':`max-w-[20vw]`}`}
                    >
                        <Search className="h-5 w-5 md:text-gray-500" />
                        <input
                            ref={inputRef}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') submit()
                                if (e.key === 'Escape') setOpen(false)
                            }}
                            placeholder="Pesquisar assuntos, notícias, vídeos…"
                            className="w-full bg-transparent outline-none md:text-gray-900 md:placeholder:text-gray-500"
                        />
                        {q && (
                            <button
                                aria-label="Limpar"
                                onClick={() => setQ('')}
                                className="p-1 rounded hover:bg-gray-100"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}