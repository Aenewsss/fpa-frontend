import { PostStatusEnum } from "@/enums/post"
import api from "./axios"
import { Category } from "./categories"

export interface PostFeatured {
  postsByCategory: { [categoryId: string]: Post[] }
  categories: Category[]
}

export interface Post {
  id: string
  postTitle: string
  postContent: string
  excerpt: string
  slug: string
  status: "draft" | "published" | "archived"
  featured_image?: string
  postAuthorId: string
  postCategoryId: string
  relatedTags: any[]
  published_at?: string
  createdAt: string
  updatedAt: string
  description: string
  summary: string
  thumbnailUrl: string
  postAuthor?: any
  postCategory?: any
  isFeatured?: boolean
}

export interface CreatePostData {
  postTitle: string
  postContent: object
  postStatus: PostStatusEnum
  postCategoryId: string
  relatedTags?: string[]
  thumbnailFile: File | null
  slug?: string
  summary: string
  files?: File[]
  isFeatured?: boolean
}

export interface PostsResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
}

export interface IPostParam {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
  currentPostId?: string
  authorId?: string
  search?: string
  loadMore?: boolean
}

// Get all posts with pagination and filters
export const getPosts = async (params?: IPostParam): Promise<Post[]> => {
  const response = await api.get("/posts", { params })
  return response.data.data
}

// Get single post by ID
export const getPost = async (id: string): Promise<Post> => {
  const response = await api.get(`/posts/${id}`)
  return response.data.data
}

// Create new post
export const createPost = async (form: FormData): Promise<Post> => {
  const response = await api.postForm("/posts", form)
  return response.data.data
}

// Update existing post
export const updatePost = async (id:string, form: FormData): Promise<Post> => {
  const response = await api.patchForm(`/posts/${id}`, form)
  return response.data.data
}

// Delete post
export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/posts/${id}`)
}

// Upload featured image
export const uploadPostImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append("image", file)

  const response = await api.post("/posts/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

// Bulk operations
export const bulkUpdatePosts = async (ids: string[], updates: Partial<Post>): Promise<void> => {
  await api.patch("/posts/bulk", { ids, updates })
}

export const bulkDeletePosts = async (ids: string[]): Promise<void> => {
  await api.delete("/posts/bulk", { data: { ids } })
}

export const getPostsFeatured = async (): Promise<Post[]> => {
  const response = await api.get("/posts/featured")
  return response.data.data
}

export const incrementView = async (id: string): Promise<Post[]> => {
  const response = await api.post(`/posts/${id}/view`)
  return response.data.data
}

export const getMostViewed = async (): Promise<Post[]> => {
  const response = await api.get(`/posts/most-viewed`)
  return response.data.data
}

export const getPostsCategoryFeatured = async (): Promise<PostFeatured> => {
  const response = await api.get("/posts/category/featured/")
  return response.data.data
}