'use client'

import LastNews from "@/components/last-news";
import LoadingPage from "@/components/loading";
import FeaturedNewsSectionSkeleton from "@/components/skeletons/featured-news-skeleton";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { useContentStore } from "@/lib/content-store";
import { showToast } from "@/utils/show-toast";
import { Share2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useEffect, useState } from "react";

interface PageProps {
    params: {
        author: string;
    };
}

export default function Page({ params }: PageProps) {
    const pathname = usePathname();
    const { fetchPosts, postsLoading, posts, currentCategory, authors, fetchAuthors } =
        useContentStore();

    const unwrappedParams = use(params as any);
    const { author } = unwrappedParams as any;
    const [currentAuthorId, setCurrentAuthorId] = useState(author);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPosts();
    }, [pathname, author]);

    async function getPosts() {
        setLoading(true);
        try {
            await Promise.all([
                fetchPosts({ categoryId: "articles", authorId: author }),
                fetchAuthors(),
            ]);
            setCurrentAuthorId(author);
        } finally {
            setLoading(false);
        }
    }

    // ✅ Show loading screen while data is being fetched
    if (loading || postsLoading) return <LoadingPage />;

    return (
        <div className="min-h-screen bg-[#F9F9F9]" >
            <Header isArticle category={`Artigos ${authors.find(el => el.id == currentAuthorId || "")?.name}`} categoryColor={currentCategory?.color || 'black'} categoryId={currentCategory?.id} />

            <div className="max-w-[1300px] lg:mx-auto my-10">
                {
                    (!posts[0] || postsLoading || !(authors.some(el => el.id == currentAuthorId)))
                        ? <FeaturedNewsSectionSkeleton />
                        : <div className="flex gap-10 lg:flex-nowrap flex-wrap">
                            <div className="w-full lg:w-8/12">
                                {posts[0] &&
                                    <Link className="text-xl font-semibold text-gray-900 mb-2 leading-tight block h-full" href={`${process.env.NEXT_PUBLIC_FRONT_URL}/noticia/${posts[0].id}`}>
                                        <article className="relative flex items-end justify-center group overflow-hidden lg:rounded-2xl h-full">
                                            <div className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-30 z-10"></div>
                                            <img loading="lazy" className="w-full lg:h-full h-[400px] object-cover lg:rounded-2xl lg:group-hover:scale-120 transition-all" src={posts[0].thumbnailUrl} />
                                            <h2 className="absolute m-10 text-white text-center font-semibold md:text-3xl text-base z-20">{posts[0].postTitle}</h2>
                                        </article>
                                    </Link>
                                }
                            </div>
                            <div className="w-full lg:w-4/12 flex flex-col gap-4 lg:mx-auto mx-4 justify-between">
                                {posts.slice(1, 4).map((post, index) => (
                                    <article key={post.id} className="flex items-start gap-4 flex-col">
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

                                            <div className="flex gap-1 flex-col">
                                                <Link className="text-xl font-medium text-gray-900 mb-2 leading-tight" href={`${process.env.NEXT_PUBLIC_FRONT_URL}/noticia/${post.id}`}>
                                                    <h3 >{post.postTitle}</h3>
                                                </Link>

                                                {post.summary && (
                                                    <p className="text-sm font-light text-gray-600 leading-relaxed">{post.summary}</p>
                                                )}
                                            </div>
                                        </div>
                                        {
                                            index < 2
                                                ? <div className="h-2 w-full border-b border-gray-200"></div>
                                                : <div></div>
                                        }
                                    </article>
                                ))}
                            </div>
                        </div>
                }

                <LastNews isHome={false} authorId={author} />
            </div>
            <Footer />
        </div >
    )
}