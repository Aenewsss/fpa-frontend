import { create } from "zustand"
import * as postsService from "@/services/posts"
import * as bannersService from "@/services/banners"
import * as authorsService from "@/services/authors"
import * as videosService from "@/services/videos"
import * as webstoriesService from "@/services/webstories"
import * as categoriesService from "@/services/categories"
import * as tagsService from "@/services/tags"
import * as relevantsService from "@/services/relevants"
import { DashboardContentOverview, DashboardMonthlySummary, DashboardTotalCounts, getDashboardContentOverview, getDashboardMonthlySummary, getDashboardTotalCounts } from "@/services/dashboard"
import { createMagazine, getMagazine } from "@/services/magazine"

interface ContentState {
  loading: boolean

  // magazine
  magazineUrl: string
  magazinePreviewUrl: string
  fetchMagazineUrl: () => Promise<void>
  createMagazine: (data: any) => Promise<void>

  // Posts state
  posts: postsService.Post[]
  postsFeature: postsService.Post[]
  postsCategoryFeatured: postsService.PostFeatured
  currentPost: postsService.Post | null
  postsLoading: boolean
  postsError: string | null
  postsPagination: {
    total: number
    page: number
    limit: number
  }
  currentPostFiles: File[]
  mostViewed: postsService.Post[]
  hasMore: boolean

  // Banners state
  banners: bannersService.Banner[]
  bannersLoading: boolean
  bannersError: string | null

  // Banners state
  authors: authorsService.Author[]
  authorsLoading: boolean
  authorsError: string | null

  // Videos state
  videos: videosService.Video[]
  videosLoading: boolean
  videosError: string | null

  // Web Stories state
  webstories: webstoriesService.WebStory[]
  webstoriesLoading: boolean
  webstoriesError: string | null
  webstoriesPagination: {
    total: number
    page: number
    limit: number
  }

  // Relevants state
  setFileUploadProgress: (fileUploadProgress: number) => void
  fileUploadProgress: number
  relevants: relevantsService.Relevant[]
  relevantsLoading: boolean
  relevantsError: string | null
  relevantsPagination: {
    total: number
    page: number
    limit: number
  }

  // Categories state
  currentCategory: categoriesService.Category | null
  categories: categoriesService.Category[]
  categoriesTree: categoriesService.Category[]
  categoriesLoading: boolean
  categoriesError: string | null

  // Tags state
  tags: tagsService.Tag[]
  popularTags: tagsService.Tag[]
  tagsLoading: boolean
  tagsError: string | null

  summaryLoading: boolean
  summary: DashboardMonthlySummary | null
  fetchSummary: () => Promise<void>
  summaryError: string | null

  contentOverviewLoading: boolean
  contentOverview: DashboardContentOverview | null
  fetchContentOverview: () => Promise<void>
  contentOverviewError: string | null

  totalCountsLoading: boolean
  totalCounts: DashboardTotalCounts | null
  fetchTotalCounts: () => Promise<void>
  totalCountsError: string | null

  // Posts actions
  fetchPosts: (params?: postsService.IPostParam) => Promise<void>
  fetchPostsFeatured: () => Promise<void>
  fetchPostsCategoryFeatured: () => Promise<void>
  fetchPost: (id: string) => Promise<void>
  createPost: (data: postsService.CreatePostData) => Promise<void>
  updatePost: (id: string, data: postsService.CreatePostData) => Promise<void>
  deletePost: (id: string) => Promise<void>
  uploadPostImage: (file: File) => Promise<string>
  pushCurrentPostFiles: (file: File) => void
  incrementView: (id: string) => Promise<void>
  fetchMostViewed: () => Promise<void>

  // Authors actions
  fetchAuthors: () => Promise<void>
  createAuthor: (data: FormData) => Promise<void>
  deleteAuthor: (id: string) => Promise<void>

  // Banners actions
  fetchBanners: () => Promise<void>
  createBanner: (data: FormData) => Promise<void>
  updateBanner: (id: string, data: FormData) => Promise<void>
  deleteBanner: (id: string) => Promise<void>
  reorderBanners: (id: string, newIndex: number) => Promise<void>
  uploadBannerImage: (file: File) => Promise<string>

  // Videos actions
  fetchVideos: () => Promise<void>
  createVideo: (data: FormData) => Promise<void>
  deleteVideo: (id: string) => Promise<void>

