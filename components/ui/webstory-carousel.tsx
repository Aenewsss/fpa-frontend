"use client";

import { useState } from "react";
import Image from "next/image";
import WebstoryViewer from "./webstory-viewer";
import { WebStory } from "@/services/webstories";
import { ContentSlider } from "./content-slider";

interface IProps {
  webstories: WebStory[];
}

export default function WebstoriesCarousel({ webstories }: IProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startFromEnd, setStartFromEnd] = useState(false);

  const handleNextStory = () => {
    if (selectedIndex === null) return;
    const nextIndex = selectedIndex + 1;
    if (nextIndex < webstories.length) {
      setSelectedIndex(nextIndex);
      setStartFromEnd(false);
    } else {
      setSelectedIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (selectedIndex === null) return;
    const prevIndex = selectedIndex - 1;
    if (prevIndex >= 0) {
      setSelectedIndex(prevIndex);
      setStartFromEnd(true); // 👉 força começar do último slide
    } else {
      setSelectedIndex(null);
    }
  };

  return (
    <section id="webstories" className="my-12 bg-white rounded-2xl shadow-md p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-[#1C9658]">Webstories</h2>
        </div>

        <ContentSlider perView={4}>
          {webstories.map((story, idx) => (
            <div key={story.id} className="flex-shrink-0">
              <div
                className="lg:w-[200px] lg:h-[340px] w-full h-full object-contain rounded-xl overflow-hidden border-2 border-[#1C9658] cursor-pointer"
                onClick={() => {
                  setSelectedIndex(idx);
                  setStartFromEnd(false);
                }}
              >
                <Image
                  src={story.slides?.[0]?.imageUrl || "/placeholder.jpg"}
                  alt={story.title}
                  width={100}
                  height={180}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </ContentSlider>
      </div>

      {selectedIndex !== null && (
        <WebstoryViewer
          open={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          webstory={webstories[selectedIndex]}
          onNextStory={handleNextStory}
          onPrevStory={handlePrevStory}
          startFromEnd={startFromEnd} // 👈 passa a flag
        />
      )}
    </section>
  );
}