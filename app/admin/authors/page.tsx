'use client'

import { useEffect, useState } from "react"
import { createAuthor, deleteAuthor, updateAuthor } from "@/services/authors"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Edit3, Loader2, Trash2 } from "lucide-react"
import { useContentStore } from "@/lib/content-store"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LabelInputFile } from "@/components/ui/label-input-file"
import { ToastContainer } from "react-toastify"
import { showToast } from "@/utils/show-toast"

export default function AuthorPage() {
    const [name, setName] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const { fetchAuthors, authors } = useContentStore()
    const sensors = useSensors(useSensor(PointerSensor))
    const [orderedAuthors, setOrderedAuthors] = useState<any[]>([])

    useEffect(() => {
        fetchAuthors()
    }, [])

    useEffect(() => {
        setOrderedAuthors(authors.filter(el => el.name))
    }, [authors])

    const handleUpload = async () => {
        setIsLoading(true)
        if (!file) return setIsLoading(false)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("name", name)
            await createAuthor(formData as any)
            setName("")
            setFile(null)
            fetchAuthors()
            showToast({ type: 'success', children: 'Parlamentar criado com sucesso' })
        } catch (error) {
            console.error("Erro ao enviar author:", error)
            showToast({ type: 'error', children: 'Erro ao criar parlamentar' })
        } finally {
            setIsLoading(false)
            window.location.reload()
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Parlamentares</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input
                        placeholder="Nome do parlamentar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <LabelInputFile
                        id="cover-file"
                        label="Selecionar foto do parlamentar"
                        accept="image/*"
                        onChange={(file) => setFile(file)}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!file || !name}>
                        {isLoading ?
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
                            </>
                            :
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Criar parlamentar
                            </>
                        }
                    </Button>
                </CardFooter>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter}>
                <SortableContext items={orderedAuthors.map(b => b.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {orderedAuthors.map((author: any) => (
                            <SortableCard
                                key={author.id}
                                author={author}
                                refresh={fetchAuthors}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <ToastContainer />
        </div>
    )
}

function SortableCard({ author, refresh }: { author: any, refresh: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: author.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(author.name)
    const [file, setFile] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const handleUpdate = async () => {
        if (!name && !file) return
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            if (file) formData.append("file", file)
            await updateAuthor(author.id, formData)
            refresh()
            showToast({ type: 'success', children: 'Parlamentar atualizado com sucesso' })
            setIsEditing(false)
        } catch (err) {
            console.error(err)
            showToast({ type: 'error', children: 'Erro ao atualizar parlamentar' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteAuthor(author.id)
            refresh()
            showToast({ type: 'success', children: 'Parlamentar excluído com sucesso' })
        } catch (err) {
            console.error(err)
            showToast({ type: 'error', children: 'Erro ao excluir parlamentar' })
        } finally {
            setIsDeleting(false)
            setConfirmDelete(false)
        }
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="p-0">
                <CardContent {...attributes} {...listeners} className="relative cursor-grab active:cursor-grabbing flex flex-col gap-4">
                    <img loading="lazy"
                        src={author.photoUrl}
                        alt="author"
                        className="w-full h-40 object-contain rounded-t-lg"
                    />
                    <p className="font-semibold text-sm text-center">{author.name}</p>
                </CardContent>
                <CardFooter className="flex justify-center bg-gray-50 py-2">
                    <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4 mr-2" /> Editar
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Editar parlamentar</AlertDialogTitle>
                            </AlertDialogHeader>

                            <div className="space-y-4 mt-2">
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome do parlamentar"
                                />
                                <LabelInputFile
                                    id={`update-file-${author.id}`}
                                    label="Atualizar foto"
                                    accept="image/*"
                                    onChange={(f) => setFile(f)}
                                />
                                {file && (
                                    <img loading="lazy"
                                        src={URL.createObjectURL(file)}
                                        className="w-full h-40 object-contain rounded"
                                    />
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

                    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                        <AlertDialogTrigger asChild>
                            <Button className="ms-4" size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="flex flex-col items-center gap-3">
                                <img loading="lazy"
                                    src={author.photoUrl}
                                    alt="preview"
                                    className="w-40 h-40 object-contain rounded"
                                />
                                <p className="text-sm text-center text-muted-foreground">{author.name}</p>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
                                            </>
                                        ) : (
                                            "Excluir"
                                        )}
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    )
}