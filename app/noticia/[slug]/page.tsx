'use client'
import ViewPost from '@/app/admin/posts/view-post';
import LastNews from '@/components/last-news';
import LoadingPage from '@/components/loading';
import PostPageSkeleton from '@/components/skeletons/post-page-skeleton';
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import { useContentStore } from '@/lib/content-store';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface PageProps {
    params: {
        slug: string;
    };
}

export default function Page({ params }: PageProps) {
    const { currentPost, fetchPost, categories } = useContentStore();
    const unwrappedParams = use(params as any);
    const { slug } = unwrappedParams as any;

    const [currentPostId, setCurrentPostId] = useState(slug);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPost();
    }, [slug]);

    async function getPost() {
        setLoading(true);
        try {
            await fetchPost(slug);
            setCurrentPostId(slug);
        } finally {
            setLoading(false);
        }
    }

    console.log(currentPost);

    if (loading) return <LoadingPage />;

    // ✅ If no post found
    if (!currentPost)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Post não encontrado.
            </div>
        );


    return (
        <main>
            <Header
                category={currentPost?.id == currentPostId ? currentPost?.postCategory.name : ""}
                categoryColor={currentPost?.id == currentPostId ? currentPost?.postCategory.color : ""}
                categoryId={currentPost?.id == currentPostId ? currentPost?.postCategory.id : ""}
            />

            {
                (!currentPost || currentPost.id != currentPostId)
                    ? <PostPageSkeleton />
                    : <div>
                        <div className='max-w-[800px] mx-auto px-4 my-10'>
                            <h1 className="lg:text-5xl text-4xl font-bold mb-4">{currentPost?.postTitle}</h1>
                            <h2 className="text-2xl text-[#000000cb]  mb-4">{currentPost?.summary}</h2>

                            <div className="text-sm text-gray-500 mb-6">
                                Publicado em {new Date(currentPost?.createdAt || new Date()).toLocaleDateString('pt-BR')}
                            </div>

                            <img loading="lazy"
                                src={currentPost.thumbnailUrl}
                                alt={currentPost.postTitle}
                                className="rounded-lg mb-6 w-full h-full"
                            />

                            <article>
                                {typeof currentPost?.postContent == 'object'
                                    ? <ViewPost postContent={currentPost.postContent} />
                                    : <div className='text-lg max-w-full overflow-hidden' dangerouslySetInnerHTML={{ __html: currentPost?.postContent || '' }}></div>
                                }
                            </article>

                            {
                                Boolean(currentPost?.relatedTags?.length) &&
                                <div className="flex flex-col gap-4">
                                    <h6 className="font-semibold text-2xl text-[#006B2D]">Tags</h6>
                                    {currentPost?.relatedTags?.map(tag => <div className="flex gap-3">{tag?.name}</div>
                                    )}
                                </div>
                            }

                        </div>
                        <LastNews isHome={false} internalPage category={currentPost.postCategoryId} />
                    </div>

            }
            <Footer />
        </main>
    );
}