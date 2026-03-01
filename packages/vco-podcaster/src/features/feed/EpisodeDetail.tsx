import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MediaManifestData } from '@vco/vco-schemas';
import { ArrowLeft, Play, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { usePodcast } from '@/features/player/PodcastContext';

interface EpisodeDetailProps {
  manifest: MediaManifestData;
  cid: Uint8Array;
  onBack: () => void;
}

export default function EpisodeDetail({ manifest, cid, onBack }: EpisodeDetailProps) {
  const { currentEpisode, isPlaying, playEpisode, togglePlayback } = usePodcast();
  const isCurrent = currentEpisode?.manifest.title === manifest.title;

  const formatDuration = (ms: bigint) => {
    const totalSeconds = Number(ms) / 1000;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (ms: bigint) => {
    return new Date(Number(ms)).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-24">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </button>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl -z-10 rounded-full"></div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-zinc-950 rounded-2xl flex-shrink-0 flex items-center justify-center border border-zinc-800 shadow-inner">
             <span className="text-zinc-600 font-black tracking-widest text-[10px] uppercase text-center px-4">
                Thumbnail<br/>CID
             </span>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
               <div className="flex items-center gap-3 mb-3">
                  <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {manifest.contentType}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                     <ShieldCheck size={12} />
                     Verified Schema
                  </span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">{manifest.title}</h2>
               <p className="text-zinc-400 text-lg leading-relaxed font-medium">{manifest.summary}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => isCurrent ? togglePlayback() : playEpisode(cid, manifest)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-600/20 active:translate-y-0.5 flex items-center gap-3"
              >
                <Play size={18} className="fill-current" />
                {isCurrent && isPlaying ? 'Pause Episode' : 'Play Episode'}
              </button>
              
              <div className="flex items-center gap-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-zinc-600" />
                  {formatDate(manifest.publishedAtMs)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-zinc-600" />
                  {formatDuration(manifest.durationMs)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8">
        <h3 className="text-xl font-black text-white tracking-tight mb-6 border-b border-zinc-800 pb-4">Show Notes</h3>
        
        {/* Security boundary: react-markdown sanitizes by default, preventing XSS from the manifest's show_notes */}
        <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-400 hover:prose-a:text-blue-300">
          <ReactMarkdown>{manifest.showNotes}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
