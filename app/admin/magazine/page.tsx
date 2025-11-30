'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, UploadCloud } from "lucide-react"
import { useContentStore } from "@/lib/content-store"
import { LabelInputFile } from "@/components/ui/label-input-file"
import { showToast } from "@/utils/show-toast"

export default function MagazinePage() {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { fetchMagazineUrl, magazineUrl, createMagazine } = useContentStore()

    const currentMagazine = magazineUrl
    const lastMagazine = previewUrl

    useEffect(() => {
        fetchMagazineUrl()
    }, [])

    const handleUpload = async () => {
        setIsLoading(true)
        try {
            await createMagazine(file)
            setFile(null)
            showToast({ type: "success", children: "Revista atualizada com sucesso" })
            fetchMagazineUrl()
        } catch (error) {
            console.error("Erro ao atualizar revista:", error)
            showToast({ type: "error", children: "Erro ao atualizar revista" })
        } finally {
            setIsLoading(false)
            window.location.reload()
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento da Revista</h1>

            {/* Upload section */}
            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <LabelInputFile
                        id="magazine-upload"
                        accept="pdf/*"
                        label="Nova Revista FPA"
                        onChange={(file) => {
                            setFile(file)
                            const preview = URL.createObjectURL(file!)
                            setPreviewUrl(preview)
                        }}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!file}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Enviar nova revista
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Magazines display */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Current Magazine */}
                <Card className="p-0">
                    <CardContent className="relative flex flex-col gap-4">
                        <h2 className="text-lg font-semibold mt-4 text-center text-primary">
                            📘 Revista Atual
                        </h2>
                        {currentMagazine ? (
                            <div className="w-full overflow-auto">
                                <iframe
                                    allowFullScreen
                                    src={currentMagazine}
                                    width="100%"
                                    height="460px"
                                    className="rounded-lg"
                                />
                                <a
                                    href={currentMagazine}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline mt-2 inline-block text-center w-full"
                                >
                                    Abrir revista completa
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">
                                Nenhuma revista atual disponível.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Last Magazine */}
                <Card className="p-0">
                    <CardContent className="relative flex flex-col gap-4">
                        <h2 className="text-lg font-semibold mt-4 text-center text-gray-700">
                            📙 Nova Revista
                        </h2>
                        {lastMagazine ? (
                            <div className="w-full overflow-auto">
                                <iframe
                                    allowFullScreen
                                    src={lastMagazine}
                                    width="100%"
                                    height="460px"
                                    className="rounded-lg"
                                />
                                <a
                                    href={lastMagazine}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline mt-2 inline-block text-center w-full"
                                >
                                    Abrir revista completa
                                </a>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">
                                Nenhuma revista anterior encontrada.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}