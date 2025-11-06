"use client"
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { useContentStore } from "@/lib/content-store";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const PDFMagazine = dynamic(() => import("@/components/magazine"), {
  ssr: false,
  loading: () => <p>Carregando revista...</p>,
});

export default function Page() {
    const { fetchMagazineUrl, magazineUrl, createMagazine } = useContentStore()
    useEffect(() => {
        fetchMagazineUrl()
    }, [])

    return (
        <main>
            <Header />

            <div className='max-w-[1300px] mx-auto px-4 my-10'>
                <h1 className="text-4xl font-bold mb-4 text-primary">Revista FPA</h1>

                <div className="w-full overflow-auto">
                    {magazineUrl && <PDFMagazine pdfUrl={magazineUrl} />}
                    <a
                        href={magazineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                    >
                        Abrir revista completa
                    </a>
                </div>
            </div>
            <Footer />
        </main>
    )
}