'use client'

import { useEffect, useState } from "react"
import { createVideo, deleteVideo } from "@/services/videos"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2 } from "lucide-react"
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
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export default function VideoPage() {
    const [description, setDescription] = useState("")
    const [embed, setEmbed] = useState("")
    const [isFeatured, setIsFeatured] = useState(false)

    const { fetchVideos, videos } = useContentStore()
    const sensors = useSensors(useSensor(PointerSensor))
    const [orderedVideos, setOrderedVideos] = useState<any[]>([])

    useEffect(() => {
        fetchVideos()
    }, [])

    useEffect(() => {
        setOrderedVideos(videos)
    }, [videos])

    const handleUpload = async () => {
        if (!embed) return
        const payload = { embed, description, isFeatured }
        await createVideo(payload)
        setDescription("")
        setEmbed("")
        fetchVideos()
            window.location.reload()

    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Vídeos</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input
                        placeholder="Descrição do vídeo"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                        <label className="flex items-center space-x-2 text-sm ps-2">
                            Vídeo em destaque?
                        </label>
                        <Input
                            className="cursor-pointer"
                            style={{ width: "20px", height: "20px" }}
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                    </div>
                    <Input
                        placeholder="Embed do YouTube"
                        value={embed}
                        onChange={(e) => setEmbed(e.target.value)}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!embed || !description}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Enviar vídeo
                    </Button>
                </CardFooter>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter}>
                <SortableContext
                    items={orderedVideos.map((b) => b.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {orderedVideos.map((video: any) => (
                            <SortableCard
                                key={video.id}
                                video={video}
                                refresh={fetchVideos}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    )
}

function SortableCard({
    video,
    refresh,
}: {
    video: any
    refresh: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: video.id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const handleConfirmDelete = async () => {
        await deleteVideo(video.id)
        refresh()
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="p-0 overflow-hidden">
                <CardContent
                    {...attributes}
                    {...listeners}
                    className="relative cursor-grab active:cursor-grabbing flex flex-col gap-4"
                >
                    <p className="font-semibold text-sm">{video.description}</p>
                    {video.embed && (
                        <div
                            className="scale-95 flex justify-center"
                            dangerouslySetInnerHTML={{ __html: video.embed }}
                        />
                    )}
                </CardContent>

                <CardFooter className="flex justify-between bg-[rgba(245,245,245)] py-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                size="sm"
                                variant="destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="z-[9999999999999999]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Deseja realmente excluir esse vídeo?
                                </AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="mb-4">
                                {video.description && (
                                    <p className="mt-2 text-sm text-center text-muted-foreground">
                                        {video.description}
                                    </p>
                                )}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmDelete}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    )
}