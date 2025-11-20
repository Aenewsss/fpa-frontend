'use client'

import { useEffect, useState } from "react"
import { createBanner, deleteBanner, reorderBanners, updateBanner } from "@/services/banners"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2, Edit3, Loader2 } from "lucide-react"
import { useContentStore } from "@/lib/content-store"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { showToast } from "@/utils/show-toast"
import { ToastContainer } from "react-toastify"
import { LabelInputFile } from "@/components/ui/label-input-file"

export default function BannerPage() {
    const [text, setText] = useState("")
    const [link, setLink] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)
    const [bannerToDeleteData, setBannerToDeleteData] = useState<any | null>(null)

    const { fetchBanners, banners } = useContentStore()
    const sensors = useSensors(useSensor(PointerSensor))
    const [orderedBanners, setOrderedBanners] = useState<any[]>([])

    useEffect(() => {
        fetchBanners()
    }, [])

    useEffect(() => {
        setOrderedBanners(banners)
    }, [banners])

    const handleDragEnd = async (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = orderedBanners.findIndex((b) => b.id === active.id)
        const newIndex = orderedBanners.findIndex((b) => b.id === over.id)

        const newOrder = arrayMove(orderedBanners, oldIndex, newIndex)
        setOrderedBanners(newOrder)
        await reorderBanners(active.id, newIndex)
        fetchBanners()
    }

    const handleUpload = async () => {
        if (!file) return
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("text", text)
            formData.append("link", link)
            await createBanner(formData as any)
            showToast({ type: "success", children: "Banner criado com sucesso!" })
            setText("")
            setLink("")
            setFile(null)
            fetchBanners()
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao criar banner" })
        } finally {
            setIsLoading(false)
            window.location.reload()
        }
    }

    const confirmDelete = async () => {
        if (bannerToDelete) {
            await deleteBanner(bannerToDelete)
            setBannerToDelete(null)
            setBannerToDeleteData(null)
            fetchBanners()
            showToast({ type: "success", children: "Banner excluído com sucesso!" })
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Banners</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input placeholder="Texto do banner" value={text} onChange={(e) => setText(e.target.value)} />
                    <Input placeholder="Link opcional" value={link} onChange={(e) => setLink(e.target.value)} />
                    <LabelInputFile
                        id="banner-upload"
                        label={`Banner`}
                        accept="image/*"
                        onChange={(file) => setFile(file)}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!file || !text || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Enviar banner
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedBanners.map(b => b.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {orderedBanners.map((banner) => (
                            <SortableCard
                                key={banner.id}
                                banner={banner}
                                refresh={fetchBanners}
                                onDelete={() => {
                                    setBannerToDelete(banner.id)
                                    setBannerToDeleteData(banner)
                                }}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
                <AlertDialogContent className="z-[9999999999999999]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deseja realmente excluir esse banner?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="mb-4">
                        {bannerToDeleteData?.imageUrl && (
                            <img loading="lazy" src={bannerToDeleteData.imageUrl} alt="banner-preview" className="w-full h-64 object-cover rounded" />
                        )}
                        <p className="text-center mt-2">{bannerToDeleteData?.text}</p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ToastContainer />
        </div>
    )
}

function SortableCard({ banner, onDelete, refresh }: { banner: any, onDelete: () => void, refresh: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(banner.text)
    const [link, setLink] = useState(banner.link)
    const [file, setFile] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleUpdate = async () => {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append("text", text)
            formData.append("link", link)
            if (file) formData.append("file", file)
            await updateBanner(banner.id, formData)
            showToast({ type: "success", children: "Banner atualizado com sucesso!" })
            refresh()
            setIsEditing(false)
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao atualizar banner" })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="p-0">
                <CardContent {...attributes} {...listeners} className="relative cursor-grab active:cursor-grabbing flex flex-col gap-4 p-4">
                    <img loading="lazy" src={banner.imageUrl} alt="banner" className="w-full h-40 object-cover rounded-t-lg" />
                    <p className="font-semibold text-sm">{banner.text}</p>
                    {banner.link && (
                        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline w-fit">
                            {banner.link}
                        </a>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between bg-gray-50 py-2">
                    <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4 mr-2" /> Editar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Editar Banner</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="space-y-4 mt-2">
                                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Texto do banner" />
                                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link opcional" />
                                <LabelInputFile
                                    id="banner-upload-update"
                                    label={`Atualizar imagem do banner`}
                                    accept="image/*"
                                    onChange={(file) => setFile(file)}
                                />

                                {banner.imageUrl && <img loading="lazy" src={banner.imageUrl} className="w-full h-40 object-cover rounded" />}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button onClick={handleUpdate} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                                            </>
                                        ) : (
                                            "Salvar alterações"
                                        )}
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[9999999999999999]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Deseja realmente excluir esse banner?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="mb-4">
                                <img loading="lazy" src={banner.imageUrl} alt="banner-preview" className="w-full h-80 object-contain rounded" />
                                {banner.text && <p className="mt-2 text-sm text-center">{banner.text}</p>}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    )
}