import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ProfileData, 
  PostData, 
  DirectMessageData, 
  NotificationData,
  NotificationType,
  ReportReason
} from '@vco/vco-schemas';
import { MockSocialService, socialBlobStore } from '@/lib/MockSocialService';
import { FeedService } from '@/lib/FeedService';
import { E2EEService } from '@/lib/E2EEService';
import { ProfileService } from '@/lib/ProfileService';
import { NotificationService } from '@/lib/NotificationService';
import { useToast } from '@/components/ToastProvider';
import { mockCid, toHex } from '@vco/vco-testing';
import { blake3 } from '@vco/vco-crypto';
import { SocialTab } from '@/App';
import { KeyringService, IdentityKeys } from '@/lib/KeyringService';
import { NodeClient } from '@/lib/NodeClient';
import { vcoStore } from '@/lib/VcoStore';

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

interface FeedItem {
  cid: Uint8Array;
  data: PostData;
  authorProfile: ProfileData;
}

interface SocialContextType {
  profile: ProfileData | null;
  identity: IdentityKeys | null;
  feed: FeedItem[];
  conversations: Conversation[];
  notifications: NotificationData[];
  tombstones: Set<string>; // Hex strings of deleted CIDs
  filter: { type: 'tag' | 'peer' | 'all'; value?: string } | null;
  isLoading: boolean;
  isNodeReady: boolean;
  peerId: string | null;
  activeTab: SocialTab;
  activeThread: FeedItem | null;
  selectedConversationIndex: number | null;
  
