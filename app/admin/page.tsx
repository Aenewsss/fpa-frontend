"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useContentStore } from "@/lib/content-store"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, Video, FolderTree, Users, BarChart3, TrendingUp, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { summary, fetchSummary, fetchContentOverview, contentOverview, } = useContentStore()

  const router = useRouter()

  useEffect(() => {
    // fetchPosts()
    // fetchBanners()
    // fetchWebStories()
    // fetchCategories()
    // fetchTags()
    fetchContentOverview()
    fetchSummary()
  }, [])

  const recentActivity = [
    { action: "New post published", item: "Breaking News: Tech Update", time: "2 hours ago" },
    { action: "Banner updated", item: "Homepage Hero Banner", time: "4 hours ago" },
    { action: "Web story created", item: "Sports Highlights", time: "6 hours ago" },
    { action: "Category added", item: "Technology", time: "1 day ago" },
  ]

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo(a), {user?.name || "Admin"}</h1>
          <p className="text-muted-foreground mt-1">Abaixo temos algumas métricas do mês atual.</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {user?.role === "super_admin" ? "Super Admin" : "Admin"}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ações rápidas
            </CardTitle>
            <CardDescription>Atividades comuns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => router.push("/admin/posts")} className="cursor-pointer w-full justify-start bg-transparent" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Escrever nova matéria
            </Button>
            <Button onClick={() => router.push("/admin/banners")} className="cursor-pointer w-full justify-start bg-transparent" variant="outline">
              <ImageIcon className="mr-2 h-4 w-4" />
              Gerenciar banners
            </Button>
            <Button onClick={() => router.push("/admin/webstories")} className="cursor-pointer w-full justify-start bg-transparent" variant="outline">
              <Video className="mr-2 h-4 w-4" />
              Adicionar Web Story
            </Button>
            <Button onClick={() => router.push("/admin/users")} className="cursor-pointer w-full justify-start bg-transparent" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gerenciamento de usuários
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Content Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visão geral
          </CardTitle>
          <CardDescription>Summary of your content management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Matérias publicadas</span>
                <span className="text-sm font-medium">{contentOverview?.totalPublishedPosts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Matérias em rascunho</span>
                <span className="text-sm font-medium">{contentOverview?.totalDraftPosts || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Banners ativos</span>
                <span className="text-sm font-medium">{contentOverview?.activeBanners || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tags</span>
                <span className="text-sm font-medium">{contentOverview?.totalTags || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Web Stories</span>
                <span className="text-sm font-medium">{contentOverview?.webStories || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categorias</span>
                <span className="text-sm font-medium">{contentOverview?.totalCategories || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
