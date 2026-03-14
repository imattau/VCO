import React, { useState, useMemo } from 'react';
import { PostData, ProfileData } from '@vco/vco-schemas';
import { MessageSquare, Repeat2, Heart, Share, MoreHorizontal, Trash2, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';
import { MediaGallery } from './MediaGallery';
import { useSocial } from '../SocialContext';
import { ReportDialog } from '../moderation/ReportDialog';
import { toHex } from '@vco/vco-testing';

interface PostCardProps {
  data: PostData;
  authorProfile: ProfileData;
  cid: Uint8Array;
  onOpenThread?: () => void;
}

export function PostCard({ data, authorProfile, onOpenThread, cid }: PostCardProps) {
  const { reactToPost, repost, deletePost, publishReport, reactions, reposts, replies, identity } = useSocial();
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const hexCid = useMemo(() => toHex(cid), [cid]);
  
  const replyCount = useMemo(() => 
    replies.filter(r => toHex(r.data.parentCid) === hexCid).length,
  [replies, hexCid]);

  const reactionSet = reactions.get(hexCid);
  const reactionCount = reactionSet?.size || 0;
  const isLiked = identity ? reactionSet?.has(identity.creatorIdHex) : false;

  const repostSet = reposts.get(hexCid);
  const repostCount = repostSet?.size || 0;
  const isReposted = identity ? repostSet?.has(identity.creatorIdHex) : false;

  const relativeTime = new Intl.RelativeTimeFormat('en', { style: 'short' });
  const timeStr = relativeTime.format(
    Math.round((Number(data.timestampMs) - Date.now()) / 60000), 
    'minute'
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-zinc-700 transition-all group shadow-xl shadow-black/20 cursor-pointer relative" onClick={onOpenThread}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">
            {authorProfile.displayName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tight">{authorProfile.displayName}</span>
              <span className="text-zinc-500 text-xs font-bold">@{authorProfile.displayName.split(' ')[0].toLowerCase()}.vco</span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{timeStr}</span>
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">did:vco:{Array.from(authorProfile.encryptionPubkey || new Uint8Array(4)).map(b => b.toString(16).padStart(2,'0')).join('').substring(0,8)}...</div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            className={twMerge(
              "p-2 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all",
              showMenu && "text-white bg-zinc-800"
            )}
            aria-label="More options"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
               <button 
                 onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowReport(true); }}
                 className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
               >
                  <ShieldAlert size={16} />
                  Report Post
               </button>
               <button 
                 onClick={(e) => { 
                   e.stopPropagation(); 
                   deletePost(cid);
                   setShowMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
               >
                  <Trash2 size={16} />
                  Delete (Tombstone)
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none text-zinc-200 leading-relaxed font-medium">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="m-0">{children}</p>,
            a: ({ children, href }) => <a href={href} className="text-blue-500 no-underline hover:underline">#{children}</a>
          }}
        >
          {data.content}
        </ReactMarkdown>
      </div>

      <MediaGallery mediaCids={data.mediaCids} />

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
        <ActionButton 
          icon={<MessageSquare size={18} />} 
          count={replyCount > 0 ? replyCount : undefined}
          color="group-hover:text-blue-500" 
          label="Reply to post" 
          onClick={(e) => { e.stopPropagation(); onOpenThread?.(); }}
        />
        <ActionButton 
          icon={<Repeat2 size={18} />} 
          count={repostCount > 0 ? repostCount : undefined}
          active={isReposted}
          color="group-hover:text-emerald-500" 
          activeColor="text-emerald-500"
          label="Repost" 
          onClick={(e) => { e.stopPropagation(); repost(cid); }}
        />
        <ActionButton 
          icon={<Heart size={18} className={isLiked ? "fill-current" : ""} />} 
          count={reactionCount > 0 ? reactionCount : undefined}
          active={isLiked}
          color="group-hover:text-rose-500" 
          activeColor="text-rose-500"
          label="Like post" 
          onClick={(e) => { e.stopPropagation(); reactToPost(cid); }}
        />
        <ActionButton 
          icon={<Share size={18} />} 
          color="group-hover:text-blue-500" 
          label="Share post" 
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {showReport && (
        <ReportDialog 
          targetCid={cid} 
          onClose={() => setShowReport(false)} 
          onReportPublished={(reason) => publishReport(cid, reason)}
        />
      )}
    </div>
  );
}

function ActionButton({ icon, count, color, activeColor, active, label, onClick }: { 
  icon: React.ReactNode, 
  count?: number, 
  color: string, 
  activeColor?: string,
  active?: boolean,
  label: string, 
  onClick?: (e: React.MouseEvent) => void 
}) {
  return (
    <button 
      className={twMerge(
        "flex items-center gap-2 transition-all", 
        active ? (activeColor || "text-white") : "text-zinc-500",
        !active && color
      )} 
      aria-label={label} 
      onClick={onClick}
    >
      <div className={twMerge(
        "p-2 rounded-full transition-all",
        active ? "bg-white/5" : "hover:bg-zinc-800"
      )}>
        {icon}
      </div>
      {count !== undefined && <span className="text-xs font-black tracking-widest">{count}</span>}
    </button>
  );
}