  // Actions
  setActiveTab: (tab: SocialTab) => void;
  setActiveThread: (thread: FeedItem | null) => void;
  setSelectedConversationIndex: (index: number | null) => void;
  createPost: (content: string, mediaFiles?: File[]) => Promise<void>;
  sendDM: (recipientProfile: ProfileData, content: string, attachments?: File[]) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  markNotificationAsRead: (cid: Uint8Array) => void;
  setFilter: (filter: { type: 'tag' | 'peer' | 'all'; value?: string } | null) => void;
  deletePost: (cid: Uint8Array) => Promise<void>;
  reactToPost: (cid: Uint8Array) => Promise<void>;
  repost: (cid: Uint8Array, commentary?: string) => Promise<void>;
  publishReport: (cid: Uint8Array, reason: number) => Promise<void>;
  navigateToPost: (cid: Uint8Array) => void;
  navigateToPeer: (displayName: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const GLOBAL_SOCIAL_CHANNEL = "vco://channels/social/global";

export function SocialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [identity, setIdentity] = useState<IdentityKeys | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [tombstones, setTombstones] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<{ type: 'tag' | 'peer' | 'all'; value?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNodeReady, setIsNodeReady] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SocialTab>('feed');
  const [activeThread, setActiveThread] = useState<FeedItem | null>(null);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      
      try {
        // 1. Load or Generate Identity
        let id = KeyringService.loadIdentity();
        if (!id) {
          id = KeyringService.generateAndStoreIdentity();
          toast("New cryptographic identity established", "success");
        }
        setIdentity(id);

        // 2. Load Profile from Persistent Store
        let myProfile = await vcoStore.getProfile(id.creatorIdHex);
        if (!myProfile) {
          myProfile = MockSocialService.getMockProfile();
          myProfile.displayName = id.creatorIdHex.substring(0, 12);
          myProfile.encryptionPubkey = id.encryptionPublicKey;
          await vcoStore.putProfile(id.creatorIdHex, myProfile);
        }
        setProfile(myProfile);

        // 3. Load Feed from Persistent Store
        const storedEnvelopes = await vcoStore.getEnvelopesByChannel(GLOBAL_SOCIAL_CHANNEL);
        if (storedEnvelopes.length > 0) {
          const { decodePost } = await import('@vco/vco-schemas');
          const items: FeedItem[] = storedEnvelopes.map(e => {
            const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
            return {
              cid: Uint8Array.from(atob(e.cid), c => c.charCodeAt(0)),
              data: decodePost(bytes),
              authorProfile: myProfile! // For simplicity, in real app resolve from profiles store
            };
          });
          setFeed(items);
        } else {
          // Seed with mock feed if empty
          setFeed(MockSocialService.getMockFeed());
        }

        // 4. Connect to libp2p node
        const client = NodeClient.getInstance();
        await client.connect();
        
        // 5. Subscribe to global social channel
        client.subscribe(GLOBAL_SOCIAL_CHANNEL);

        // 6. Listen for real-time events
        const cleanup = client.onEvent((event) => {
          if (event.type === 'envelope') {
            handleInboundEnvelope(event.envelope, event.channelId);
          } else if (event.type === 'ready') {
            setIsNodeReady(true);
            setPeerId(event.peerId);
            toast("Connected to VCO swarm", "success");
          } else if (event.type === 'error') {
            toast(`Node Error: ${event.message}`, "error");
          }
        });

        return () => {
          cleanup();
          client.shutdown();
        };
      } catch (err) {
        console.error("Bootstrap failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const handleInboundEnvelope = async (base64: string, channelId: string) => {
    try {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const hash = blake3(bytes);
      const cidBase64 = btoa(String.fromCharCode(...hash));

      // Persist to IndexedDB
      await vcoStore.putEnvelope({
        cid: cidBase64,
        channelId,
        payload: base64,
        timestamp: Date.now()
      });
      
      // Determine if it's a DM channel
      if (channelId.startsWith("vco://channels/dm/") && identity) {
        const { decodeDirectMessage } = await import('@vco/vco-schemas');
        const dmData = decodeDirectMessage(bytes);
        
        // Decrypt the payload
        const decryptedPayload = await E2EEService.decryptMessage(
          identity.encryptionPrivateKey,
          dmData.ephemeralPubkey,
          dmData.nonce,
          dmData.encryptedPayload
        );

        const msg: MessageWithMetadata = {
          cid: hash,
          data: dmData,
          payload: decryptedPayload,
          isOwn: false
        };

        setConversations(prev => {
          const peerName = "Verifiable Bob"; 
          const existing = prev.find(c => c.peerProfile.displayName === peerName);
          
          if (existing) {
            return prev.map(c => c.peerProfile.displayName === peerName
              ? { ...c, lastMessage: msg, messages: [...c.messages, msg], unread: c.unread + 1 }
              : c
            );
          }
          return prev;
        });

        toast("New Encrypted Message Received", "info");
      } else if (channelId === GLOBAL_SOCIAL_CHANNEL) {
        const { decodePost } = await import('@vco/vco-schemas');
        const postData = decodePost(bytes);
        
        setFeed(prev => [{ 
          cid: hash, 
          data: postData, 
          authorProfile: MockSocialService.getMockFeed()[0].authorProfile // Simulating peer resolution
        }, ...prev]);
      }
    } catch (err) {
      console.error("Failed to process inbound envelope:", err);
    }
  };

  const createPost = async (content: string, mediaFiles?: File[]) => {
    if (!profile || !identity) return;
    
    const encoded = await FeedService.publishPost(content, mediaFiles);
    const base64 = btoa(String.fromCharCode(...encoded));
    
    const client = NodeClient.getInstance();
    client.publish(GLOBAL_SOCIAL_CHANNEL, base64);

    const hash = blake3(encoded);
    const cidBase64 = btoa(String.fromCharCode(...hash));

    // Persist to local store
    await vcoStore.putEnvelope({
      cid: cidBase64,
      channelId: GLOBAL_SOCIAL_CHANNEL,
      payload: base64,
      timestamp: Date.now()
    });

    const postData = await import('@vco/vco-schemas').then(m => m.decodePost(encoded));
    setFeed(prev => [{ cid: hash, data: postData, authorProfile: profile }, ...prev]);
    toast("Post broadcast to swarm", "success");
  };

  const sendDM = async (recipientProfile: ProfileData, content: string, attachments: File[] = []) => {
    if (!recipientProfile.encryptionPubkey || !identity) {
      throw new Error("Missing encryption keys.");
    }

    // Hash attachments
    const mediaCids = await Promise.all(attachments.map(async (file) => {
      const cid = mockCid(`dm-media-${file.name}-${Math.random()}`);
      socialBlobStore.set(toHex(cid), file);
      return cid;
    }));

    const { ephemeralPubkey, nonce, encryptedPayload } = await E2EEService.encryptMessage(
      recipientProfile.encryptionPubkey,
      content,
      mediaCids
    );

    const msgData: DirectMessageData = {
      schema: "vco://schemas/social/direct-message/v1",
      recipientCid: mockCid("recipient"), 
      senderCid: identity.creatorId,
      ephemeralPubkey,
      nonce,
      encryptedPayload,
      timestampMs: BigInt(Date.now())
    };

    const encoded = await import('@vco/vco-schemas').then(m => m.encodeDirectMessage(msgData));
    const base64 = btoa(String.fromCharCode(...encoded));
    const channelId = `vco://channels/dm/${toHex(recipientProfile.encryptionPubkey)}`;
    
    const client = NodeClient.getInstance();
    client.publish(channelId, base64);

    const hash = blake3(encoded);
    const cidBase64 = btoa(String.fromCharCode(...hash));

    // Persist DM outbox
    await vcoStore.putEnvelope({
      cid: cidBase64,
      channelId,
      payload: base64,
      timestamp: Date.now()
    });

    const msg: MessageWithMetadata = {
      cid: hash,
      data: msgData,
      payload: { content, mediaCids },
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
    if (profile && identity) {
      const updated = { ...profile, ...data };
      setProfile(updated);
      await vcoStore.putProfile(identity.creatorIdHex, updated);
      toast("Profile manifest updated locally", "success");
    }
  };

  // Filtered Feed Calculation
  const filteredFeed = feed.filter(item => {
    const hexCid = toHex(item.cid);
    if (tombstones.has(hexCid)) return false;

    if (!filter || filter.type === 'all') return true;
    if (filter.type === 'tag') {
      return (item.data.tags || []).includes(filter.value?.replace('#', '').toLowerCase() || '');
    }
    if (filter.type === 'peer') {
      return item.authorProfile.displayName.toLowerCase() === filter.value?.toLowerCase();
    }
    return true;
  });

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

  const publishReport = async (cid: Uint8Array, reason: number) => {
    console.log(`Report published for ${toHex(cid)} with reason code: ${reason}`);
  };

  const navigateToPost = (cid: Uint8Array) => {
    const post = feed.find(item => toHex(item.cid) === toHex(cid));
    if (post) {
      setActiveTab('feed');
      setActiveThread(post);
    }
  };

  const navigateToPeer = (displayName: string) => {
    const convIndex = conversations.findIndex(c => c.peerProfile.displayName === displayName);
    if (convIndex !== -1) {
      setActiveTab('messaging');
      setSelectedConversationIndex(convIndex);
    } else {
      setActiveTab('profile');
    }
  };

  return (
    <SocialContext.Provider value={{
      profile,
      identity,
      feed: filteredFeed,
      conversations,
      notifications,
      tombstones,
      filter,
      isLoading,
      isNodeReady,
      peerId,
      activeTab,
      activeThread,
      selectedConversationIndex,
      setActiveTab,
      setActiveThread,
      setSelectedConversationIndex,
      createPost,
      sendDM,
      updateProfile,
      markNotificationAsRead,
      setFilter,
      deletePost,
      reactToPost,
      repost,
      publishReport,
      navigateToPost,
      navigateToPeer
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
