import React from 'react';
import { PostData } from '@vco/vco-schemas';
import { X, MessageSquare, Repeat2, Heart, Share, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';

interface ThreadViewProps {
  parentPost: { data: PostData; cid: Uint8Array } | null;
  onClose: () => void;
}

export function ThreadView({ parentPost, onClose }: ThreadViewProps) {
  if (!parentPost) return null;

  const mockReplies = [
    {
      id: 'reply-1',
      author: 'Verifiable Bob',
      did: 'did:vco:bob...223',
      content: 'Absolutely! The swarm architecture makes this so much more resilient.',
      time: '12m ago',
      likes: 5
    },
    {
      id: 'reply-2',
      author: 'Crypto Charlie',
      did: 'did:vco:char...991',
      content: 'What hash algorithm are we using for these manifests? Is it Blake3?',
      time: '5m ago',
      likes: 2
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full md:w-[600px] h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10">
          <h2 className="text-xl font-black text-white tracking-tighter italic uppercase">Thread</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
            aria-label="Close thread"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {/* Parent Post (Expanded) */}
           <div className="p-6 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-400">
                    A
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <span className="font-black text-white text-lg tracking-tight">Alice</span>
                       <span className="text-zinc-500 text-sm font-bold">@alice.vco</span>
                    </div>
                    <div className="text-xs text-zinc-600 font-mono flex items-center gap-1">
                       <Shield size={10} className="text-emerald-500" />
                       did:vco:1234...5678
                    </div>
                 </div>
              </div>

              <div className="prose prose-invert prose-zinc max-w-none text-zinc-100 text-lg leading-relaxed font-medium mb-6">
                 <ReactMarkdown>
                    {parentPost.data.content}
                 </ReactMarkdown>
              </div>

              <div className="flex items-center gap-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-t border-zinc-800/50 pt-4 mb-4">
                 <span>12 Replies</span>
                 <span>5 Reposts</span>
                 <span>42 Likes</span>
              </div>

              <div className="flex items-center justify-around py-2">
                 <ActionButton icon={<MessageSquare size={20} />} color="hover:text-blue-500 hover:bg-blue-500/10" label="Reply" />
                 <ActionButton icon={<Repeat2 size={20} />} color="hover:text-emerald-500 hover:bg-emerald-500/10" label="Repost" />
                 <ActionButton icon={<Heart size={20} />} color="hover:text-rose-500 hover:bg-rose-500/10" label="Like" />
                 <ActionButton icon={<Share size={20} />} color="hover:text-blue-500 hover:bg-blue-500/10" label="Share" />
              </div>
           </div>

           {/* Replies Area */}
           <div className="p-6 space-y-6">
              {mockReplies.map(reply => (
                 <div key={reply.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 shrink-0">
                       {reply.author[0]}
                    </div>
                    <div className="flex-1 space-y-1.5">
                       <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm tracking-tight">{reply.author}</span>
                          <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{reply.time}</span>
                       </div>
                       <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                          {reply.content}
                       </p>
                       <div className="flex items-center gap-6 pt-2">
                          <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 transition-colors" aria-label="Reply">
                             <MessageSquare size={14} />
                          </button>
                          <button className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-500 transition-colors" aria-label="Like">
                             <Heart size={14} />
                             <span className="text-[10px] font-black">{reply.likes}</span>
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Compose Reply Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
           <input 
             type="text" 
             placeholder="Post your reply to the swarm..." 
             className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 px-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
           />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, color, label }: { icon: React.ReactNode, color: string, label: string }) {
  return (
    <button className={twMerge("p-2.5 rounded-xl text-zinc-500 transition-all", color)} aria-label={label}>
      {icon}
    </button>
  );
}
