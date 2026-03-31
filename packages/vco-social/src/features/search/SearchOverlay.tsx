import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Hash, Users, Activity, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useSocial } from '../SocialContext';
import { useToast } from '../../components/ToastProvider';
import { SearchLogic } from '../../lib/SearchLogic';

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const { setFilter, resolvePeerProfile, peerProfiles, feed } = useSocial();
  const { toast } = useToast();

  // Close overlay on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [overlayRef]);

  const handleTagClick = (tag: string) => {
    setFilter({ type: 'tag', value: tag });
    toast(`Filtering swarm feed for ${tag}`, "info");
    setIsOpen(false);
    setQuery('');
  };

  const handlePeerClick = (name: string, creatorIdHex: string) => {
    setFilter({ type: 'peer', value: name });
    resolvePeerProfile(creatorIdHex);
    setIsOpen(false);
    setQuery('');
  };

  // Derive trending tags from feed
  const trendingTags = useMemo(() => 
    SearchLogic.deriveTrendingTags(feed), 
  [feed]);

  // Filter peers from state
  const foundPeers = useMemo(() => 
    SearchLogic.filterPeers(peerProfiles, query), 
  [peerProfiles, query]);

  return (
    <div className="relative max-w-md w-full hidden md:block" ref={overlayRef}>
      <div className="relative z-20">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search social swarm..." 
          className={twMerge(
            "w-full bg-zinc-900 border border-zinc-800 py-1.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-all shadow-inner",
            isOpen ? "rounded-t-2xl border-b-zinc-800" : "rounded-full"
          )}
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-zinc-900 border border-zinc-800 border-t-0 rounded-b-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto custom-scrollbar">
           {!query ? (
             <div className="p-4 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Trending in the Swarm</div>
                <div className="space-y-1">
                   {trendingTags.length > 0 ? trendingTags.map(tag => (
                     <button 
                       key={tag} 
                       onClick={() => handleTagClick(tag)}
                       className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors text-left group"
                     >
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-blue-500 group-hover:border-blue-500/30">
                           <Activity size={14} />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-white">{tag}</div>
                           <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Active Swarm Topic</div>
                        </div>
                     </button>
                   )) : (
                     <p className="text-[10px] text-zinc-600 px-2 italic uppercase">Waiting for swarm activity...</p>
                   )}
                </div>
             </div>
           ) : (
             <div className="p-4 space-y-6">
                {/* Users Results */}
                <div className="space-y-2">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 px-2">
                      <Users size={12} /> Known Peers
                   </div>
                   {foundPeers.length > 0 ? foundPeers.map(user => (
                     <button 
                       key={user.creatorId} 
                       onClick={() => handlePeerClick(user.name, user.creatorId)}
                       className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors text-left"
                     >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white shrink-0">
                           {user.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-bold text-white truncate">{user.name}</div>
                           <div className="text-[10px] text-zinc-500 font-mono truncate">{user.creatorId}</div>
                        </div>
                     </button>
                   )) : (
                     <div className="px-2 py-4 text-center border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-[10px] text-zinc-600 italic mb-2">No locally known peers found</p>
                        <button 
                          onClick={() => handlePeerClick(query, query)}
                          className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                        >
                           Force Resolve CID: {query.substring(0,8)}...
                        </button>
                     </div>
                   )}
                </div>

                {/* Tags Results */}
                <div className="space-y-2">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 px-2">
                      <Hash size={12} /> Topics
                   </div>
                   <button 
                     onClick={() => handleTagClick(query)}
                     className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors text-left group"
                   >
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-500">
                         <Hash size={14} />
                      </div>
                      <div className="text-sm font-bold text-white">
                         Filter swarm by "{query}"
                      </div>
                   </button>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
