import React, { useState } from 'react';
import { PodcastProvider, usePodcast } from '@/features/player/PodcastContext';
import ChannelFeed from '@/features/feed/ChannelFeed';
import EpisodeDetail from '@/features/feed/EpisodeDetail';
import StudioView from '@/features/studio/StudioView';
import MiniPlayer from '@/features/player/MiniPlayer';
import { Headphones, Loader2, Library, Settings, Mic2 } from 'lucide-react';
import { MediaManifestData } from '@vco/vco-schemas';

export type AppTab = 'search' | 'studio';

function MainApp() {
  const { isLoading, channel } = usePodcast();
  const [activeTab, setActiveTab] = useState<AppTab>('search');
  const [selectedEpisode, setSelectedEpisode] = useState<{cid: Uint8Array, manifest: MediaManifestData} | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Syncing Channel Manifest...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 flex-col items-center justify-center">
        <p className="text-red-500 font-bold uppercase tracking-widest text-xs">Failed to load channel data.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans text-sm md:text-base">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0 z-10">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Headphones className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white italic">VCO Player</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 px-2 mt-4">Consumer</div>
          
          <button 
            onClick={() => { setActiveTab('search'); setSelectedEpisode(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
              activeTab === 'search' ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-800/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Library size={18} className={activeTab === 'search' ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
            Subscriptions
          </button>
          
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 px-2 mt-8">Creator</div>
          <button 
            onClick={() => { setActiveTab('studio'); setSelectedEpisode(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
              activeTab === 'studio' ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-800/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Mic2 size={18} className={activeTab === 'studio' ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
            Creator Studio
          </button>
        </nav>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all">
            <Settings size={14} />
            Network Settings
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
         {/* Top Header Strip */}
         <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black text-zinc-400 tracking-widest uppercase">
              {activeTab === 'search' ? 'Decentralized Media Stream' : 'VCO Creator Studio'}
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             Sync Active
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            {activeTab === 'studio' ? (
              <StudioView />
            ) : selectedEpisode ? (
              <EpisodeDetail 
                manifest={selectedEpisode.manifest} 
                cid={selectedEpisode.cid}
                onBack={() => setSelectedEpisode(null)} 
              />
            ) : (
              <ChannelFeed 
                onSelectEpisode={(cid, manifest) => setSelectedEpisode({cid, manifest})} 
              />
            )}
          </div>
        </div>
        <MiniPlayer />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PodcastProvider>
      <MainApp />
    </PodcastProvider>
  );
}
