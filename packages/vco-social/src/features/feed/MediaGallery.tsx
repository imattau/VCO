import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface MediaGalleryProps {
  mediaCids: Uint8Array[];
}

export function MediaGallery({ mediaCids }: MediaGalleryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!mediaCids || mediaCids.length === 0) return null;

  // Mocking images based on array length for UI testing
  const mockImages = mediaCids.map((_, i) => `https://picsum.photos/seed/vco${i}/800/600`);
  
  // Layout logic
  const getGridClass = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2 aspect-[2/1]';
      case 3: return 'grid-cols-2 grid-rows-2 aspect-[3/2]';
      case 4:
      default: return 'grid-cols-2 grid-rows-2 aspect-square';
    }
  };

  const getItemClass = (count: number, index: number) => {
    if (count === 3 && index === 0) return 'row-span-2';
    return '';
  };

  return (
    <>
      <div 
        className={twMerge("grid gap-1 rounded-2xl overflow-hidden border border-zinc-800", getGridClass(mockImages.length))}
        onClick={(e) => e.stopPropagation()} // Prevent opening ThreadView when clicking media
      >
        {mockImages.slice(0, 4).map((src, index) => (
          <div 
            key={index}
            className={twMerge("relative group cursor-pointer bg-zinc-950", getItemClass(mockImages.length, index))}
            onClick={() => setExpandedIndex(index)}
          >
            <img 
              src={src} 
              alt={`Decentralized media ${index}`} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {index === 3 && mockImages.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                 <span className="text-white font-black text-2xl">+{mockImages.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded Lightbox */}
      {expandedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedIndex(null);
          }}
        >
           <button 
             className="absolute top-6 right-6 p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all backdrop-blur-md border border-zinc-800"
             aria-label="Close gallery"
           >
              <X size={24} />
           </button>
           
           <img 
             src={mockImages[expandedIndex]} 
             alt="Expanded media" 
             className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500"
             onClick={(e) => e.stopPropagation()}
           />
           
           <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              {mockImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIndex(idx);
                  }}
                  className={twMerge(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    expandedIndex === idx ? "bg-white scale-125" : "bg-zinc-600 hover:bg-zinc-400"
                  )}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
           </div>
        </div>
      )}
    </>
  );
}
