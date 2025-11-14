'use client'

import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { getLive, UpdateLiveData } from "@/services/live";
import { useEffect, useState } from "react";
import { useContentStore } from "@/lib/content-store";
import SearchToggle from "../search";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header({ isArticle, category, categoryColor, categoryId }: { isArticle?: boolean, category?: string, categoryColor?: string, categoryId?: string }) {
    const { categories, fetchCategories } = useContentStore()

    const [live, setLive] = useState<UpdateLiveData>({
        isEnabled: false,
        link: ''
    });

    const isMobile = useIsMobile();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;

            setIsScrolled(prev => {
                if (!prev && y > 220) return true;   // ativa
                if (prev && y < 180) return false;   // desativa
                return prev; // mantém o estado
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        fetchLiveUrl();
        fetchCategories({limit: 20})
    }, []);

    async function fetchLiveUrl() {
        const res = await getLive();
        setLive(res);
    }

    return (
        <>
            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-40 backdrop-blur-xs opacity-50 transition-opacity ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside style={{ background: categoryColor }} className={`fixed top-0 left-0 h-full w-64 bg-[#1C9658] text-white z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="p-4 space-y-4 mt-4 ">
                    {/* Categorias com submenu */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                            className="cursor-pointer flex items-center justify-between w-full hover:scale-105 transition"
                        >
                            <span className="font-semibold">Categorias</span>
                            {isCategoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoriesOpen ? 'max-h-[800px]' : 'max-h-0'}`}>
                            <ul className="pl-4 mt-2 space-y-2">
                                {categories.map(cat => <li key={cat.id}><Link href={`/categoria/${cat.id}`} className="block hover:scale-105">{cat.name}</Link></li>)}
                            </ul>
                        </div>
                    </div>
                    <Link onClick={() => setIsSidebarOpen(false)} href="/#artigos" className="block hover:scale-105 transition">Artigos</Link>
                    <Link onClick={() => setIsSidebarOpen(false)} href="/#mais-lidas" className="block hover:scale-105 transition">Mais Recentes</Link>
                    <Link onClick={() => setIsSidebarOpen(false)} href="/#fato-em-foco" className="block hover:scale-105 transition">Minuto FPA</Link>
                    <Link onClick={() => setIsSidebarOpen(false)} href="/#videos" className="block hover:scale-105 transition">Vídeos</Link>
                    <Link onClick={() => setIsSidebarOpen(false)} href="/#webstories" className="block hover:scale-105 transition">Webstories</Link>
                    <Link onClick={() => setIsSidebarOpen(false)} href="https://www.flickr.com/photos/130908833@N08/albums/" target="_blank" className="block hover:scale-105 transition">Fotos</Link>
                    <Link href="/sobre" className="block hover:scale-105 transition">Sobre</Link>
                    <Link href="/contato" className="block hover:scale-105 transition">Contato</Link>
                    <div className="md:hidden block">
                        <SearchToggle />
                    </div>
                </nav>
            </aside>

            {/* Header */}
            <header style={{ backgroundColor: categoryColor || '' }} className="bg-[#1C9658] text-white sticky top-0 left-0 z-[999999999]">
                {/* Top bar */}
                {/* <RespondeAgroDirect /> */}

                {/* Main header */}
                <div className="py-4 px-4">
                    <div className="flex justify-between items-center max-w-[1300px] mx-auto relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`${!category ? 'fixed' : ''} top-4 left-4 text-white ${!categoryColor ? `hover:bg-[#154B2B]` : `hover:bg-[${categoryColor}]`} w-[30px] h-[30px] flex`}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            id="menu-button"
                            aria-label="Botão de menu"
                        >
                            <Menu width={30} height={30} className="w-[30px] h-[30px]" />
                            {/* {isMobile && <div className="-ms-1 me-1 border-1 border-white h-[20px] "></div>} */}
                        </Button>
                        <div className="flex-1 flex">
                            <Link href="/" className={`text-center flex ${category ? 'justify-start' : 'w-full justify-center'}`}>
                                <img loading="lazy"
                                    src={(isMobile && category) ? "/afpa-cortada.png" : "/agfpa_branca.png"}
                                    alt="logo FPA"
                                    className={
                                        `
                                    ${'lg:max-w-[140px] lg:object-fill object-contain'}
                                    ${(isMobile && category) ? 'max-w-[40px]' : 'max-w-[100px]'}
                                    relative z-40`
                                    }
                                />
                                <link rel="preload" as="image" href="/agfpa_branca.png" />
                            </Link>
                            {(category && !isArticle) ? <Link className={`w-full text-center ${category && '-ms-12'} lg:text-3xl text-white`} href={`/categoria/${categoryId}`}>
                                {category}
                            </Link> :isArticle?
                                <span className="w-full text-center lg:text-3xl  text-white" >
                                    {category}
                                </span> : null}
                        </div>
                        <div className="flex gap-6 justify-start md:w-[180px] ">
                            <div className="lg:block hidden">
                                <SearchToggle />
                            </div>
                            {(live.isEnabled) ?
                                <Link href={live.link} className="bg-red-800 rounded-md flex items-center space-x-2 animate-pulse p-1 px-2">
                                    <div className="w-2 h-2 bg-white rounded-full "></div>
                                    <span className="font-medium lg:text-base text-[10px]">AO VIVO</span>
                                </Link>
                                :
                                <span className="font-medium"></span>
                            }
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}