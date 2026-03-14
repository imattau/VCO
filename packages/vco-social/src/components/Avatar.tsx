import React, { useEffect, useState } from 'react';
import { vcoStore } from '@/lib/VcoStore';

interface AvatarProps {
  avatarCid: Uint8Array | undefined;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export function Avatar({ avatarCid, displayName, size = 'md', className = '' }: AvatarProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const resolve = async () => {
      if (!avatarCid || avatarCid.length === 0 || avatarCid.every(b => b === 0)) {
        setUrl(null);
        return;
      }
      const blob = await vcoStore.getBlob(avatarCid);
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } else {
        setUrl(null);
      }
    };
    resolve();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [avatarCid]);

  const base = `${sizeClasses[size]} rounded-full shrink-0 flex items-center justify-center font-black ${className}`;

  if (url) {
    return <img src={url} alt={displayName} className={`${sizeClasses[size]} rounded-full shrink-0 object-cover ${className}`} />;
  }

  return (
    <div className={`${base} bg-blue-600/20 border border-blue-500/20 text-blue-400`}>
      {displayName[0]}
    </div>
  );
}
