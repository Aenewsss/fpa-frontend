'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2, Edit3, Loader2 } from "lucide-react"
import { useContentStore } from "@/lib/content-store"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LabelInputFile } from "@/components/ui/label-input-file"
import { showToast } from "@/utils/show-toast"
import { ToastContainer } from "react-toastify"

interface SlideInput {
    file: File;
    text?: string;
}

export default function WebstoriesPage() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [slides, setSlides] = useState<SlideInput[]>([])
    const [isFeatured, setIsFeatured] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        fetchWebStories,
        webstories,
        createWebStory,
        deleteWebStory,
        reorderWebstories,
        updateWebStory
    } = useContentStore()

    const [orderedWebstories, setOrderedWebstories] = useState<any[]>([])
    const sensors = useSensors(useSensor(PointerSensor))

    useEffect(() => {
        fetchWebStories()
    }, [])

    useEffect(() => {
        setOrderedWebstories(webstories)
    }, [webstories])

    const handleUpload = async () => {
        if (!title || slides.length === 0) return
        setIsLoading(true)
        try {
            await createWebStory({ slides, title, description, isFeatured })
            setTitle("")
            setDescription("")
            setSlides([])
            showToast({ type: "success", children: "Webstory criada com sucesso!" })
            fetchWebStories()
        } catch (error) {
            console.error(error)
            showToast({ type: "error", children: "Erro ao criar webstory" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = orderedWebstories.findIndex((w) => w.id === active.id)
        const newIndex = orderedWebstories.findIndex((w) => w.id === over.id)

        const newOrder = arrayMove(orderedWebstories, oldIndex, newIndex)
        setOrderedWebstories(newOrder)
        await reorderWebstories(active.id, newIndex)
            .then(_ => showToast({ type: 'success', children: 'Ordem atualizada' }))
        fetchWebStories()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Webstories</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input placeholder="Descrição opcional" value={description} onChange={(e) => setDescription(e.target.value)} />

                    {slides.map((slide, index) => (
                        <div key={index} className="flex gap-4 items-center">
                            <LabelInputFile
                                id={`slide-${index}`}
                                label={`Slide ${index + 1}`}
                                accept="image/*"
                                onChange={(file) => {
                                    const updated = [...slides]
                                    updated[index].file = file!
                                    setSlides(updated)
                                }}
                            />
                            <Input
                                placeholder="Texto do slide"
                                value={slide.text || ""}
                                onChange={(e) => {
                                    const updated = [...slides]
                                    updated[index].text = e.target.value
                                    setSlides(updated)
                                }}
                            />
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSlides([...slides, { file: new File([], "") }])}
                    >
                        + Adicionar Slide
                    </Button>

                    <div className="flex gap-2 items-center pt-2">
                        <label className="flex items-center space-x-2 text-sm ps-2">Webstory em destaque?</label>
                        <Input
                            className="cursor-pointer w-4 h-4"
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!title || slides.length === 0 || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Enviar Webstory
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedWebstories.map((w) => w.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {orderedWebstories.map((webstory) => (
                            <SortableCard
                                key={webstory.id}
                                webstory={webstory}
                                onDelete={() => deleteWebStory(webstory.id)}
                                onUpdate={updateWebStory}
                                refresh={fetchWebStories}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <ToastContainer />
        </div>
    )
}

function SortableCard({
    webstory,
    onDelete,
    onUpdate,
    refresh,
}: {
    webstory: any
    onDelete: () => void
    onUpdate: Function
    refresh: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: webstory.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [title, setTitle] = useState(webstory.title)
    const [description, setDescription] = useState(webstory.description)
    const [isFeatured, setIsFeatured] = useState(webstory.isFeatured)
    const [slides, setSlides] = useState(webstory.slides || [])

    const handleUpdate = async () => {
        setIsSaving(true)
        try {
            await onUpdate({
                id: webstory.id,
                title,
                description,
                isFeatured,
                slides
            })
            showToast({ type: "success", children: "Webstory atualizada com sucesso!" })
            refresh()
            setIsEditing(false)
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao atualizar webstory" })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="p-0">
                <CardContent
                    {...attributes}
                    {...listeners}
                    className="relative cursor-grab active:cursor-grabbing flex flex-col gap-4"
                >
                    <p className="font-semibold text-sm">{webstory.title}</p>
                    {webstory.slides?.[0]?.imageUrl && (
                        <img loading="lazy"
                            className="object-contain max-h-64 rounded"
                            src={webstory.slides[0].imageUrl}
                            alt="webstory preview"
                        />
                    )}
                </CardContent>

                <CardFooter className="flex justify-between bg-[rgba(245,245,245)] py-2">
                    {/* ✏️ Edit modal */}
                    <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4 mr-2" /> Editar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[9999999999999999] md:max-w-[80%] max-w-full max-h-[90vh] overflow-y-auto z-[9999999999999999]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Editar Webstory</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="space-y-4 mt-2">
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" />
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
                                <div className="flex items-center gap-3">
                                    <label className="text-sm">Destaque?</label>
                                    <Input
                                        type="checkbox"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                    />
                                </div>

                                {slides.map((slide: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col md:flex-row items-start md:items-center gap-3 border p-3 rounded-lg relative bg-gray-50"
                                    >
                                        <div className="flex-1 space-y-2 w-full">
                                            <LabelInputFile
                                                id={`slide-update-${idx}`}
                                                label={`Slide ${idx + 1}`}
                                                accept="image/*"
                                                onChange={(f) => {
                                                    console.log(f)
                                                    const updated = [...slides]
                                                    updated[idx].file = f
                                                    setSlides(updated)
                                                }}
                                            />

                                            {slide.imageUrl && (
                                                <img loading="lazy"
                                                    src={slide.imageUrl}
                                                    alt="slide preview"
                                                    className="h-40 w-auto object-cover rounded"
                                                />
                                            )}

                                            <Input
                                                value={slide.text || ""}
                                                placeholder="Texto do slide"
                                                onChange={(e) => {
                                                    const updated = [...slides]
                                                    updated[idx].text = e.target.value
                                                    setSlides(updated)
                                                }}
                                            />
                                        </div>

                                        {/* Remove slide button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="mt-2 md:mt-0 shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="z-[9999999999999999]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Deseja realmente remover este slide?
                                                    </AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <div className="mb-4 text-center">
                                                    {slide.imageUrl && (
                                                        <img loading="lazy"
                                                            src={slide.imageUrl}
                                                            alt="preview"
                                                            className="mx-auto w-40 h-40 object-cover rounded"
                                                        />
                                                    )}
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {slide.text || "Sem texto associado"}
                                                    </p>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            const updated = slides.filter((_: any, i: number) => i !== idx)
                                                            setSlides(updated)
                                                        }}
                                                    >
                                                        Remover
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
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

                    {/* 🗑 Delete */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[9999999999999999]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Deseja realmente excluir esta webstory?</AlertDialogTitle>
                            </AlertDialogHeader>
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