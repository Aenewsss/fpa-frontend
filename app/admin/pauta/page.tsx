'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, UploadCloud } from "lucide-react"
import { LabelInputFile } from "@/components/ui/label-input-file"
import { getPauta, updatePauta } from "@/services/pauta"
import { ToastContainer } from "react-toastify"
import { showToast } from "@/utils/show-toast"

export default function PautaPage() {
    const [file, setFile] = useState<File | null>(null)
    const [currentUrl, setCurrentUrl] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchPautaUrl()
    }, [])

    async function fetchPautaUrl(updated?: boolean) {
        try {
            const res = await getPauta()
            setCurrentUrl(res.imageUrl!)
            if (updated) showToast({ type: 'success', children: 'Pauta atualizada com sucesso!' })
        } catch (err) {
            console.error("Erro ao buscar pauta:", err)
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setIsLoading(true)

        try {
            const form = new FormData()
            form.append('file', file)

            await updatePauta(form)
            setFile(null)
            setPreviewUrl('')
            fetchPautaUrl(true)
        } catch (error) {
            console.error("Erro ao atualizar pauta:", error)
            showToast({ type: 'error', children: 'Erro ao atualizar pauta.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold">Gerenciamento da Pauta</h1>

            <Card>
                <CardContent className="px-6 flex flex-col gap-4">
                    <LabelInputFile
                        enableCrop={false}
                        id="pauta-upload"
                        accept="image/*"
                        label="Nova pauta"
                        onChange={(file) => {
                            setFile(file)

                            if (!file) return setPreviewUrl('')

                            const preview = URL.createObjectURL(file!)
                            setPreviewUrl(preview)
                        }}
                    />
                    <p className="text-sm text-gray-500">Selecione a imagem da nova pauta para atualizar.</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!file || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Atualizar pauta
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Visual Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center gap-4">
                        <h2 className="text-lg font-semibold">📄 Pauta Atual</h2>
                        {currentUrl ? (
                            <img loading="lazy"
                                src={currentUrl}
                                alt="Pauta atual"
                                className="rounded-lg shadow-md w-full max-w-md border"
                            />
                        ) : (
                            <p className="text-gray-500 text-sm">Nenhuma pauta disponível.</p>
                        )}
                    </CardContent>
                </Card>

                {previewUrl && (
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center gap-4">
                            <h2 className="text-lg font-semibold">🆕 Nova Pauta (pré-visualização)</h2>
                            <img loading="lazy"
                                src={previewUrl}
                                alt="Pré-visualização nova pauta"
                                className="rounded-lg shadow-md w-full max-w-md border"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <ToastContainer />
        </div>
    )
}