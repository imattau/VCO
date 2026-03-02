import React, { useState } from 'react';
import { useSocial } from '../SocialContext';
import { PostCard } from './PostCard';
import { ComposePost } from './ComposePost';
import { ThreadView } from './ThreadView';
import { SwatchBook } from 'lucide-react';
import { PostData } from '@vco/vco-schemas';

export function FeedView() {
  const { feed, isLoading, filter, setFilter, activeThread, setActiveThread } = useSocial();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
        <SwatchBook className="text-zinc-800 w-16 h-16 mb-4" />
        <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Syncing Swarm Feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Your Swarm</h2>
          <p className="text-zinc-500 text-xl font-medium">Synced in real-time across the VCO network.</p>
        </div>

        {filter && (
          <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-2xl animate-in slide-in-from-right-4 duration-300">
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Filter:</span>
             <span className="text-sm font-bold text-white italic">{filter.value}</span>
             <button 
               onClick={() => setFilter(null)}
               className="p-1 hover:bg-blue-500/20 rounded-lg text-blue-500 transition-all"
               aria-label="Clear filter"
             >
                <X size={14} />
             </button>
          </div>
        )}
      </div>

      <ComposePost />

      <div className="space-y-8 pb-20">
        {feed.length > 0 ? feed.map((item) => (
          <PostCard 
            key={item.cid.toString()} 
            data={item.data} 
            authorProfile={item.authorProfile}
            cid={item.cid} 
            onOpenThread={() => setActiveThread(item)}
          />
        )) : (
          <div className="py-20 text-center space-y-4">
             <p className="text-zinc-600 font-black uppercase tracking-widest">No objects found in this range</p>
             <button onClick={() => setFilter(null)} className="text-blue-500 font-bold hover:underline">Clear all filters</button>
          </div>
        )}
      </div>

      {activeThread && (
        <ThreadView 
          parentPost={activeThread} 
          onClose={() => setActiveThread(null)} 
        />
      )}
    </div>
  );
}

import { X } from 'lucide-react';
