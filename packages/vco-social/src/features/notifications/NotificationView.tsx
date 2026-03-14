import React from 'react';
import { useSocial } from '../SocialContext';
import { Bell, Heart, MessageSquare, UserPlus, Zap, SwatchBook } from 'lucide-react';
import { NotificationType } from '@vco/vco-schemas';
import { toHex } from '@/lib/encoding';

export function NotificationView() {
  const { notifications, markNotificationAsRead, navigateToPost, navigateToPeer, peerProfiles, setActiveTab } = useSocial();

  const handleNotificationClick = (n: any) => {
    markNotificationAsRead(n.targetCid);
    
    if (n.type === NotificationType.POST_REPLY || n.type === NotificationType.REACTION) {
      navigateToPost(n.targetCid);
    } else if (n.type === NotificationType.DM) {
      const creatorIdHex = toHex(n.actorCid);
      const profile = peerProfiles.get(creatorIdHex);
      navigateToPeer(profile?.displayName || creatorIdHex);
    } else if (n.type === NotificationType.FOLLOW) {
      setActiveTab('profile');
    }
  };

  const getActorName = (actorCid: Uint8Array) => {
    const hex = toHex(actorCid);
    const profile = peerProfiles.get(hex);
    return profile?.displayName || `Peer ${hex.substring(0, 6)}`;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="space-y-2 mb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Notifications</h2>
        <p className="text-zinc-500 text-xl font-medium">Real-time sync events from the VCO network.</p>
      </div>

      {notifications.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
           {notifications.map((n, i) => (
             <NotificationItem 
               key={i} 
               type={n.type} 
               actor={getActorName(n.actorCid)}
               content={n.summary.split(' ').slice(1).join(' ')} 
               time={new Date(Number(n.timestampMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               onClick={() => handleNotificationClick(n)}
             />
           ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl">
           <div className="w-20 h-20 rounded-[2rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700 shadow-inner">
              <Bell size={32} />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tighter italic uppercase">All clear in the swarm</h3>
              <p className="text-zinc-500 text-sm font-medium">No new sync events detected on your monitored channels.</p>
           </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ type, actor, content, time, onClick }: any) {
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
    <div 
      onClick={onClick}
      className="p-6 border-b border-zinc-800 hover:bg-zinc-800/30 transition-all flex items-center gap-6 group cursor-pointer"
    >
       <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all shadow-inner text-zinc-400 group-hover:text-white">
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
