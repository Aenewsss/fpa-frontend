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
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LabelInputFile } from "@/components/ui/label-input-file"
import { CreateRelevantData, UpdateRelevantData } from "@/services/relevants"
import { showToast } from "@/utils/show-toast"
import { ToastContainer } from "react-toastify"

const formInitialState: CreateRelevantData = {
    title: "",
    description: "",
    videoFile: null,
    coverFile: null,
}

export default function RelevantsPage() {
    const [form, setForm] = useState<CreateRelevantData>(formInitialState)
    const { fetchRelevants, relevants, createRelevant, deleteRelevant, reorderRelevants, updateRelevant } = useContentStore()
    const [orderedRelevants, setOrderedRelevants] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const sensors = useSensors(useSensor(PointerSensor))

    useEffect(() => {
        fetchRelevants({ limit: 20 })
    }, [])

    useEffect(() => {
        setOrderedRelevants(relevants)
    }, [relevants])

    const handleUpload = async () => {
        if (!form.videoFile || !form.title) return
        setIsLoading(true)

        try {
            await createRelevant(form)
            showToast({ type: "success", children: "Vídeo enviado com sucesso!" })
            setForm(formInitialState)
            fetchRelevants({ limit: 20 })
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao enviar vídeo" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = orderedRelevants.findIndex((w) => w.id === active.id)
        const newIndex = orderedRelevants.findIndex((w) => w.id === over.id)

        const newOrder = arrayMove(orderedRelevants, oldIndex, newIndex)
        setOrderedRelevants(newOrder)
        await reorderRelevants(active.id, newIndex)
            .then(_ => showToast({ type: 'success', children: 'Ordem atualizada' }))
        fetchRelevants({ limit: 20 })
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento Minuto FPA</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input
                        placeholder="Título"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <Input
                        placeholder="Descrição opcional"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <LabelInputFile
                        id="video-upload"
                        label="Selecionar vídeo"
                        accept="video/*"
                        onChange={(file) => setForm({ ...form, videoFile: file })}
                    />
                    <LabelInputFile
                        id="cover-upload"
                        label="Selecionar imagem de capa"
                        accept="image/*"
                        onChange={(file) => setForm({ ...form, coverFile: file })}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!form.videoFile || !form.title || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Enviar vídeo
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedRelevants.map((r) => r.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {orderedRelevants.map((relevant) => (
                            <SortableCard
                                key={relevant.id}
                                relevant={relevant}
                                onDelete={() => deleteRelevant(relevant.id)}
                                onUpdate={updateRelevant}
                                refresh={fetchRelevants}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <ToastContainer />
        </div>
    )
}

function SortableCard({ relevant, onDelete, onUpdate, refresh }: { relevant: any; onDelete: () => void; onUpdate: Function; refresh: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: relevant.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const [form, setForm] = useState<UpdateRelevantData>({
        id: relevant.id,
        title: relevant.title,
        description: relevant.description,
    })

    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleUpdate = async () => {
        setIsSaving(true)
        try {
            await onUpdate(form)
            showToast({ type: "success", children: "Vídeo atualizado com sucesso!" })
            refresh()
            setIsEditing(false)
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao atualizar vídeo" })
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
                    <p className="font-semibold text-sm">{relevant.title}</p>
                    {relevant.videoUrl && <video className="object-contain max-h-64" controls src={relevant.videoUrl}></video>}
                </CardContent>
                <CardFooter className="flex justify-between bg-[rgba(245,245,245)] py-2">
                    <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4 mr-2" /> Editar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Editar vídeo</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="space-y-4 mt-2">
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" />
                                <Input
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Descrição"
                                />
                                <LabelInputFile
                                    id={`video-${relevant.id}`}
                                    label="Atualizar vídeo"
                                    accept="video/*"
                                    onChange={(f) => setForm({ ...form, videoFile: f! })}
                                />
                                {(typeof relevant.videoUrl == "string") &&
                                    <video src={relevant.videoUrl} className="w-full h-40 object-contain rounded" />
                                }
                                <LabelInputFile
                                    id={`cover-${relevant.id}`}
                                    label="Atualizar capa"
                                    accept="image/*"
                                    onChange={(f) => setForm({ ...form, coverFile: f! })}
                                />
                                {typeof relevant.coverImageUrl == "string" && (
                                    <img loading="lazy" src={relevant.coverImageUrl} className="w-full h-40 object-contain rounded" />
                                )}
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
                        <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Deseja realmente excluir este vídeo?</AlertDialogTitle>
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