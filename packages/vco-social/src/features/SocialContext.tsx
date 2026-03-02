import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ProfileData, 
  PostData, 
  DirectMessageData, 
  NotificationData,
  NotificationType
} from '@vco/vco-schemas';
import { MockSocialService } from '@/lib/MockSocialService';
import { FeedService } from '@/lib/FeedService';
import { E2EEService } from '@/lib/E2EEService';
import { ProfileService } from '@/lib/ProfileService';
import { NotificationService } from '@/lib/NotificationService';
import { useToast } from '@/components/ToastProvider';
import { mockCid, toHex } from '@vco/vco-testing';

interface MessageWithMetadata {
  cid: Uint8Array;
  data: DirectMessageData;
  payload: { content: string; mediaCids: Uint8Array[] };
  isOwn: boolean;
}

interface Conversation {
  peerProfile: ProfileData;
  lastMessage: MessageWithMetadata;
  messages: MessageWithMetadata[];
  unread: number;
}

interface SocialContextType {
  profile: ProfileData | null;
  feed: { cid: Uint8Array, data: PostData }[];
  conversations: Conversation[];
  notifications: NotificationData[];
  tombstones: Set<string>; // Hex strings of deleted CIDs
  filter: { type: 'tag' | 'peer' | 'all'; value?: string } | null;
  isLoading: boolean;
  
  // Actions
  createPost: (content: string, mediaFiles?: File[]) => Promise<void>;
  sendDM: (recipientProfile: ProfileData, content: string) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  markNotificationAsRead: (cid: Uint8Array) => void;
  setFilter: (filter: { type: 'tag' | 'peer' | 'all'; value?: string } | null) => void;
  deletePost: (cid: Uint8Array) => Promise<void>;
  reactToPost: (cid: Uint8Array) => Promise<void>;
  repost: (cid: Uint8Array, commentary?: string) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [feed, setFeed] = useState<{ cid: Uint8Array, data: PostData }[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [tombstones, setTombstones] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<{ type: 'tag' | 'peer' | 'all'; value?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initial bootstrap simulation
    const bootstrap = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      
      const myProfile = MockSocialService.getMockProfile();
      setProfile(myProfile);
      setFeed(MockSocialService.getMockFeed());
      
      // Seed a mock conversation
      const bobProfile = {
        schema: "vco://schemas/identity/profile/v1",
        displayName: "Verifiable Bob",
        bio: "Core contributor. Swarm enthusiast.",
        avatarCid: mockCid("bob-avatar"),
        previousManifest: new Uint8Array(0),
        encryptionPubkey: mockCid("bob-enc-key")
      };

      const initialMsg: MessageWithMetadata = {
        cid: mockCid("initial-dm"),
        data: {
          schema: "vco://schemas/social/direct-message/v1",
          recipientCid: mockCid("alice"),
          senderCid: mockCid("bob"),
          ephemeralPubkey: mockCid("eph"),
          nonce: new Uint8Array(12),
          encryptedPayload: new Uint8Array(0),
          timestampMs: BigInt(Date.now() - 600000)
        },
        payload: { content: "Sounds good, Alice. E2EE DMs are live.", mediaCids: [] },
        isOwn: false
      };

      setConversations([{
        peerProfile: bobProfile,
        lastMessage: initialMsg,
        messages: [initialMsg],
        unread: 0
      }]);

      setNotifications([]);
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  // Filtered Feed Calculation
  const filteredFeed = feed.filter(item => {
    const hexCid = toHex(item.cid);
    if (tombstones.has(hexCid)) return false;

    if (!filter || filter.type === 'all') return true;
    if (filter.type === 'tag') {
      return (item.data.tags || []).includes(filter.value?.replace('#', '').toLowerCase() || '');
    }
    // TODO: peer filter logic when author CID is in feed
    return true;
  });

  // Simulated Real-time Swarm Loop
  useEffect(() => {
    if (isLoading || !profile) return;

    const interval = setInterval(() => {
      // 10% chance of a mock notification every 10 seconds
      if (Math.random() > 0.9) {
        const notif = NotificationService.generateNotification(
          NotificationType.REACTION,
          mockCid(`actor-${Math.random()}`),
          new Uint8Array(32),
          "liked your recent post"
        );
        setNotifications(prev => [notif, ...prev]);
        toast(`New Swarm Alert: Someone ${notif.summary}`, "info");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoading, profile, toast]);

  const createPost = async (content: string, mediaFiles?: File[]) => {
    const encoded = await FeedService.publishPost(content, mediaFiles);
    const mockCidStr = `post-${Math.random().toString(36).slice(2, 11)}`;
    const cid = mockCid(mockCidStr);
    const postData = await import('@vco/vco-schemas').then(m => m.decodePost(encoded));
    
    setFeed([{ cid, data: postData }, ...feed]);
    toast("Post published to swarm", "success");
  };

  const sendDM = async (recipientProfile: ProfileData, content: string) => {
    if (!recipientProfile.encryptionPubkey) {
      throw new Error("Recipient does not have an encryption key.");
    }

    const { ephemeralPubkey, nonce, encryptedPayload } = await E2EEService.encryptMessage(
      recipientProfile.encryptionPubkey,
      content
    );

    const msgData: DirectMessageData = {
      schema: "vco://schemas/social/direct-message/v1",
      recipientCid: mockCid("recipient"), 
      senderCid: mockCid("sender"),
      ephemeralPubkey,
      nonce,
      encryptedPayload,
      timestampMs: BigInt(Date.now())
    };

    const msg: MessageWithMetadata = {
      cid: mockCid(`msg-${Math.random()}`),
      data: msgData,
      payload: { content, mediaCids: [] },
      isOwn: true
    };

    setConversations(prev => {
      const existing = prev.find(c => c.peerProfile.displayName === recipientProfile.displayName);
      if (existing) {
        return prev.map(c => c.peerProfile.displayName === recipientProfile.displayName 
          ? { ...c, lastMessage: msg, messages: [...c.messages, msg] }
          : c
        );
      }
      return [...prev, {
        peerProfile: recipientProfile,
        lastMessage: msg,
        messages: [msg],
        unread: 0
      }];
    });

    toast("Encrypted DM sent", "success");
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    if (profile) {
      const updated = { ...profile, ...data };
      setProfile(updated);
      toast("Profile manifest updated", "success");
    }
  };

  const markNotificationAsRead = (cid: Uint8Array) => {
    setNotifications(prev => prev.filter(n => n.targetCid !== cid));
  };

  const deletePost = async (cid: Uint8Array) => {
    const hex = toHex(cid);
    setTombstones(prev => {
      const next = new Set(prev);
      next.add(hex);
      return next;
    });
    toast("Tombstone published. Post removed from swarm.", "info");
  };

  const reactToPost = async (cid: Uint8Array) => {
    toast(`Reaction (LIKE) manifest published for ${toHex(cid).substring(0, 8)}...`, "success");
  };

  const repost = async (cid: Uint8Array, commentary?: string) => {
    toast(`Repost manifest published for ${toHex(cid).substring(0, 8)}...`, "success");
  };

  return (
    <SocialContext.Provider value={{
      profile,
      feed: filteredFeed,
      conversations,
      notifications,
      tombstones,
      filter,
      isLoading,
      createPost,
      sendDM,
      updateProfile,
      markNotificationAsRead,
      setFilter,
      deletePost,
      reactToPost,
      repost
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) throw new Error("useSocial must be used within a SocialProvider");
  return context;
}