  // Web Stories actions
  fetchWebStories: (params?: any) => Promise<void>
  createWebStory: (data: webstoriesService.CreateWebStoryData) => Promise<void>
  updateWebStory: (data: webstoriesService.UpdateWebStoryData) => Promise<void>
  deleteWebStory: (id: string) => Promise<void>
  uploadWebStoryVideo: (
    file: File,
    onProgress?: (fileUploadProgress: number) => void,
  ) => Promise<{ url: string; duration: number }>
  uploadWebStoryCover: (file: File) => Promise<string>
  reorderWebstories: (id: string, newIndex: number) => Promise<void>

  // Relevant actions
  fetchRelevants: (params?: any) => Promise<void>
  createRelevant: (data: relevantsService.CreateRelevantData) => Promise<void>
  updateRelevant: (data: relevantsService.UpdateRelevantData) => Promise<void>
  deleteRelevant: (id: string) => Promise<void>
  uploadRelevantVideo: (
    file: File,
    onProgress?: (fileUploadProgress: number) => void,
  ) => Promise<{ url: string; duration: number }>
  uploadRelevantCover: (file: File) => Promise<string>
  reorderRelevants: (id: string, newIndex: number) => Promise<void>

  // Categories actions
  fetchCategory: (id: string) => Promise<void>
  fetchCategories: (params?: any) => Promise<void>
  fetchCategoriesTree: () => Promise<void>
  createCategory: (data: categoriesService.CreateCategoryData) => Promise<void>
  updateCategory: (data: categoriesService.UpdateCategoryData) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  reorderCategories: (id: string, newIndex: number) => Promise<void>

  // Tags actions
  fetchTags: (params?: any) => Promise<void>
  fetchPopularTags: (limit?: number) => Promise<void>
  searchTags: (query: string) => Promise<tagsService.Tag[]>
  createTag: (data: tagsService.CreateTagData) => Promise<void>
  updateTag: (data: tagsService.UpdateTagData) => Promise<void>
  deleteTag: (id: string) => Promise<void>

  // Utility actions
  clearErrors: () => void

  setLoading: (isLoading: boolean) => void,
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  loading: false,

  magazineUrl: '',
  posts: [],
  postsFeature: [],
  postsCategoryFeatured: {
    categories: [],
    postsByCategory: {}
  },
  currentPost: null,
  postsLoading: false,
  postsError: null,
  postsPagination: { total: 0, page: 1, limit: 10 },
  currentPostFiles: [],
  mostViewed: [],
  hasMore: false,

  banners: [],
  bannersLoading: false,
  bannersError: null,

  authors: [],
  authorsLoading: false,
  authorsError: null,

  videos: [],
  videosLoading: false,
  videosError: null,

  webstories: [],
  webstoriesLoading: false,
  webstoriesError: null,
  webstoriesPagination: { total: 0, page: 1, limit: 10 },

  fileUploadProgress: 0,
  relevants: [],
  relevantsLoading: false,
  relevantsError: null,
  relevantsPagination: { total: 0, page: 1, limit: 10 },

  currentCategory: null,
  categories: [],
  categoriesTree: [],
  categoriesLoading: false,
  categoriesError: null,

  tags: [],
  popularTags: [],
  tagsLoading: false,
  tagsError: null,

  summaryLoading: false,
  summary: null,
  summaryError: null,
  magazinePreviewUrl: "",

  fetchMagazineUrl: async () => {
    try {
      const data = await getMagazine()
      set({ magazineUrl: data.pdfUrl, magazinePreviewUrl: data.previewUrl })
    } catch (error) {
      console.error('Failed to fetch magazine URL:', error)
    }
  },

