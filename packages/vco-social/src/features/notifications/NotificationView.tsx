import React from 'react';
import { useSocial } from '../SocialContext';
import { Bell, Heart, MessageSquare, UserPlus, Zap, SwatchBook } from 'lucide-react';
import { NotificationType } from '@vco/vco-schemas';

export function NotificationView() {
  const { notifications } = useSocial();

  const mockNotifications = [
    { type: NotificationType.POST_REPLY, actor: "Bob", content: "replied to your post", time: "2m ago" },
    { type: NotificationType.REACTION, actor: "Alice", content: "liked your post", time: "15m ago" },
    { type: NotificationType.FOLLOW, actor: "Charlie", content: "started following you", time: "1h ago" },
    { type: NotificationType.DM, actor: "Dave", content: "sent you a direct message", time: "2h ago" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="space-y-2 mb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter italic">Notifications</h2>
        <p className="text-zinc-500 text-xl font-medium">Real-time sync events from the VCO network.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
         {mockNotifications.map((n, i) => (
           <NotificationItem key={i} {...n} />
         ))}
      </div>
    </div>
  );
}

function NotificationItem({ type, actor, content, time }: any) {
  const getIcon = () => {
    switch (type) {
      case NotificationType.POST_REPLY: return <MessageSquare className="text-blue-500" size={20} />;
      case NotificationType.REACTION: return <Heart className="text-rose-500" size={20} />;
      case NotificationType.FOLLOW: return <UserPlus className="text-emerald-500" size={20} />;
      case NotificationType.DM: return <Zap className="text-amber-500" size={20} />;
      default: return <Bell className="text-zinc-500" size={20} />;
    }
  };

  return (
    <div className="p-6 border-b border-zinc-800 hover:bg-zinc-800/30 transition-all flex items-center gap-6 group">
       <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all shadow-inner">
          {getIcon()}
       </div>
       <div className="flex-1">
          <div className="flex items-center gap-2">
             <span className="font-black text-white text-lg tracking-tight italic">{actor}</span>
             <span className="text-zinc-500 font-medium">{content}</span>
          </div>
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{time}</span>
       </div>
       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
    </div>
  );
}
