"use client"
import LastNews from "@/components/last-news";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { useContentStore } from "@/lib/content-store";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const searchParams = useSearchParams()

    const { fetchPosts, posts, postsLoading, hasMore, postsPagination } = useContentStore()

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        const searchText = searchParams.get("q")
        if (searchText) fetchPosts({ search: searchText })
    }, [searchParams]);

    console.log(posts, hasMore)

    function loadMorePosts(loadMore: boolean) {
        const search = searchParams.get("q")
        if (!search) return

        setIsLoadingMore(true)
        try {
            fetchPosts({ page: postsPagination.page == 1 ? 4 : postsPagination.page + 1, search, limit: 5, loadMore })
        } finally {
            setTimeout(() => {
                setIsLoadingMore(false)
            }, 1000);
        }
    }
    return (
        <main>
            <div className="min-h-screen bg-[#F9F9F9]" >
                <Header />

                <div className="max-w-[1300px] lg:mx-auto py-8  px-4">

                    <h1 className="text-3xl font-bold text-black mb-8">Resultados da busca <span className="text-[#1C9658]">"{searchParams.get("q")}"</span></h1>

                    {
                        posts.map((post, index, arr) =>
                            <Link key={index + post.id} href={`/noticia/${post.id}`}>
                                <article className="flex md:flex-row flex-col gap-8" key={post.id}>
                                    <img loading="lazy"
                                        src={`/api/cache/image?url=${encodeURIComponent(post.thumbnailUrl)}`}
                                        alt={post.postTitle}
                                        className="last-news-img"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <span style={{ background: post.postCategory.color }} className='text-white p-1 rounded-md text-center w-fit md:px-3 px-2 uppercase md:text-sm text-[10px]'>{post.postCategory.name}</span>
                                        <h3 className="md:text-2xl font-semibold text-gray-900 mb-2">{post.postTitle}</h3>
                                        <h4 className="mb-2 text-[#575757]">{post.summary}</h4>
                                        <h5 className="mb-2 text-[#afafaf]">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</h5>
                                    </div>
                                </article>
                                {(index != arr.length - 1) && <hr className="my-10" />}
                            </Link>
                        )}

                    {(hasMore) &&
                        <button
                            onClick={() => loadMorePosts(true)}
                            className="cursor-pointer bg-primary text-white transition-all hover:scale-105 text-center p-2 rounded-lg mt-4 px-4">
                            {isLoadingMore ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Carregando...
                                </div>
                            ) : (
                                "Carregar mais"
                            )}
                        </button>
                    }

                    {posts.length === 0 && !postsLoading && (
                        <div className="text-center py-20 text-gray-500">
                            <h2 className="text-2xl font-semibold mb-4">Nenhum resultado encontrado</h2>
                            <p>Não foram encontradas notícias correspondentes à sua busca.</p>
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </main >
    )
}