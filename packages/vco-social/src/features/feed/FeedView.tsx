import React, { useState } from 'react';
import { useSocial } from '../SocialContext';
import { PostCard } from './PostCard';
import { ComposePost } from './ComposePost';
import { ThreadView } from './ThreadView';
import { SwatchBook } from 'lucide-react';
import { PostData } from '@vco/vco-schemas';

export function FeedView() {
  const { feed, isLoading } = useSocial();
  const [activeThread, setActiveThread] = useState<{ data: PostData; cid: Uint8Array } | null>(null);

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
      <div className="space-y-2 mb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter italic">Your Swarm</h2>
        <p className="text-zinc-500 text-xl font-medium">Synced in real-time across the VCO network.</p>
      </div>

      <ComposePost />

      <div className="space-y-8 pb-20">
        {feed.map((item) => (
          <PostCard 
            key={item.cid.toString()} 
            data={item.data} 
            cid={item.cid} 
            onOpenThread={() => setActiveThread(item)}
          />
        ))}
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
