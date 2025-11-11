'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2 } from "lucide-react"
import { useContentStore } from "@/lib/content-store"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import {
    SortableContext, arrayMove, rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LabelInputFile } from "@/components/ui/label-input-file"
import { Tag, CreateTagData } from "@/services/tags"

const formInitialState: CreateTagData = {
    name: "",
    description: "",
    slug: "",
    color: "",
}

export default function TagPage() {
    const [form, setForm] = useState<CreateTagData>(formInitialState)

    const { fetchTags, tags, createTag, deleteTag, } = useContentStore()

    useEffect(() => {
        fetchTags()
    }, [])

    const handleUpload = async () => {
        if (!form.name) return

        await createTag(form)
        setForm(formInitialState)
        fetchTags()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Tags</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input
                        placeholder="Nome da tag"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Input
                        placeholder="Slug. Ex: tecnologia"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />
                    <Input
                        placeholder="Descrição opcional"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <div className="flex ms-3 items-center gap-2">
                        <label className="text-gray-600 text-sm">Cor da tag</label>
                        <Input
                            className="w-[60px] cursor-pointer"
                            type="color"
                            value={form.color}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                        />
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!form.name}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Enviar Tag
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tags?.map((tag) => (
                    <SortableCard
                        key={tag.id}
                        tag={tag}
                        onDelete={() => deleteTag(tag.id)}
                    />
                ))}
            </div>

        </div>
    )
}

function SortableCard({ tag, onDelete }: { tag: any, onDelete: () => void }) {
    return (
        <div >
            <Card className="p-0">
                <CardContent className="relative flex flex-col gap-4 p-4">
                    <p className="font-semibold text-sm">{tag.name}</p>
                    <p style={{color: tag.color}} className="font-semibold text-sm">{tag.slug}</p>
                    <p className="text-xs text-muted-foreground">{tag.description}</p>
                    {tag.iconUrl && (
                        <img loading="lazy" src={tag.iconUrl} alt="ícone" className="w-20 h-20 object-contain" />
                    )}
                </CardContent>
                <CardFooter className="flex justify-between bg-[rgba(245,245,245)] py-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[9999999999999999] max-w-[300px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Deseja realmente excluir?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="mb-4 text-sm text-muted-foreground">
                                {tag.name}
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