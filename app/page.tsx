"use client"
import 'swiper/css'
import 'swiper/css/navigation'

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Menu, MessageSquare, Play, Search, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContentStore } from "@/lib/content-store"
import Footer from '@/components/ui/footer'
import { getRecentTweets } from '@/services/twitter'
import { VideoSlider } from '@/components/ui/video-home'
import ColunistasSection from '@/components/ui/colunas'
import { ContentSlider } from '@/components/ui/content-slider'
import Link from 'next/link'
import { ToastContainer } from 'react-toastify'
import Script from 'next/script'
import { getLive, UpdateLiveData } from '@/services/live'
import { getPauta } from '@/services/pauta'
import { showToast } from '@/utils/show-toast'
import RespondeAgroDirect from '@/components/agro'
import PostsFeature from '@/components/posts-feature'
import Header from '@/components/ui/header'
import { getInstagramPosts } from '@/services/instagram'
import InstagramGrid from '@/components/ui/instagram-grid'
import LastNews from '@/components/last-news'
import WebstoriesCarousel from '@/components/ui/webstory-carousel'
import FatoEmFocoSkeleton from '@/components/skeletons/fato-em-foco-skeleton'
import PostsCategorySectionSkeleton from '@/components/skeletons/post-category-featured-skeleton'
import MostViewedSkeleton from '@/components/skeletons/most-viewed-skeleton'
import VideosSkeleton from '@/components/skeletons/videos-skeleton'
import TwitterInstagramSkeleton from '@/components/skeletons/twitter-instagram-skeleton'
import WebstoriesCarouselSkeleton from '@/components/skeletons/webstory-skeleton'
import Newsletter from '@/components/newsletter'
import MinutoFPA from '@/components/minuto-fpa'
import { LazyYouTube } from '@/components/lazy-youtube'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Home() {
  const ref = useRef<any>(null);

  const pathname = usePathname();
  const [hash, setHash] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Captura o hash da URL no cliente
    const handleHash = () => setHash(window.location.hash);
    handleHash(); // captura inicial
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (!hash) return
    if (hash.includes("#")) {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);


  useEffect(() => {
    const script = document.createElement('script');
    script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
    script.setAttribute('async', 'true');
    ref.current?.appendChild(script);
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const {
    fetchBanners, banners, webstories,
    fetchWebStories, fetchRelevants, relevants, fetchPostsFeatured,
    postsFeature, fetchVideos, videos, fetchMostViewed,
    fetchPostsCategoryFeatured, postsCategoryFeatured,
    fetchPosts, fetchMagazineUrl, magazineUrl, magazinePreviewUrl
  } = useContentStore()

  const [tweets, setTweets] = useState();

  useEffect(() => {
    fetchBanners()
    fetchWebStories()
    fetchRelevants()
    fetchPostsFeatured()
    fetchTweets()
    fetchVideos()
    fetchMostViewed()
    fetchPostsCategoryFeatured()
    fetchPosts()
  }, []);

  useEffect(() => {
    fetchMagazineUrl()
  }, []);

  useEffect(() => {
    console.log(pathname)
  }, [pathname]);

  async function fetchTweets() {
    try {
      const tweets = await getRecentTweets("fpagroupecuaria")
      setTweets(tweets)
    } catch (error) {
      console.error("Error fetching tweets:", error)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
    resetTimer()
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold: 0.4, // 40% visível
      }
    )

    if (sliderRef.current) {
      observer.observe(sliderRef.current)
    }

    return () => {
      if (sliderRef.current) {
        observer.unobserve(sliderRef.current)
      }
    }
  }, [])

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 10000);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      startTimer(); // restart from zero
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, banners.length]);

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section ref={sliderRef} className="relative h-[600px] overflow-hidden pb-8 ">
        {/* Todas as imagens empilhadas com opacidade controlada */}
        {banners.map((banner, index) => (
          <Image
            width={300}
            height={300}
            key={banner.id}
            // src={banner.imageUrl}
            src={`/api/cache/image?url=${encodeURIComponent(banner.imageUrl)}`}
            alt={banner.text}
            priority={index === 0}
            unoptimized
            // ✅ Critical optimization for LCP
            fetchPriority={index === 0 ? "high" : "auto"}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`
              absolute inset-0 w-full h-full object-cover transition-opacity duration-700
              ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          />
        ))}

        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-black opacity-50 z-20" />

        {/* Texto acima das imagens */}
        <div className="relative z-30 flex items-center flex-col justify-end h-full text-white text-center lg:px-4 px-[30px]">
          <h1 className="text-2xl md:text-4xl font-bold max-w-6xl leading-tight">
            {banners[currentSlide]?.text}
          </h1>

          {/* Dot Indicators */}
          <div className="flex gap-2 mt-3">
            {banners.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentSlide
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/40 hover:bg-white/60"
                  }
            `}
              />
            ))}
          </div>
        </div>

        {/* Navegação */}
        {banners.length > 1 && <>
          <button
            onClick={prevSlide}
            className="cursor-pointer hover:scale-105 absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
            aria-label='Seta esquerda do banner'
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="cursor-pointer hover:scale-105 absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
            aria-label='Seta direita do banner'
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>}
      </section>

      {/* Featured news */}
      <PostsFeature postsFeature={postsFeature} />

      {/* Main Content Section with Recent News (75%) and Sidebar (25%) */}
      <LastNews />

      {/* Highlighted Categories Section */}
      {
        postsCategoryFeatured?.categories?.length > 0
          ? <section className="my-12 flex justify-center">
            <div className="lg:max-w-[1300px] md:max-w-2/3 lg:mx-auto bg-white rounded-2xl shadow-md p-4 mx-4">
              <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-12">

                {postsCategoryFeatured.categories.map((postCategory, index) => <div key={postCategory.id + "-" + index} className="space-y-6 flex flex-col md:items-start items-center justify-center">
                  <h2 style={{ color: postCategory?.color }} className={`text-2xl font-semibold mb-6 md:text-start`}>{postCategory?.name}</h2>

                  {/* Featured Article */}
                  {/* <Link href={`${process.env.NEXT_PUBLIC_FRONT_URL}/noticia/${postCategory.slug}`}> */}
                  <Link className='lg:w-auto w-full' href={`/noticia/${postsCategoryFeatured?.postsByCategory[postCategory?.id][0]?.id}`}>
                    <article className="bg-white rounded-2xl overflow-hidden shadow-md flex self-center cursor-pointer transition-all lg:hover:scale-105">
                      <div className="relative lg:max-w-[460px] overflow-hidden w-full ">
                        <img loading="lazy"
                          src={postsCategoryFeatured?.postsByCategory[postCategory.id][0]?.thumbnailUrl}
                          alt="Incentivo ao desenvolvimento e à produção de biocombustíveis"
                          className="h-[320px] lg:max-w-[400px] w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black opacity-50 flex items-end">
                        </div>
                        <h3 className="absolute bottom-0 text-white font-semibold text-xl px-4 pb-2 leading-tight">
                          {postsCategoryFeatured?.postsByCategory[postCategory.id][0]?.postTitle}
                        </h3>
                      </div>
                    </article>
                  </Link>

                  {/* Recent Articles */}
                  <div className="space-y-8 w-full">
                    {
                      postsCategoryFeatured?.postsByCategory && postsCategoryFeatured?.postsByCategory[postCategory.id].slice(1).map(post =>
                        <div key={`postfeatured-${post.id}`}>
                          <hr className='my-7' />
                          <Link href={`/noticia/${post.id}`}>
                            <article className={`flex gap-4 items-start cursor-pointer transition-all lg:hover:scale-105 sm:flex-row flex-col `}>
                              <img loading="lazy"
                                src={`/api/cache/image?url=${encodeURIComponent(post.thumbnailUrl)}`}
                                alt="Audiência pública"
                                className="sm:w-[180px] w-full h-[120px] object-cover rounded-2xl flex-shrink-0 "
                              />
                              <div className="flex-1 max-w-[282px]">
                                {/* <p className="text-xs text-gray-500 mb-1">{new Date(post.createdAt).toLocaleDateString('pt-BR')}&nbsp;{new Date(post.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p> */}
                                <h4 className="text-sm  text-gray-900 leading-tight">{post.postTitle}</h4>
                              </div>
                            </article>
                          </Link>
                        </div>
                      )
                    }
                  </div>

                  <Link style={{ color: postCategory.color }} className='flex gap-2' href={`/categoria/${postCategory.id}`}>
                    <span>Ver mais em {postCategory.name}</span>
                    <ArrowRight className='w-4' />
                  </Link>
                </div>
                )}

              </div>
            </div>
          </section> :
          <PostsCategorySectionSkeleton />
      }

      {
        relevants.length === 0 ? (
          <FatoEmFocoSkeleton />
        ) : <MinutoFPA relevants={relevants} />
      }
      <section className="md:px-0 px-4 bg-gray-50 max-w-[1300px] mx-auto ">
        <div className="flex gap-10 lg:flex-nowrap flex-wrap lg:flex-row flex-col-reverse">
          <div className="w-full lg:w-9/12">
            <ColunistasSection />
            {videos.length === 0
              ? <VideosSkeleton />
              : <div className="my-12 bg-white rounded-2xl shadow-md p-4" >
                {/* Videos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-[#1C9658]">Vídeos</h2>
                    </div>
                  </div>
                  <ContentSlider perView={1.4} youtube>
                    {videos.map((video) => (
                      <LazyYouTube key={video.id} embedHtml={video.embed} title={video.description} />
                    ))}
                  </ContentSlider>
                </div>
              </div>}
            {webstories.length == 0
              ? <WebstoriesCarouselSkeleton />
              : <WebstoriesCarousel webstories={webstories} />}
          </div>
          <div>
            {/* Newsletter Signup */}
            {/* <Newsletter /> */}

            {magazinePreviewUrl
              ? <MagazinePreview magazineUrl={magazinePreviewUrl} />
              : <div className="w-full h-[460px] bg-gray-200 animate-pulse rounded-md" />
            }
          </div>
        </div>

      </section >
      <Footer />
      <ToastContainer position="top-right" autoClose={false} />
    </div >
  )
}


function MagazinePreview({ magazineUrl }: { magazineUrl: string }) {
  return (
    <div className="group w-full max-w-3xl mx-auto flex justify-center">
      {/* Container com sombra e borda arredondada */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 w-fit">
        {/* PDF preview */}
        <img loading="lazy" src={magazineUrl} className='w-full lg:h-auto h-[480px] object-contain' alt="" />

        {/* Overlay ao hover */}
        <Link
          href="/revista" target="_blank" className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

          <div className="px-4 py-2 bg-white text-gray-800 font-medium rounded-full shadow flex items-center gap-2 hover:bg-gray-100 transition">
            Abrir Revista
            <ExternalLink className="w-4 h-4" />
          </div>
        </Link>
        <div className="my-3 text-center">
          <p className="text-lg font-semibold text-[#1C9658]">Revista FPA</p>
        </div>
      </div>

      {/* Legenda / título */}
    </div >
  );
}