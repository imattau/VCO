import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { MediaService } from '../../lib/MediaService';

interface MediaGalleryProps {
  mediaCids: Uint8Array[];
}

export function MediaGallery({ mediaCids }: MediaGalleryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    let urls: string[] = [];
    
    const resolve = async () => {
      const resolved = await Promise.all(
        mediaCids.map(cid => MediaService.resolveToUrl(cid))
      );
      const filtered = resolved.filter((url): url is string => url !== null);
      setMediaUrls(filtered);
      urls = filtered;
    };

    resolve();

    return () => {
      // Revoke URLs to prevent memory leaks
      urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaCids]);

  if (!mediaCids || mediaCids.length === 0) return null;

  // Layout logic
  const getGridClass = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2';
      case 4:
      default: return 'grid-cols-2';
    }
  };

  // Each cell gets an aspect ratio so it has defined height without absolute positioning tricks
  const getItemClass = (count: number, index: number) => {
    if (count === 1) return 'aspect-video';
    if (count === 3 && index === 0) return 'row-span-2 aspect-auto min-h-[200px]';
    return 'aspect-square';
  };

  return (
    <>
      <div
        className={twMerge("grid gap-1 rounded-2xl overflow-hidden border border-zinc-800", getGridClass(mediaUrls.length))}
        onClick={(e) => e.stopPropagation()}
      >
        {mediaUrls.slice(0, 4).map((src, index) => (
          <div
            key={index}
            className={twMerge("relative overflow-hidden group cursor-pointer bg-zinc-950", getItemClass(mediaUrls.length, index))}
            onClick={() => setExpandedIndex(index)}
          >
            <img
              src={src}
              alt={`Decentralized media ${index}`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {index === 3 && mediaUrls.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                 <span className="text-white font-black text-2xl">+{mediaUrls.length - 4}</span>
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
             src={mediaUrls[expandedIndex]} 
             alt="Expanded media" 
             className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500"
             onClick={(e) => e.stopPropagation()}
           />
           
           <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              {mediaUrls.map((_, idx) => (
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
