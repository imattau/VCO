import React from 'react';
import { usePodcast } from '@/features/player/PodcastContext';
import { Play, Pause, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { MediaManifestData } from '@vco/vco-schemas';

interface ChannelFeedProps {
  onSelectEpisode: (cid: Uint8Array, manifest: MediaManifestData) => void;
}

export default function ChannelFeed({ onSelectEpisode }: ChannelFeedProps) {
  const { channel, episodes, currentEpisode, isPlaying, playEpisode, togglePlayback } = usePodcast();

  if (!channel) return null;

  const formatDuration = (ms: bigint) => {
    const totalSeconds = Number(ms) / 1000;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (ms: bigint) => {
    return new Date(Number(ms)).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Channel Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-end border-b border-zinc-800 pb-8">
        <div className="w-48 h-48 bg-zinc-800 rounded-3xl shadow-2xl flex-shrink-0 flex items-center justify-center border border-zinc-700/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 mix-blend-overlay"></div>
          <span className="text-zinc-500 font-black tracking-widest text-xs uppercase z-10 bg-zinc-900/80 px-3 py-1 rounded-full backdrop-blur-sm">
            Avatar CID
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            {channel.categories.map((cat: string) => (
              <span key={cat} className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700/50">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{channel.name}</h1>
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
            <span className="text-blue-400">{channel.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
               <CheckCircle2 size={14} className="text-emerald-500" />
               Verified Channel
            </span>
          </div>
          <p className="text-zinc-400 max-w-2xl leading-relaxed font-medium">
            {channel.bio}
          </p>
        </div>
      </div>

      {/* Episode List */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white tracking-tight mb-6">Episodes</h2>
        
        {episodes.map(({ cid, manifest }, index) => {
          const isCurrent = currentEpisode?.manifest.title === manifest.title;
          
          return (
            <div 
              key={index}
              onClick={() => onSelectEpisode(cid, manifest)}
              className={`group flex items-center gap-6 p-4 rounded-2xl transition-all cursor-pointer border ${
                isCurrent 
                  ? 'bg-zinc-900 border-zinc-700 shadow-lg' 
                  : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800'
              }`}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrent) {
                    togglePlayback();
                  } else {
                    playEpisode(cid, manifest);
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'
                }`}
                aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
              >
                {isCurrent && isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="ml-1 fill-current" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg truncate ${isCurrent ? 'text-blue-400' : 'text-zinc-100 group-hover:text-white'}`}>
                  {manifest.title}
                </h3>
                <p className="text-zinc-500 text-sm truncate font-medium">
                  {manifest.summary}
                </p>
              </div>
              
              <div className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(manifest.publishedAtMs)}
                </div>
                <div className="flex items-center gap-2 w-20 justify-end">
                  <Clock size={14} />
                  {formatDuration(manifest.durationMs)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
