import React, { useState, useRef } from 'react';
import { PostData, ProfileData } from '@vco/vco-schemas';
import { X, MessageSquare, Repeat2, Heart, Share, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';
import { useSocial } from '../SocialContext';
import { MediaGallery } from './MediaGallery';
import { toHex } from '@/lib/encoding';

interface ThreadViewProps {
  parentPost: { data: PostData; cid: Uint8Array; authorProfile: ProfileData } | null;
  onClose: () => void;
}

export function ThreadView({ parentPost, onClose }: ThreadViewProps) {
  const { replies, reactions, reposts, createReply, reactToPost, repost, identity } = useSocial();
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);

  if (!parentPost) return null;

  const cidHex = toHex(parentPost.cid);
  const threadReplies = replies.filter(r => toHex(r.data.parentCid) === cidHex);
  const repostCount = reposts.get(cidHex)?.size ?? 0;
  const likeCount = reactions.get(cidHex)?.size ?? 0;
  const hasLiked = identity ? (reactions.get(cidHex)?.has(toHex(identity.creatorId)) ?? false) : false;
  const hasReposted = identity ? (reposts.get(cidHex)?.has(toHex(identity.creatorId)) ?? false) : false;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await createReply(parentPost.cid, replyText);
    setReplyText('');
    setIsSubmitting(false);
  };

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
                    {parentPost.authorProfile.displayName[0]}
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <span className="font-black text-white text-lg tracking-tight">{parentPost.authorProfile.displayName}</span>
                       <span className="text-zinc-500 text-sm font-bold">@{parentPost.authorProfile.displayName.split(' ')[0].toLowerCase()}.vco</span>
                    </div>
                    <div className="text-xs text-zinc-600 font-mono flex items-center gap-1">
                       <Shield size={10} className="text-emerald-500" />
                       did:vco:{toHex(parentPost.authorProfile.encryptionPubkey || new Uint8Array(4)).substring(0,8)}...
                    </div>
                 </div>
              </div>

              <div className="prose prose-invert prose-zinc max-w-none text-zinc-100 text-lg leading-relaxed font-medium mb-6">
                 <ReactMarkdown>
                    {parentPost.data.content}
                 </ReactMarkdown>
              </div>

              <MediaGallery mediaCids={parentPost.data.mediaCids} />

              <div className="flex items-center gap-4 text-xs font-black text-zinc-500 uppercase tracking-widest border-t border-zinc-800/50 pt-4 mb-4 mt-6">
                 <span>{threadReplies.length} Replies</span>
                 <span>{repostCount} Reposts</span>
                 <span>{likeCount} Likes</span>
              </div>

              <div className="flex items-center justify-around py-2">
                 <ActionButton icon={<MessageSquare size={20} />} color="hover:text-blue-500 hover:bg-blue-500/10" label="Reply" onClick={() => replyInputRef.current?.focus()} />
                 <ActionButton icon={<Repeat2 size={20} />} color={hasReposted ? "text-emerald-500" : "hover:text-emerald-500 hover:bg-emerald-500/10"} label="Repost" onClick={() => repost(parentPost.cid)} />
                 <ActionButton icon={<Heart size={20} />} color={hasLiked ? "text-rose-500" : "hover:text-rose-500 hover:bg-rose-500/10"} label="Like" onClick={() => reactToPost(parentPost.cid)} />
                 <ActionButton icon={<Share size={20} />} color="hover:text-blue-500 hover:bg-blue-500/10" label="Share" onClick={() => navigator.clipboard.writeText(cidHex)} />
              </div>
           </div>

           {/* Replies Area */}
           <div className="p-6 space-y-8">
              {threadReplies.length > 0 ? threadReplies.map(reply => (
                 <div key={toHex(reply.cid)} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 shrink-0">
                       {reply.authorProfile.displayName[0]}
                    </div>
                    <div className="flex-1 space-y-1.5">
                       <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm tracking-tight italic">{reply.authorProfile.displayName}</span>
                          <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                             {new Date(Number(reply.data.timestampMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <div className="prose prose-invert prose-zinc prose-sm text-zinc-300 leading-relaxed font-medium">
                          <ReactMarkdown>{reply.data.content}</ReactMarkdown>
                       </div>
                       <div className="flex items-center gap-6 pt-2">
                          <button className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-500 transition-colors" aria-label="Reply">
                             <MessageSquare size={14} />
                          </button>
                          <button className="flex items-center gap-1.5 text-zinc-500 hover:text-rose-500 transition-colors" aria-label="Like">
                             <Heart size={14} />
                             <span className="text-[10px] font-black">0</span>
                          </button>
                       </div>
                    </div>
                 </div>
              )) : (
                <div className="py-10 text-center space-y-2">
                   <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No replies found in swarm</p>
                   <p className="text-zinc-700 text-[10px] italic">Replies to decentralized objects may take time to reconcile.</p>
                </div>
              )}
           </div>
        </div>

        {/* Compose Reply Input */}
        <form onSubmit={handleReply} className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
           <input 
             type="text" 
             value={replyText}
             onChange={e => setReplyText(e.target.value)}
             disabled={isSubmitting}
             ref={replyInputRef}
             placeholder="Post your reply to the swarm..."
             className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 px-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner disabled:opacity-50"
           />
        </form>
      </div>
    </div>
  );
}

function ActionButton({ icon, color, label, onClick }: { icon: React.ReactNode, color: string, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={twMerge("p-2.5 rounded-xl text-zinc-500 transition-all", color)} aria-label={label}>
      {icon}
    </button>
  );
}
