"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/services/axios"
import { showToast } from "@/utils/show-toast"
import { ToastContainer } from "react-toastify"

export default function AcceptInvitePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const invitationToken = searchParams.get("invitationToken") // ?token=...

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== repeatPassword) {
            showToast({ children: "As senhas não coincidem!" })
            return
        }

        setIsSubmitting(true)
        try {
            await api.post("/auth/invite/accept", {
                invitationToken,
                firstName,
                lastName,
                password,
                repeatPassword,
            }).catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {
                    throw new Error(error.response.data.message)
                } else {
                    throw new Error("Erro ao aceitar convite. Tente novamente.")
                }
            })

            showToast({ children: "Convite aceito com sucesso! Você já pode fazer login." })

            setTimeout(() => {
                router.push("/login")
            }, 1000);
        } catch (err: any) {
            console.error(err)
            showToast({ children: err.message, type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <Card className="shadow-2xl border-0 bg-white">
                    <CardHeader className="text-center pb-6">
                        <div
                            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: "#1C9658" }}
                        >
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl font-bold text-black">Aceitar Convite</CardTitle>
                        <CardDescription className="text-gray-600 mt-2">
                            Complete seus dados e defina sua senha para ativar sua conta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-black font-medium">Nome</label>
                                <Input
                                    type="text"
                                    placeholder="Seu primeiro nome"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#1C9658]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-black font-medium">Sobrenome</label>
                                <Input
                                    type="text"
                                    placeholder="Seu sobrenome"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#1C9658]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-black font-medium">Senha</label>
                                <Input
                                    type="password"
                                    placeholder="Crie uma senha forte"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#1C9658]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-black font-medium">Repetir Senha</label>
                                <Input
                                    type="password"
                                    placeholder="Repita sua senha"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#1C9658]"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                style={{ backgroundColor: "#1C9658" }}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Ativando conta...
                                    </div>
                                ) : (
                                    "Ativar Conta"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer />
        </div>
    )
}