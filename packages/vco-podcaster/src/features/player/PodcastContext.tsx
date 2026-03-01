import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MediaChannelData, MediaManifestData } from '@vco/vco-schemas';
import { MockMediaService } from '@/lib/MockMediaService';

interface PodcastContextType {
  channel: MediaChannelData | null;
  episodes: { cid: Uint8Array, manifest: MediaManifestData }[];
  currentEpisode: { cid: Uint8Array, manifest: MediaManifestData, url?: string } | null;
  isPlaying: boolean;
  isLoading: boolean;
  playEpisode: (cid: Uint8Array, manifest: MediaManifestData) => Promise<void>;
  togglePlayback: () => void;
  updateChannel: (data: Partial<MediaChannelData>) => Promise<void>;
  publishEpisode: (manifest: Omit<MediaManifestData, 'schema' | 'publishedAtMs' | 'previousItemCid'>, file: Blob) => Promise<void>;
  createChannel: (data: Omit<MediaChannelData, 'schema' | 'latestItemCid' | 'isLive'>) => Promise<void>;
  resetChannel: () => Promise<void>;
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export function PodcastProvider({ children }: { children: ReactNode }) {
  const [channel, setChannel] = useState<MediaChannelData | null>(null);
  const [episodes, setEpisodes] = useState<{ cid: Uint8Array, manifest: MediaManifestData }[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<{ cid: Uint8Array, manifest: MediaManifestData, url?: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap the app by loading the default channel
  const loadChannel = async () => {
    setIsLoading(true);
    try {
      const channelCid = MockMediaService.getDefaultChannelCid();
      const ch = await MockMediaService.getChannel(channelCid);
      
      if (ch) {
        setChannel(ch);
        const history = await MockMediaService.getChannelHistory(ch.latestItemCid);
        setEpisodes(history);
      } else {
        setChannel(null);
        setEpisodes([]);
      }
    } catch (err) {
      console.error("Failed to bootstrap podcast data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChannel();
  }, []);

  const playEpisode = async (cid: Uint8Array, manifest: MediaManifestData) => {
    // Revoke old URL if it exists to prevent memory leaks
    if (currentEpisode?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentEpisode.url);
    }

    const url = await MockMediaService.getMediaUrl(manifest.contentCid) || undefined;
    setCurrentEpisode({ cid, manifest, url });
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (currentEpisode) {
      setIsPlaying(!isPlaying);
    }
  };

  const updateChannel = async (data: Partial<MediaChannelData>) => {
    if (!channel) return;
    const updated = { ...channel, ...data };
    await MockMediaService.updateChannel(MockMediaService.getDefaultChannelCid(), updated);
    setChannel(updated);
  };

  const createChannel = async (data: Omit<MediaChannelData, 'schema' | 'latestItemCid' | 'isLive'>) => {
    const { channel: newChannel } = await MockMediaService.createChannel(data);
    setChannel(newChannel);
    setEpisodes([]);
  };

  const resetChannel = async () => {
    MockMediaService.resetSession();
    await loadChannel();
  };

  const publishEpisode = async (
    episodeData: Omit<MediaManifestData, 'schema' | 'publishedAtMs' | 'previousItemCid'>, 
    file: Blob
  ) => {
    if (!channel) return;

    // 1. Store the media file
    const contentCid = await MockMediaService.storeMedia(file);

    // 2. Create the manifest
    const manifest: MediaManifestData = {
      ...episodeData,
      contentCid,
      schema: 'vco://schemas/media/manifest/v1',
      publishedAtMs: BigInt(Date.now()),
      previousItemCid: channel.latestItemCid
    };

    // 3. Publish manifest
    const manifestCid = await MockMediaService.publishManifest(manifest);

    // 4. Update channel to point to new manifest
    const updatedChannel = {
      ...channel,
      latestItemCid: manifestCid
    };
    await MockMediaService.updateChannel(MockMediaService.getDefaultChannelCid(), updatedChannel);
    
    // 5. Reload to reflect changes
    await loadChannel();
  };

  return (
    <PodcastContext.Provider value={{
      channel,
      episodes,
      currentEpisode,
      isPlaying,
      isLoading,
      playEpisode,
      togglePlayback,
      updateChannel,
      publishEpisode,
      createChannel,
      resetChannel
    }}>
      {children}
    </PodcastContext.Provider>
  );
}

export function usePodcast() {
  const context = useContext(PodcastContext);
  if (context === undefined) {
    throw new Error('usePodcast must be used within a PodcastProvider');
  }
  return context;
}
