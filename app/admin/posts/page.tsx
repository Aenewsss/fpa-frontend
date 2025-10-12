"use client"

import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2, Edit3 } from "lucide-react"
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
import { LabelInputFile } from "@/components/ui/label-input-file"
import { PostStatusEnum } from "@/enums/post"
import { CreatePostData } from "@/services/posts"
import { MultiSelect } from "@/components/ui/multi-select"
import { TipTapEditor } from "./tiptap-editor"
import { useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { showToast } from "@/utils/show-toast"
import ViewPost from "./view-post"

const formInitialState: CreatePostData = {
  postTitle: "",
  postCategoryId: "",
  postContent: {},
  postStatus: PostStatusEnum.DRAFT,
  summary: "",
  relatedTags: [],
  slug: "",
  thumbnailFile: null,
  files: [],
  isFeatured: false,
}

export default function PostsAdminPage() {
  const [form, setForm] = useState<CreatePostData>(formInitialState)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const {
    posts,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    fetchTags,
    tags,
    fetchCategories,
    categories,
    pushCurrentPostFiles,
    currentPostFiles,
    setLoading,
  } = useContentStore()

  const [orderedPosts, setOrderedPosts] = useState<any[]>([])

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: (file, progress, signal) =>
          handleImageUpload(file, progress, signal, pushCurrentPostFiles),
      }),
    ],
  })

  useEffect(() => {
    fetchPosts({ limit: 100 })
    fetchTags()
    fetchCategories()
  }, [])

  useEffect(() => {
    setOrderedPosts(posts)
  }, [posts])

  // 🟢 Create or update post
  const handleSave = async () => {
    setLoading(true)
    const payload = {
      ...form,
      postContent: editor?.getJSON() || {},
      files: currentPostFiles,
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, payload)
        showToast({ type: "success", children: "Matéria atualizada com sucesso!" })
      } else {
        await createPost(payload)
        showToast({ type: "success", children: "Matéria criada com sucesso!" })
      }
      setForm(formInitialState)
      setEditingPost(null)
      fetchPosts()
    } catch (err) {
      console.error(err)
      showToast({ type: "error", children: "Erro ao salvar matéria" })
    } finally {
      setLoading(false)
    }
  }

  // 🟡 Load data for editing
  const handleEdit = (post: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setEditingPost(post)
    setForm({
      ...formInitialState,
      postTitle: post.postTitle,
      postCategoryId: post.postCategoryId,
      postContent: post.postContent,
      postStatus: post.postStatus,
      summary: post.summary,
      relatedTags: post.relatedTags?.map((t: any) => t.id) || [],
      slug: post.slug,
      thumbnailFile: null,
      isFeatured: post.isFeatured,
    })
    editor?.commands.setContent(post.postContent || {})
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {editingPost ? "Editar Matéria" : "Gerenciamento de Matérias"}
      </h1>

      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <Input
            placeholder="Título"
            value={form.postTitle}
            onChange={(e) => setForm({ ...form, postTitle: e.target.value })}
          />

          <Input
            placeholder="Resumo da matéria"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />

          <Input
            placeholder="Slug (URL amigável)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />

          <div className="flex gap-2 items-center">
            <label>Matéria em destaque?</label>
            <Input
              className="cursor-pointer"
              style={{ width: "20px", height: "20px" }}
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
          </div>

          <select
            value={form.postStatus}
            onChange={(e) => setForm({ ...form, postStatus: e.target.value as PostStatusEnum })}
            className="cursor-pointer border rounded-md px-3 py-2 text-sm text-gray-700"
          >
            <option value="">Selecionar status</option>
            <option value="draft">Rascunho</option>
            <option value="revision">Revisão</option>
            <option value="posted">Publicado</option>
            <option value="removed">Removido</option>
          </select>

          <select
            value={form.postCategoryId}
            onChange={(e) => setForm({ ...form, postCategoryId: e.target.value })}
            className="cursor-pointer border rounded-md px-3 py-2 text-sm text-gray-700"
          >
            <option value="">Selecionar categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <MultiSelect
            selected={form.relatedTags || []}
            onChange={(tags) => setForm({ ...form, relatedTags: tags })}
            options={tags.map((t) => ({ label: t.name, value: t.id }))}
          />

          <TipTapEditor editor={editor} />

          <LabelInputFile
            id="thumbnail-upload"
            label="Selecionar thumbnail"
            accept="image/*"
            onChange={(file) => setForm({ ...form, thumbnailFile: file })}
          />

          {editingPost && editingPost.thumbnailUrl && (
            <img loading="lazy"
              src={editingPost.thumbnailUrl}
              alt="thumbnail"
              className="w-40 h-40 object-cover rounded"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {editingPost && (
            <Button variant="secondary" onClick={() => setEditingPost(null)}>
              Cancelar Edição
            </Button>
          )}
          <Button onClick={handleSave}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {editingPost ? "Salvar Alterações" : "Enviar Matéria"}
          </Button>
        </CardFooter>
      </Card>

      {/* Listagem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {orderedPosts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={() => deletePost(post.id)}
            onEdit={() => handleEdit(post)}
          />
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, onDelete, onEdit }: { post: any; onDelete: () => void; onEdit: () => void }) {
  return (
    <Card className="p-0">
      <CardContent className="flex flex-col gap-4 flex-1 pt-4">
        <p className="font-semibold text-sm">{post.postTitle}</p>
        {post.thumbnailUrl && (
          <img loading="lazy" src={post.thumbnailUrl} alt="thumbnail" className="w-full h-40 object-cover rounded" />
        )}
        {post.summary && <p className="text-sm text-muted-foreground">{post.summary}</p>}
      </CardContent>
      <CardFooter className="flex justify-between bg-[rgba(245,245,245)] py-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit3 className="w-4 h-4 mr-2" />
          Editar
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  )
}