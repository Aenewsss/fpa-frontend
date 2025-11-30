'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UploadCloud, Loader2 } from "lucide-react"
import { SendNewsletterData, sendNewsletterEmail } from "@/services/newsletter"
import { showToast } from "@/utils/show-toast"
import { ToastContainer } from "react-toastify"

const formInitialState: SendNewsletterData = {
    id: "",
    subject: ""
}

export default function Page() {
    const [form, setForm] = useState<SendNewsletterData>(formInitialState)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpload = async () => {
        setIsLoading(true)
        sendNewsletterEmail(form)
            .then(_ => {
                showToast({ type: 'success', children: 'Newsletter enviada!' })
                setForm(formInitialState)
            })
            .catch(e => showToast({ type: 'error', children: "Erro ao enviar newsletter" }))
            .finally(() => {
                setIsLoading(false)
            window.location.reload()
            })
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Gerenciamento da newsletter</h1>

            <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                    <Input
                        placeholder="Assunto do email"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                    <Input
                        placeholder="ID do template"
                        value={form.id}
                        onChange={(e) => setForm({ ...form, id: e.target.value })}
                    />

                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!form.id || !form.subject}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                            </>
                        ) :
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Enviar Tag
                            </>
                        }
                    </Button>
                </CardFooter>
            </Card>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tags?.map((tag) => (
                    <SortableCard
                        key={tag.id}
                        tag={tag}
                        onDelete={() => deleteTag(tag.id)}
                    />
                ))}
            </div> */}
            <ToastContainer />

        </div>
    )
}