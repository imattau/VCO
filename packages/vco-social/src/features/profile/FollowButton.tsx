import React, { useState } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useToast } from '../../components/ToastProvider';

interface FollowButtonProps {
  did: string;
  initialState?: boolean;
}

export function FollowButton({ did, initialState = false }: FollowButtonProps) {
  const { following, followPeer, unfollowPeer } = useSocial();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isFollowing = following.has(did);

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      if (isFollowing) {
        await unfollowPeer(did);
      } else {
        await followPeer(did);
      }
    } catch (err) {
      console.error("Failed to toggle follow status", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={twMerge(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
        isProcessing && "opacity-50 cursor-not-allowed",
        isFollowing 
          ? "bg-zinc-800 text-white hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 border border-zinc-700" 
          : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-0.5 border border-transparent"
      )}
    >
      {isProcessing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isFollowing ? (
        <UserMinus size={16} />
      ) : (
        <UserPlus size={16} />
      )}
      
      {isProcessing ? (
        "Syncing..."
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </button>
  );
}

import { useSocial } from '../SocialContext';
