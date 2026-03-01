import React, { useState, useEffect } from 'react';
import { usePodcast } from '@/features/player/PodcastContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, ShieldCheck, Activity } from 'lucide-react';

export default function MiniPlayer() {
  const { currentEpisode, isPlaying, togglePlayback } = usePodcast();
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Synchronize audio element state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentEpisode]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    }
  };

  const handleEnded = () => {
    if (isPlaying) togglePlayback();
  };

  if (!currentEpisode) return null;

  const { manifest, url } = currentEpisode;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 p-4 z-50 animate-in slide-in-from-bottom-full duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
         <div 
           className="h-full bg-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.8)]"
           style={{ width: `${progress}%` }}
         ></div>
      </div>

      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Now Playing Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 bg-zinc-900 rounded-xl flex-shrink-0 border border-zinc-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 mix-blend-overlay"></div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                 <Activity size={24} className="text-white animate-pulse" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-white text-sm truncate tracking-tight">{manifest.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{manifest.summary}</span>
               <span className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest border border-zinc-800">
                  <ShieldCheck size={10} />
                  Chunks Verified
               </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-6">
            <button className="text-zinc-500 hover:text-white transition-colors" aria-label="Skip backward 15 seconds">
              <SkipBack size={20} className="fill-current" />
            </button>
            <button 
              onClick={togglePlayback}
              className="w-12 h-12 bg-white text-black hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
            </button>
            <button className="text-zinc-500 hover:text-white transition-colors" aria-label="Skip forward 30 seconds">
              <SkipForward size={20} className="fill-current" />
            </button>
          </div>
        </div>

        {/* Extra Controls */}
        <div className="flex items-center justify-end gap-4 flex-1 text-zinc-500">
          <button className="hover:text-white transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-zinc-700 rounded-lg">
            <Volume2 size={20} />
          </button>
          <div className="w-24 h-1.5 bg-zinc-800 rounded-full cursor-pointer group">
             <div className="w-2/3 h-full bg-zinc-600 group-hover:bg-zinc-400 rounded-full transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
