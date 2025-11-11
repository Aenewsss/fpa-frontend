'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Edit3, Loader2, Trash2 } from "lucide-react"
import { ToastContainer } from "react-toastify"
import { showToast } from "@/utils/show-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { deleteUser, getUsers, updateUser } from "@/services/users"

enum UserRoleEnum {
    ADMIN = 'ADMIN',
    MAIN_EDITOR = 'MAIN_EDITOR',
    EDITOR = 'EDITOR',
    READER = 'READER',
}

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])

    const fetchUsers = async () => {
        try {
            const response = await getUsers()
            setUsers(response)
        } catch (err) {
            console.error("Erro ao buscar usuários", err)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento de Usuários</h1>

            {/* Lista de usuários */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {users.map((user) => (
                    <UserCard key={user.id} user={user} refresh={fetchUsers} />
                ))}
            </div>

            <ToastContainer />
        </div>
    )
}

function UserCard({ user, refresh }: { user: any; refresh: () => void }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [firstName, setFirstName] = useState(user.firstName)
    const [lastName, setLastName] = useState(user.lastName)
    const [email, setEmail] = useState(user.email)
    const [role, setRole] = useState<UserRoleEnum>(user.role)

    const handleUpdate = async () => {
        setIsSaving(true)
        try {
            await updateUser(user.id, { email, firstName, lastName, role })
            showToast({ type: "success", children: "Usuário atualizado com sucesso!" })
            setIsEditing(false)
            refresh()
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err)
            showToast({ type: "error", children: "Erro ao atualizar usuário" })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteUser(user.id)
            showToast({ type: "success", children: "Usuário excluído com sucesso!" })
            refresh()
        } catch (err) {
            console.error("Erro ao excluir usuário:", err)
            showToast({ type: "error", children: "Erro ao excluir usuário" })
        }
    }

    return (
        <Card className="p-0">
            <CardContent className="flex flex-col items-center p-4 gap-2">
                <p className="font-semibold text-sm">{user.firstName}  {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
            </CardContent>

            <CardFooter className="flex justify-center gap-2 bg-gray-50 py-2">
                <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Edit3 className="w-4 h-4 mr-2" /> Editar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="z-[9999999999999999] md:max-w-[50%] max-w-full">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Editar usuário</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="space-y-4 mt-2">
                            <Input
                                placeholder="Primeiro nome do usuário"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Input
                                placeholder="Último nome do usuário"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <Input
                                placeholder="email do usuário"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRoleEnum)}
                                className="border rounded-md p-2 w-full"
                            >
                                <option value={UserRoleEnum.ADMIN}>Administrador</option>
                                <option value={UserRoleEnum.MAIN_EDITOR}>Main Editor</option>
                                <option value={UserRoleEnum.EDITOR}>Editor</option>
                                <option value={UserRoleEnum.READER}>Leitor</option>
                            </select>
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
                            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p className="text-sm text-muted-foreground text-center">
                            Esta ação não pode ser desfeita.
                        </p>

                        <p className="font-semibold text-sm">{user.firstName}  {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button onClick={handleDelete}>Confirmar</Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}