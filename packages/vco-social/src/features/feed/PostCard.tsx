import React from 'react';
import { PostData } from '@vco/vco-schemas';
import { MessageSquare, Repeat2, Heart, Share, MoreHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { twMerge } from 'tailwind-merge';
import { MediaGallery } from './MediaGallery';

interface PostCardProps {
  data: PostData;
  cid: Uint8Array;
  onOpenThread?: () => void;
}

export function PostCard({ data, onOpenThread }: PostCardProps) {
  const relativeTime = new Intl.RelativeTimeFormat('en', { style: 'short' });
  const timeStr = relativeTime.format(
    Math.round((Number(data.timestampMs) - Date.now()) / 60000), 
    'minute'
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 hover:border-zinc-700 transition-all group shadow-xl shadow-black/20 cursor-pointer" onClick={onOpenThread}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">
            {/* Mock initial */}
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tight">Alice</span>
              <span className="text-zinc-500 text-xs font-bold">@alice.vco</span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{timeStr}</span>
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">did:vco:1234...5678</div>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-white transition-colors" aria-label="More options">
          <MoreHorizontal size={20} />
        </button>
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
        <ActionButton icon={<MessageSquare size={18} />} count={12} color="group-hover:text-blue-500" label="Reply to post" />
        <ActionButton icon={<Repeat2 size={18} />} count={5} color="group-hover:text-emerald-500" label="Repost" />
        <ActionButton icon={<Heart size={18} />} count={42} color="group-hover:text-rose-500" label="Like post" />
        <ActionButton icon={<Share size={18} />} color="group-hover:text-blue-500" label="Share post" />
      </div>
    </div>
  );
}

function ActionButton({ icon, count, color, label }: { icon: React.ReactNode, count?: number, color: string, label: string }) {
  return (
    <button className={twMerge("flex items-center gap-2 text-zinc-500 transition-all", color)} aria-label={label}>
      <div className="p-2 rounded-full hover:bg-zinc-800 transition-all">
        {icon}
      </div>
      {count !== undefined && <span className="text-xs font-black tracking-widest">{count}</span>}
    </button>
  );
}
