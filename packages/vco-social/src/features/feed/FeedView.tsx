import React, { useState } from 'react';
import { useSocial } from '../SocialContext';
import { PostCard } from './PostCard';
import { ComposePost } from './ComposePost';
import { ThreadView } from './ThreadView';
import { SwatchBook, X, Loader2 } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

export function FeedView() {
  const { feed, isLoading, filter, setFilter, activeThread, setActiveThread, loadMoreFeed, hasMoreFeed } = useSocial();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
        <SwatchBook className="text-zinc-800 w-16 h-16 mb-4" />
        <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Syncing Swarm Feed...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
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

      <div className="px-2">
        <ComposePost />
      </div>

      <div className="min-h-0">
        {feed.length > 0 ? (
          <Virtuoso
            useWindowScroll
            data={feed}
            endReached={loadMoreFeed}
            increaseViewportBy={200}
            itemContent={(index, item) => (
              <div className="pb-8 px-2">
                <PostCard 
                  key={`${item.cid.toString()}-${item.repostBy?.timestampMs || 'original'}`} 
                  data={item.data} 
                  authorProfile={item.authorProfile}
                  cid={item.cid} 
                  repostBy={item.repostBy}
                  onOpenThread={() => setActiveThread(item)}
                />
              </div>
            )}
            components={{
              Footer: () => hasMoreFeed ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-zinc-700 w-6 h-6" />
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-zinc-800 font-black uppercase tracking-tighter text-xs">End of Swarm History</p>
                </div>
              )
            }}
          />
        ) : (
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
