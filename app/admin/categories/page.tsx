'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2, Edit3, Loader2 } from "lucide-react"
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
import { Category, CreateCategoryData, UpdateCategoryData } from "@/services/categories"
import { showToast } from "@/utils/show-toast"
import { ToastContainer } from "react-toastify"

const formInitialState: CreateCategoryData = {
    name: "",
    description: "",
    slug: "",
    color: "#000000",
    isFeatured: false,
    file: null
}

export default function CategoryPage() {
    const [form, setForm] = useState<CreateCategoryData>(formInitialState)
    const [isLoading, setIsLoading] = useState(false)

    const {
        fetchCategories,
        categories,
        createCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
    } = useContentStore()

    const [orderedCategories, setOrderedCategories] = useState<Category[]>([])
    const sensors = useSensors(useSensor(PointerSensor))

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        setOrderedCategories(categories)
    }, [categories])

    const handleUpload = async () => {
        setIsLoading(true)

        if (!form.name) return setIsLoading
        try {
            await createCategory(form)
            setForm(formInitialState)
            fetchCategories()
            showToast({ type: "success", children: "Categoria criada com sucesso" })
        } catch (error) {
            showToast({ type: "error", children: "Erro ao criar categoria" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDragEnd = async (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = orderedCategories.findIndex((c) => c.id === active.id)
        const newIndex = orderedCategories.findIndex((c) => c.id === over.id)
        const newOrder = arrayMove(orderedCategories, oldIndex, newIndex)
        setOrderedCategories(newOrder)
        await reorderCategories(active.id, newIndex)
        fetchCategories()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Categorias</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input
                        placeholder="Nome da categoria"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Input
                        placeholder="Descrição opcional"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <div className="flex gap-4 ms-2 items-center">
                        <label>Categoria será destaque na home?</label>
                        <Input
                            checked={form.isFeatured}
                            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                            type="checkbox"
                            className="w-4 cursor-pointer"
                        />
                    </div>
                    <Input
                        placeholder="Slug. Ex: tecnologia"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                    <LabelInputFile
                        id="cover-file"
                        label="Selecionar capa da categoria"
                        accept="image/*"
                        onChange={(file) => setForm({ ...form, file: file })}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!form.name}>
                        {isLoading ?
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                            </>
                            :
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Criar Categoria
                            </>
                        }
                    </Button>
                </CardFooter>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedCategories.map(c => c.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {orderedCategories.map((category) => (
                            <SortableCard
                                key={category.id}
                                category={category}
                                onDelete={() => deleteCategory(category.id)}
                                onUpdate={updateCategory}
                                refresh={fetchCategories}
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
    category,
    onDelete,
    onUpdate,
    refresh,
}: {
    category: any
    onDelete: () =>  Promise<void>
    onUpdate: (data: UpdateCategoryData) => Promise<void>
    refresh: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const [form, setForm] = useState<UpdateCategoryData>({
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        color: category.color,
        isFeatured: category.isFeatured,
    })
    const [isSaving, setIsSaving] = useState(false)

    const handleUpdate = async () => {
        setIsSaving(true)
        try {
            await onUpdate(form)
            refresh()
            showToast({ type: "success", children: "Categoria atualizada com sucesso!" })
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao atualizar categoria" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        try {
            await onDelete()
            refresh()
            showToast({ type: "success", children: "Categoria excluída com sucesso!" })
        } catch (err) {
            console.error(err)
            showToast({ type: "error", children: "Erro ao excluir categoria" })
        }
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="p-0">
                <CardContent {...attributes} {...listeners} className="relative cursor-grab active:cursor-grabbing flex flex-col gap-4 p-4">
                    <p className="font-semibold text-sm">{category.name}</p>
                    <p className="font-semibold text-sm">{category.slug}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                    <div className="flex gap-2">
                        <p className="text-xs">Cor: #{category.color || '000000'}</p>
                        <div className="rounded-full w-4 h-4" style={{ backgroundColor: category?.color }}></div>
                    </div>
                    {category.iconUrl && (
                        <img loading="lazy" src={category.iconUrl} alt="ícone" className="w-20 h-20 object-contain" />
                    )}
                </CardContent>
                <CardFooter className="flex justify-between bg-[rgba(245,245,245)] py-2">
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Edit3 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Editar categoria</AlertDialogTitle>
                                </AlertDialogHeader>

                                <div className="flex flex-col gap-3">
                                    <Input
                                        placeholder="Nome"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Slug"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Descrição"
                                        value={form.description || ""}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                    <div className="flex gap-4 ms-2 items-center">
                                        <label>Destaque?</label>
                                        <Input
                                            type="checkbox"
                                            checked={form.isFeatured}
                                            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                            className="w-4 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex ms-3 items-center gap-2">
                                        <label className="text-gray-600 text-sm">Cor</label>
                                        <Input
                                            className="w-[60px] cursor-pointer"
                                            type="color"
                                            value={form.color}
                                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        />
                                    </div>
                                    <LabelInputFile
                                        id={`update-cover-${category.id}`}
                                        label="Atualizar imagem"
                                        accept="image/*"
                                        onChange={(file) => setForm({ ...form, file })}
                                    />
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
                                    <AlertDialogTitle>Deseja realmente excluir?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <p className="text-sm text-muted-foreground mb-4">{category.name}</p>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}