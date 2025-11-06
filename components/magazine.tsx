"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import dynamic from "next/dynamic";
import { get, set } from "idb-keyval";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <p>Carregando páginas...</p>,
});

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PDFMagazine({ pdfUrl }: { pdfUrl: string }) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadPDF = async () => {
      const cacheKey = `pdf-cache:${pdfUrl}`;
      const cached = await get(cacheKey);

      if (cached) {
        setPages(cached);
        setLoading(false);
        console.info("[PDFMagazine] Loaded from IndexedDB cache");
        return;
      }

      console.info("[PDFMagazine] Rendering PDF for first time");
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const imgs: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx!, viewport }).promise;
        imgs.push(canvas.toDataURL("image/jpeg", 0.6)); // compress to 60%
      }

      setPages(imgs);
      setLoading(false);

      try {
        await set(cacheKey, imgs);
        console.info("[PDFMagazine] Cached in IndexedDB");
      } catch (e) {
        console.warn("[PDFMagazine] Cache skipped:", e);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  const bookProps: any = {
    width: 500,
    height: 700,
    showCover: true,
    flippingTime: 800,
    size: "stretch",
    className: "shadow-lg rounded-lg",
    usePortrait: false,
  };

  return (
    <div className="flex justify-center py-10 bg-gray-100 overflow-hidden">
      {!loading && pages.length > 0 ? (
        <HTMLFlipBook {...bookProps}>
          {pages.map((src, idx) => (
            <div
              key={idx}
              className="page bg-white flex justify-center items-center"
            >
              <img
                loading="lazy"
                src={src}
                alt={`Page ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </HTMLFlipBook>
      ) : (
        <p>Carregando PDF...</p>
      )}
    </div>
  );
}