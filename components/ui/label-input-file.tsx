"use client"

import { useState, useEffect } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { UploadCloud, X } from "lucide-react"

export function LabelInputFile({ id, label, accept, onChange, enableCrop = true }: LabelInputFileProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)

  const isImage = accept.includes("image")
  const isVideo = accept.includes("video")

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const handleChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      onChange(null)
      return
    }

    // 🧩 Se for imagem e o corte estiver habilitado → abre o modal
    if (file.type.startsWith("image/") && enableCrop) {
      setSelectedFile(file)
      setCropModalOpen(true)
    } else {
      // 🔹 Se for vídeo ou crop desativado, passa direto
      setSelectedFile(file)
      onChange(file)
    }
  }

  const handleSaveCrop = async () => {
    if (!imageRef || !completedCrop) return

    const canvas = document.createElement("canvas")
    const scaleX = imageRef.naturalWidth / imageRef.width
    const scaleY = imageRef.naturalHeight / imageRef.height
    canvas.width = completedCrop.width!
    canvas.height = completedCrop.height!
    const ctx = canvas.getContext("2d")!
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      imageRef,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY,
      0,
      0,
      completedCrop.width!,
      completedCrop.height!
    )

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png", 1.0)
    )
    const croppedFile = new File([blob], selectedFile?.name || "cropped.png", {
      type: "image/png",
    })

    setCropModalOpen(false)
    setSelectedFile(croppedFile)
    onChange(croppedFile)
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-3 hover:border-gray-400 transition-colors"
      >
        <UploadCloud className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-700">{label}</span>
      </label>

      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => handleChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {previewUrl && (
        <div className="relative group">
          {isImage && (
            <img
              loading="lazy"
              src={previewUrl}
              alt="preview"
              className="w-full max-h-48 object-contain rounded border"
            />
          )}
          {isVideo && (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-48 object-contain rounded border"
            />
          )}
          <button
            onClick={() => handleChange(null)}
            className="cursor-pointer absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {enableCrop && cropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-gray-900 rounded relative">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                keepSelection
                ruleOfThirds
                minWidth={10}
                minHeight={10}
              >
                <img
                  loading="lazy"
                  src={previewUrl!}
                  onLoad={(e) => setImageRef(e.currentTarget)}
                  className="object-contain"
                  style={{ maxHeight: "70vh" }}
                  alt="Crop selection"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCrop}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface LabelInputFileProps {
  id: string
  label: string
  accept: string
  onChange: (file: File | null) => void
  enableCrop?: boolean 
}