  createMagazine: async (file: File) => {
    try {

      const form = new FormData()
      form.append("file", file)
      const result = await createMagazine(form)
      set({ magazineUrl: result.pdfUrl || '' })
    } catch (error) {
      console.error('Failed to create magazine:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  fetchSummary: async () => {
    set({ summaryLoading: true, summaryError: null })
    try {
      const data = await getDashboardMonthlySummary()
      set({ summary: data, summaryLoading: false })
    } catch (error: any) {
      set({
        summaryLoading: false,
        summaryError: error?.response?.data?.message || "Failed to fetch dashboard summary.",
      })
    }
  },

  contentOverviewLoading: false,
  contentOverview: null,
  contentOverviewError: null,

  fetchContentOverview: async () => {
    set({ contentOverviewLoading: true, contentOverviewError: null })
    try {
      const data = await getDashboardContentOverview()
      set({ contentOverview: data, contentOverviewLoading: false })
    } catch (error: any) {
      set({
        contentOverviewLoading: false,
        contentOverviewError: error?.response?.data?.message || "Failed to fetch dashboard content Overview.",
      })
    }
  },

  totalCountsLoading: false,
  totalCounts: null,
  totalCountsError: null,

  fetchTotalCounts: async () => {
    set({ totalCountsLoading: true, totalCountsError: null })
    try {
      const data = await getDashboardTotalCounts()
      set({ totalCounts: data, totalCountsLoading: false })
    } catch (error: any) {
      set({
        totalCountsLoading: false,
        totalCountsError: error?.response?.data?.message || "Failed to fetch dashboard content Overview.",
      })
    }
  },

  // Posts actions
  fetchPosts: async (params) => {
    set({ postsLoading: !params?.loadMore, postsError: null })
    try {
      const response = await postsService.getPosts(params)
      set({
        posts: params?.page ? [...get().posts, ...response] : response,
        postsLoading: false,
        postsPagination: params ? { ...get().postsPagination, page: params.page || 1, limit: params.limit || 10 } : get().postsPagination,
        hasMore: (params?.loadMore && (response.length == 0 || ((params?.limit || 10) > response.length))) ? false : true
      })
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to fetch posts",
      })
    }
  },

