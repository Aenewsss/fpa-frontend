"use client"
import LastNews from "@/components/last-news";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { useContentStore } from "@/lib/content-store";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const searchParams = useSearchParams()

    const { fetchPosts, posts, postsLoading } = useContentStore()

    useEffect(() => {
        const searchText = searchParams.get("q")
        if (searchText) fetchPosts({ search: searchText })
    }, [searchParams]);

    return (
        <main>
            <div className="min-h-screen bg-[#F9F9F9]" >
                <Header />

                <div className="max-w-[1300px] lg:mx-auto">
                    {/* {
                        !posts.length
                            ? <FeaturedNewsSectionSkeleton />
                            : <div className="flex gap-10 lg:flex-nowrap flex-wrap px-5">
                                <div className="w-full lg:w-8/12">
                                    {posts[0] &&
                                        <Link className="text-3xl font-semibold text-gray-900 mb-2 leading-tight " href={`/noticia/${posts[0].id}`}>
                                            <article className="relative flex items-center justify-center group overflow-hidden lg:rounded-2xl ">
                                                <div className="absolute top-0 left-0 w-full h-full bg-black rounded-2xl opacity-30 z-10"></div>
                                                <img loading="lazy" className="w-full lg:h-auto h-[400px] lg:object-contain object-cover lg:rounded-2xl lg:group-hover:scale-120 transition-all" src={posts[0].thumbnailUrl} />
                                                <h2 className="absolute m-10 text-white text-center font-semibold text-3xl z-20">{posts[0].postTitle}</h2>
                                            </article>
                                        </Link>
                                    }
                                </div>
                                <div className="w-full lg:w-4/12 flex flex-col gap-10 lg:mx-auto  mx-4">
                                    {posts.slice(1, 4).map((post) => (
                                        <article key={post.id} className="flex items-start gap-4 pb-6 border-b border-gray-200">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-10 mb-2">
                                                    <span style={{ color: post.postCategory.color }} className={`text-xs font-medium uppercase tracking-wide`}>
                                                        {post.postCategory.name}
                                                    </span>
                                                    <div className="flex gap-5">
                                                        <Share2
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONT_URL}/noticia/${post.slug}`)
                                                                    .then(() => {
                                                                        // Opcional: notifique o usuário (alert, toast, etc.)
                                                                        showToast({ type: 'success', children: 'Link copiado para a área de transferência' })
                                                                    })
                                                                    .catch(err => {
                                                                        console.error('Erro ao copiar link:', err);
                                                                    });
                                                            }}
                                                            className="h-4 w-4 hover:scale-110 transition-all text-gray-500 cursor-pointer" />
                                                        <img loading="lazy"
                                                            width={16} height={16} src='/wpp.svg'
                                                            onClick={() => {
                                                                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${process.env.NEXT_PUBLIC_FRONT_URL}/noticia/${post.slug}`)}`;
                                                                window.open(whatsappUrl, '_blank');
                                                            }}
                                                            className="h-4 w-4 hover:scale-110 transition-all text-green-600 cursor-pointer"
                                                        />
                                                    </div>

                                                </div>
                                                <Link className="text-3xl font-medium text-gray-900 mb-2 leading-tight" href={`${process.env.NEXT_PUBLIC_FRONT_URL}/noticia/${post.id}`}>
                                                    <h3 >{post.postTitle}</h3>
                                                </Link>

                                                {post.summary && (
                                                    <p className="text-sm font-light text-gray-600 leading-relaxed">{post.summary}</p>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                    } */}

                    <LastNews isHome />
                </div>

            </div>
            <Footer />
        </main >
    )
}