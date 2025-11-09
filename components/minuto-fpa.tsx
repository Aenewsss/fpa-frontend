import { useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import { ContentSlider } from "./ui/content-slider"

export default function FatoEmFoco({ relevants }: { relevants: any[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  return (
    <section id="fato-em-foco" className="lg:py-12 pb-10 px-4">
      <div className="max-w-[1300px] mx-auto bg-white 2xl:p-8 p-4 rounded-2xl shadow-md relative">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1C9658]">Minuto FPA</h2>
              <p className="text-gray-600">Acompanhe nossas notícias em 1 minuto</p>
            </div>
          </div>

          <ContentSlider arrowTop="-top-20" perView={4}>
            {relevants.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
              />
            ))}
          </ContentSlider>

        </div>
        <div id="artigos" className="invisible p-1 absolute top-1/2 -translate-y-1/2">t</div>
      </div>
    </section>
  )
}

function VideoCard({
  video,
  activeVideoId,
  setActiveVideoId,
}: {
  video: any
  activeVideoId: string | null
  setActiveVideoId: (id: string | null) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = async () => {
    const vid = videoRef.current
    if (!vid) return

    if (isPlaying) {
      vid.pause()
      setIsPlaying(false)
      setActiveVideoId(null)
    } else {
      // Pause other videos first
      setActiveVideoId(video.id)

      try {
        await vid.play()
        setIsPlaying(true)
      } catch (err: any) {
        // Ignore AbortError (happens if play is interrupted by pause)
        if (err.name !== "AbortError") {
          console.warn(`⚠️ Video play failed for ${video.id}:`, err.message)
        }
      }
    }
  }

  // Pause this video if another starts
  if (activeVideoId !== video.id && isPlaying) {
    videoRef.current?.pause()
    setIsPlaying(false)
  }

  return (
    <div className="cursor-pointer">
      <div className="relative rounded-xl mx-auto overflow-hidden bg-black group">
        {/* 🎬 Video */}
        <video
          ref={videoRef}
          poster={video?.coverImageUrl}
          id={`video-${video.id}`}
          className="w-full h-full object-cover"
          src={`/api/cache/video?url=${encodeURIComponent(video.videoUrl)}`}
          onEnded={() => {
            setIsPlaying(false)
            setActiveVideoId(null)
          }}
        />

        {/* 🗓️ Date tag */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
          {new Date(video.updatedAt).toLocaleDateString("pt-BR")}
        </div>

        {/* ▶️ / ⏸️ Overlay */}
        {!isPlaying ? (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <div className="bg-black/60 rounded-full p-4 transition-transform duration-200 group-hover:scale-110">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        ) : (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/30 transition"
          >
            <Pause className="w-8 h-8 text-white opacity-30" />
          </div>
        )}
      </div>
    </div>
  )
}