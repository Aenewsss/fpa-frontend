"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { DashboardLayout } from "@/components/dashboard-layout"

import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Loading from "../loading"
import Script from "next/script"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isLoggedIn, user, isLoading, verifySession } = useAuthStore()

  useEffect(() => {
    verifySession()
  }, [router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render admin content if not authorized
  if (!isLoggedIn || !user || (!user.role || user?.role === "READER")) {
    return null
  }

  return <main>
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=G-K56PQX18ME"
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-K56PQX18ME');
        `}
    </Script>
    <div className="flex gap-4">
      <DashboardLayout />
      <div className="mt-20 w-full">
        {children}
      </div>
    </div>
    <ToastContainer position="top-right" autoClose={false} />
    <Loading />
  </main>
}