  fetchPostsFeatured: async () => {
    set({ postsLoading: true, postsError: null })
    try {
      const response = await postsService.getPostsFeatured()
      set({
        postsFeature: response,
        postsLoading: false,
      })
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to fetch posts",
      })
    }
  },

  fetchPostsCategoryFeatured: async () => {
    set({ postsLoading: true, postsError: null })
    try {
      const response = await postsService.getPostsCategoryFeatured()
      set({
        postsCategoryFeatured: response,
        postsLoading: false,
      })
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to fetch posts",
      })
    }
  },

  fetchPost: async (id: string) => {
    set({ postsLoading: true, postsError: null })
    try {
      const post = await postsService.getPost(id)
      set({ currentPost: post, postsLoading: false })
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to fetch post",
      })
    }
  },

  createPost: async (data) => {
    set({ postsLoading: true, postsError: null })
    try {
      const form = new FormData()
      form.append("postTitle", data.postTitle)
      form.append("articleAuthorId", data.articleAuthorId)
      form.append("postCategoryId", data.postCategoryId)
      form.append("postStatus", data.postStatus)
      form.append("isFeatured", data.isFeatured ? 'true' : 'false')
      form.append("slug", data.slug || '')
      form.append("summary", data.summary || '')
      form.append("postContent", JSON.stringify(data.postContent))
      data.files?.forEach((file: File) => {
        form.append("files", file)
      })
      if (data.thumbnailFile) form.append("thumbnailFile", data.thumbnailFile)

      const newPost = await postsService.createPost(form)
      set((state) => ({
        posts: [newPost, ...state.posts],
        postsLoading: false,
      }))
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to create post",
      })
      throw error
    }
  },

  updatePost: async (id: string, data) => {
    set({ postsLoading: true, postsError: null })
    try {
      const form = new FormData()
      data.postTitle && form.append("postTitle", data.postTitle)
      data.postCategoryId && form.append("postCategoryId", data.postCategoryId)
      data.postStatus && form.append("postStatus", data.postStatus)
      form.append("isFeatured", data.isFeatured ? "true" : "false")
      form.append("slug", data.slug || "")
      form.append("summary", data.summary || "")
      form.append("postContent", JSON.stringify(data.postContent))

      data.files?.forEach((file: File) => {
        form.append("files", file)
      })

      if (data.thumbnailFile) {
        form.append("thumbnailFile", data.thumbnailFile)
      }

      const updatedPost = await postsService.updatePost(id, form)

      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
        postsLoading: false,
      }))
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to update post",
      })
      throw error
    }
  },

  deletePost: async (id: string) => {
    set({ postsLoading: true, postsError: null })
    try {
      await postsService.deletePost(id)
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
        postsLoading: false,
      }))
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to delete post",
      })
      throw error
    }
  },

  incrementView: async (id: string) => {
    set({ postsLoading: true, postsError: null })
    try {
      await postsService.incrementView(id)
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to delete post",
      })
      throw error
    }
  },

  fetchMostViewed: async () => {
    set({ postsLoading: true, postsError: null })
    try {
      const response = await postsService.getMostViewed()
      set({
        mostViewed: response,
        postsLoading: false,
      })
    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.response?.data?.message || "Failed to fetch posts",
      })
    }
  },

  uploadPostImage: async (file: File) => {
    try {
      const response = await postsService.uploadPostImage(file)
      return response.url
    } catch (error: any) {
      set({ postsError: error.response?.data?.message || "Failed to upload image" })
      throw error
    }
  },

  pushCurrentPostFiles: (file: File) => {
    set(state => ({ currentPostFiles: [...state.currentPostFiles, file] }))
  },

  // Authors actions
  fetchAuthors: async () => {
    set({ authorsLoading: true, authorsError: null })
    try {
      const authors = await authorsService.getAuthors()
      set({ authors, authorsLoading: false })
    } catch (error: any) {
      set({
        authorsLoading: false,
        authorsError: error.response?.data?.message || "Failed to fetch authors",
      })
    }
  },

  deleteAuthor: async (id: string) => {
    set({ authorsLoading: true, authorsError: null })
    try {
      await authorsService.deleteAuthor(id)
      set((state) => ({
        authors: state.authors.filter((author) => author.id !== id),
        authorsLoading: false,
      }))
    } catch (error: any) {
      set({
        authorsLoading: false,
        authorsError: error.response?.data?.message || "Failed to delete author",
      })
      throw error
    }
  },

  createAuthor: async (data) => {
    set({ authorsLoading: true, authorsError: null })
    try {
      const newAuthor = await authorsService.createAuthor(data)
      set((state) => ({
        authors: [...state.authors, newAuthor],
        authorsLoading: false,
      }))
    } catch (error: any) {
      set({
        authorsLoading: false,
        authorsError: error.response?.data?.message || "Failed to create author",
      })
      throw error
    }
  },


  // Banners actions
  fetchBanners: async () => {
    set({ bannersLoading: true, bannersError: null })
    try {
      const banners = await bannersService.getBanners()
      set({ banners, bannersLoading: false })
    } catch (error: any) {
      set({
        bannersLoading: false,
        bannersError: error.response?.data?.message || "Failed to fetch banners",
      })
    }
  },

  createBanner: async (data) => {
    set({ bannersLoading: true, bannersError: null })
    try {
      const newBanner = await bannersService.createBanner(data)
      set((state) => ({
        banners: [...state.banners, newBanner],
        bannersLoading: false,
      }))
    } catch (error: any) {
      set({
        bannersLoading: false,
        bannersError: error.response?.data?.message || "Failed to create banner",
      })
      throw error
    }
  },

  updateBanner: async (id, data) => {
    set({ bannersLoading: true, bannersError: null })
    try {
      const updatedBanner = await bannersService.updateBanner(id, data)
      set((state) => ({
        banners: state.banners.map((banner) => (banner.id === id ? updatedBanner : banner)),
        bannersLoading: false,
      }))
    } catch (error: any) {
      set({
        bannersLoading: false,
        bannersError: error.response?.data?.message || "Failed to update banner",
      })
      throw error
    }
  },

  deleteBanner: async (id: string) => {
    set({ bannersLoading: true, bannersError: null })
    try {
      await bannersService.deleteBanner(id)
      set((state) => ({
        banners: state.banners.filter((banner) => banner.id !== id),
        bannersLoading: false,
      }))
    } catch (error: any) {
      set({
        bannersLoading: false,
        bannersError: error.response?.data?.message || "Failed to delete banner",
      })
      throw error
    }
  },

  reorderBanners: async (id: string, newIndex: number) => {
    set({ bannersLoading: true, bannersError: null })
    try {
      await bannersService.reorderBanners(id, newIndex)
      // Reorder banners in state to match the new order
      const { banners } = get()
      // const reorderedBanners = bannerIds.map((id) => banners.find((banner) => banner.id === id)!).filter(Boolean)
      // set({ banners: reorderedBanners, bannersLoading: false })
    } catch (error: any) {
      set({
        bannersLoading: false,
        bannersError: error.response?.data?.message || "Failed to reorder banners",
      })
      throw error
    }
  },

  uploadBannerImage: async (file: File) => {
    try {
      const response = await bannersService.uploadBannerImage(file)
      return response.url
    } catch (error: any) {
      set({ bannersError: error.response?.data?.message || "Failed to upload banner image" })
      throw error
    }
  },


  // Videos actions
  fetchVideos: async () => {
    set({ videosLoading: true, videosError: null })
    try {
      const videos = await videosService.getVideos()
      set({ videos, videosLoading: false })
    } catch (error: any) {
      set({
        videosLoading: false,
        videosError: error.response?.data?.message || "Failed to fetch videos",
      })
    }
  },

  createVideo: async (data) => {
    set({ videosLoading: true, videosError: null })
    try {
      const newVideo = await videosService.createVideo(data)
      set((state) => ({
        videos: [...state.videos, newVideo],
        videosLoading: false,
      }))
    } catch (error: any) {
      set({
        videosLoading: false,
        videosError: error.response?.data?.message || "Failed to create video",
      })
      throw error
    }
  },

  deleteVideo: async (id: string) => {
    set({ videosLoading: true, videosError: null })
    try {
      await videosService.deleteVideo(id)
      set((state) => ({
        videos: state.videos.filter((video) => video.id !== id),
        videosLoading: false,
      }))
    } catch (error: any) {
      set({
        videosLoading: false,
        videosError: error.response?.data?.message || "Failed to delete video",
      })
      throw error
    }
  },

  // Web Stories actions
  fetchWebStories: async (params) => {
    set({ webstoriesLoading: true, webstoriesError: null })
    try {
      const response = await webstoriesService.getWebStories(params)
      set({
        webstories: response,
        webstoriesLoading: false,
      })
    } catch (error: any) {
      set({
        webstoriesLoading: false,
        webstoriesError: error.response?.data?.message || "Failed to fetch web stories",
      })
    }
  },

  createWebStory: async (data) => {
    set({ webstoriesLoading: true, webstoriesError: null })

    const formData = new FormData()
    formData.append("title", data.title);
    if (data.description) {
      formData.append("description", data.description);
    }

    data.slides.forEach((slide, index) => {
      formData.append("slides", slide.file); // ✅ arquivo de imagem
      if (slide.text) {
        formData.append(`slideTexts[${index}]`, slide.text); // ✅ texto individual do slide
      }
    });

    try {
      const newWebStory = await webstoriesService.createWebStory(formData)
      set((state) => ({
        webstories: [newWebStory, ...state.webstories],
        webstoriesLoading: false,
      }))
    } catch (error: any) {
      set({
        webstoriesLoading: false,
        webstoriesError: error.response?.data?.message || "Failed to create web story",
      })
      throw error
    }
  },

  updateWebStory: async (data) => {
    set({ webstoriesLoading: true, webstoriesError: null })
    try {

      const formData = new FormData()

      data.title && formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }

      data.slides && data.slides.forEach((slide, index) => {
        slide.file && formData.append("slides", slide.file); // ✅ arquivo de imagem
        if (slide.text) {
          formData.append(`slideTexts[${index}]`, slide.text); // ✅ texto individual do slide
        }
      });

      const updatedWebStory = await webstoriesService.updateWebStory(data.id, formData)
      set((state) => ({
        webstories: state.webstories.map((story) => (story.id === data.id ? updatedWebStory : story)),
        webstoriesLoading: false,
      }))
    } catch (error: any) {
      set({
        webstoriesLoading: false,
        webstoriesError: error.response?.data?.message || "Failed to update web story",
      })
      throw error
    }
  },

  deleteWebStory: async (id: string) => {
    set({ webstoriesLoading: true, webstoriesError: null })
    try {
      await webstoriesService.deleteWebStory(id)
      set((state) => ({
        webstories: state.webstories.filter((story) => story.id !== id),
        webstoriesLoading: false,
      }))
    } catch (error: any) {
      set({
        webstoriesLoading: false,
        webstoriesError: error.response?.data?.message || "Failed to delete web story",
      })
      throw error
    }
  },

  uploadWebStoryVideo: async (file: File, onProgress) => {
    try {
      return await webstoriesService.uploadWebStoryVideo(file, onProgress)
    } catch (error: any) {
      set({ webstoriesError: error.response?.data?.message || "Failed to upload video" })
      throw error
    }
  },

  uploadWebStoryCover: async (file: File) => {
    try {
      const response = await webstoriesService.uploadWebStoryCover(file)
      return response.url
    } catch (error: any) {
      set({ webstoriesError: error.response?.data?.message || "Failed to upload cover image" })
      throw error
    }
  },
  reorderWebstories: async (id: string, newIndex: number) => {
    await webstoriesService.reorderWebstories(id, newIndex)
    const data = await webstoriesService.getWebStories()
    set({ webstories: data })
  },

  // Relevant actions
  fetchRelevants: async (params) => {
    set({ relevantsLoading: true, relevantsError: null })
    try {
      const response = await relevantsService.getRelevants(params)
      set({
        relevants: response,
        relevantsLoading: false,
      })
    } catch (error: any) {
      set({
        relevantsLoading: false,
        relevantsError: error.response?.data?.message || "Failed to fetch web stories",
      })
    }
  },

  setFileUploadProgress: (data) => {
    set({ fileUploadProgress: data })
  },

  createRelevant: async (data: any) => {
    set({ relevantsLoading: true, relevantsError: null, loading: true })

    try {
      const newRelevant = await relevantsService.createRelevant(data)
      set((state) => ({
        relevants: [newRelevant, ...state.relevants],
        relevantsLoading: false,
      }))
    } catch (error: any) {
      set({
        relevantsLoading: false,
        relevantsError: error.response?.data?.message || "Failed to create web story",
      })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateRelevant: async (data) => {
    set({ relevantsLoading: true, relevantsError: null })
    try {
      const updatedRelevant = await relevantsService.updateRelevant(data)
      set((state) => ({
        relevants: state.relevants.map((story) => (story.id === data.id ? updatedRelevant : story)),
        relevantsLoading: false,
      }))
    } catch (error: any) {
      set({
        relevantsLoading: false,
        relevantsError: error.response?.data?.message || "Failed to update web story",
      })
      throw error
    }
  },

  deleteRelevant: async (id: string) => {
    set({ relevantsLoading: true, relevantsError: null })
    try {
      await relevantsService.deleteRelevant(id)
      set((state) => ({
        relevants: state.relevants.filter((story) => story.id !== id),
        relevantsLoading: false,
      }))
    } catch (error: any) {
      set({
        relevantsLoading: false,
        relevantsError: error.response?.data?.message || "Failed to delete web story",
      })
      throw error
    }
  },

  uploadRelevantVideo: async (file: File, onProgress) => {
    try {
      return await relevantsService.uploadRelevantVideo(file, onProgress)
    } catch (error: any) {
      set({ relevantsError: error.response?.data?.message || "Failed to upload video" })
      throw error
    }
  },

  uploadRelevantCover: async (file: File) => {
    try {
      const response = await relevantsService.uploadRelevantCover(file)
      return response.url
    } catch (error: any) {
      set({ relevantsError: error.response?.data?.message || "Failed to upload cover image" })
      throw error
    }
  },
  reorderRelevants: async (id: string, newIndex: number) => {
    await relevantsService.reorderRelevants(id, newIndex)
    const data = await relevantsService.getRelevants()
    set({ relevants: data })
  },

  // Categories actions
  fetchCategory: async (id: string) => {
    set({ categoriesLoading: true, categoriesError: null })
    try {
      const response = await categoriesService.getCategory(id)
      set({ currentCategory: response, categoriesLoading: false })
    } catch (error: any) {
      set({
        categoriesLoading: false,
        categoriesError: error.response?.data?.message || "Failed to fetch categories",
      })
    }
  },
  fetchCategories: async (params) => {
    set({ categoriesLoading: true, categoriesError: null })
    try {
      const response = await categoriesService.getCategories(params)
      set({ categories: response, categoriesLoading: false })
    } catch (error: any) {
      set({
        categoriesLoading: false,
        categoriesError: error.response?.data?.message || "Failed to fetch categories",
      })
    }
  },

  fetchCategoriesTree: async () => {
    set({ categoriesLoading: true, categoriesError: null })
    try {
      const categoriesTree = await categoriesService.getCategoriesTree()
      set({ categoriesTree, categoriesLoading: false })
    } catch (error: any) {
      set({
        categoriesLoading: false,
        categoriesError: error.response?.data?.message || "Failed to fetch categories tree",
      })
    }
  },

  createCategory: async (data) => {
    set({ categoriesLoading: true, categoriesError: null })
    try {

      const form = new FormData()
      form.append("name", data.name)
      form.append("description", data.description || "")
      form.append("slug", data.slug)

      if (data.color) form.append("color", data.color)
      if (data.isFeatured) form.append("isFeatured", data.isFeatured.toString())
      if (data.file) form.append("file", data.file)

      const newCategory = await categoriesService.createCategory(form)
      set((state) => ({
        categories: [...state.categories, newCategory],
        categoriesLoading: false,
      }))
    } catch (error: any) {
      set({
        categoriesLoading: false,
        categoriesError: error.response?.data?.message || "Failed to create category",
      })
      throw error
    }
  },

  updateCategory: async (data) => {
    set({ categoriesLoading: true, categoriesError: null })
    try {
      const updatedCategory = await categoriesService.updateCategory(data)
      set((state) => ({
        categories: state.categories.map((category) => (category.id === data.id ? updatedCategory : category)),
        categoriesLoading: false,
      }))
    } catch (error: any) {
      set({
        categoriesLoading: false,
        categoriesError: error.response?.data?.message || "Failed to update category",
      })
      throw error
    }
  },

  deleteCategory: async (id: string) => {
    set({ categoriesLoading: true, categoriesError: null })
    try {
      await categoriesService.deleteCategory(id)
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        categoriesLoading: false,
      }))
    } catch (error: any) {
      set({
        categoriesLoading: false,
        categoriesError: error.response?.data?.message || "Failed to delete category",
      })
      throw error
    }
  },
  reorderCategories: async (id: string, newIndex: number) => {
    await categoriesService.reorderCategories(id, newIndex)
    const data = await categoriesService.getCategories()
    set({ categories: data })
  },

  // Tags actions
  fetchTags: async (params) => {
    set({ tagsLoading: true, tagsError: null })
    try {
      const response = await tagsService.getTags(params)
      set({ tags: response, tagsLoading: false })
    } catch (error: any) {
      set({
        tagsLoading: false,
        tagsError: error.response?.data?.message || "Failed to fetch tags",
      })
    }
  },

  fetchPopularTags: async (limit) => {
    set({ tagsLoading: true, tagsError: null })
    try {
      const popularTags = await tagsService.getPopularTags(limit)
      set({ popularTags, tagsLoading: false })
    } catch (error: any) {
      set({
        tagsLoading: false,
        tagsError: error.response?.data?.message || "Failed to fetch popular tags",
      })
    }
  },

  searchTags: async (query: string) => {
    try {
      return await tagsService.searchTags(query)
    } catch (error: any) {
      set({ tagsError: error.response?.data?.message || "Failed to search tags" })
      throw error
    }
  },

  createTag: async (data) => {
    set({ tagsLoading: true, tagsError: null })
    try {
      const newTag = await tagsService.createTag(data)
      set((state) => ({
        tags: [...state.tags, newTag],
        tagsLoading: false,
      }))
    } catch (error: any) {
      set({
        tagsLoading: false,
        tagsError: error.response?.data?.message || "Failed to create tag",
      })
      throw error
    }
  },

  updateTag: async (data) => {
    set({ tagsLoading: true, tagsError: null })
    try {
      const updatedTag = await tagsService.updateTag(data)
      set((state) => ({
        tags: state.tags.map((tag) => (tag.id === data.id ? updatedTag : tag)),
        tagsLoading: false,
      }))
    } catch (error: any) {
      set({
        tagsLoading: false,
        tagsError: error.response?.data?.message || "Failed to update tag",
      })
      throw error
    }
  },

  deleteTag: async (id: string) => {
    set({ tagsLoading: true, tagsError: null })
    try {
      await tagsService.deleteTag(id)
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
        tagsLoading: false,
      }))
    } catch (error: any) {
      set({
        tagsLoading: false,
        tagsError: error.response?.data?.message || "Failed to delete tag",
      })
      throw error
    }
  },

  // Utility actions
  clearErrors: () =>
    set({
      postsError: null,
      bannersError: null,
      webstoriesError: null,
      categoriesError: null,
      tagsError: null,
    }),

  setLoading: (loading) => {
    set({ loading })
  },
}))
