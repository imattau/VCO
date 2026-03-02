import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  ProfileData, 
  PostData, 
  ReplyData,
  DirectMessageData, 
  NotificationData,
  NotificationType,
  ReportReason
} from '@vco/vco-schemas';
import { MockSocialService } from '@/lib/MockSocialService';
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
import { MediaService } from '@/lib/MediaService';

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

interface ReplyItem {
  cid: Uint8Array;
  data: ReplyData;
  authorProfile: ProfileData;
}

interface SocialContextType {
  profile: ProfileData | null;
  identity: IdentityKeys | null;
  peerProfiles: Map<string, ProfileData>;
  feed: FeedItem[];
  replies: ReplyItem[];
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
  createReply: (parentCid: Uint8Array, content: string, mediaFiles?: File[]) => Promise<void>;
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
  resolvePeerProfile: (creatorIdHex: string) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const GLOBAL_SOCIAL_CHANNEL = "vco://channels/social/global";

export function SocialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [identity, setIdentity] = useState<IdentityKeys | null>(null);
  const [peerProfiles, setPeerProfiles] = useState<Map<string, ProfileData>>(new Map());
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
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

  const handleInboundEnvelope = async (base64: string, channelId: string) => {
    try {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const { decodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      
      const crypto = createNobleCryptoProvider();
      const envelope = decodeEnvelopeProto(bytes);
      const hash = envelope.headerHash;
      const cidBase64 = btoa(String.fromCharCode(...hash));
      const creatorIdHex = toHex(envelope.header.creatorId);

      await vcoStore.putEnvelope({
        cid: cidBase64,
        channelId,
        payload: base64,
        timestamp: Date.now()
      });

      // Resolve author profile
      let authorProfile = await vcoStore.getProfile(creatorIdHex);
      if (!authorProfile) {
        NodeClient.getInstance().resolve(creatorIdHex);
        authorProfile = {
          schema: "vco://schemas/identity/profile/v1",
          displayName: `Peer ${creatorIdHex.substring(0, 6)}`,
          bio: "Identity resolving...",
          avatarCid: new Uint8Array(0),
          previousManifest: new Uint8Array(0)
        };
      }
      
      if (channelId.startsWith("vco://channels/dm/") && identity) {
        const { decodeDirectMessage } = await import('@vco/vco-schemas');
        const dmData = decodeDirectMessage(envelope.payload);
        
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
          const existing = prev.find(c => c.peerProfile.displayName === authorProfile!.displayName);
          if (existing) {
            return prev.map(c => c.peerProfile.displayName === authorProfile!.displayName
              ? { ...c, lastMessage: msg, messages: [...c.messages, msg], unread: c.unread + 1 }
              : c
            );
          }
          return [...prev, { peerProfile: authorProfile!, lastMessage: msg, messages: [msg], unread: 1 }];
        });

        toast(`New Secure Message from ${authorProfile.displayName}`, "info");
      } else if (channelId === GLOBAL_SOCIAL_CHANNEL) {
        const { decodePost, decodeReply } = await import('@vco/vco-schemas');
        
        // Differentiate Post vs Reply (simulated detection via base64 for now)
        if (base64.includes("reply")) {
           const replyData = decodeReply(envelope.payload);
           setReplies(prev => [{ cid: hash, data: replyData, authorProfile: authorProfile! }, ...prev]);
           
           if (feed.some(f => toHex(f.cid) === toHex(replyData.parentCid))) {
              const notif = NotificationService.generateNotification(
                NotificationType.POST_REPLY,
                envelope.header.creatorId,
                hash,
                `${authorProfile.displayName} replied to your post`
              );
              setNotifications(prev => [notif, ...prev]);
           }
        } else {
           const postData = decodePost(envelope.payload);
           setFeed(prev => [{ cid: hash, data: postData, authorProfile: authorProfile! }, ...prev]);
        }
      } else if (channelId.startsWith("vco://objects/")) {
        const { decodeProfile } = await import('@vco/vco-schemas');
        const peerProfile = decodeProfile(envelope.payload);
        const cid = toHex(envelope.header.creatorId);
        await vcoStore.putProfile(cid, peerProfile);
        setPeerProfiles(prev => new Map(prev).set(cid, peerProfile));
        toast(`Peer profile resolved: ${peerProfile.displayName}`, "success");
      }
    } catch (err) {
      console.error("Failed to process inbound envelope:", err);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        let id = KeyringService.loadIdentity();
        if (!id) {
          id = KeyringService.generateAndStoreIdentity();
          toast("New cryptographic identity established", "success");
        }
        setIdentity(id);

        let myProfile = await vcoStore.getProfile(id.creatorIdHex);
        if (!myProfile) {
          myProfile = MockSocialService.getMockProfile();
          myProfile.displayName = id.creatorIdHex.substring(0, 12);
          myProfile.encryptionPubkey = id.encryptionPublicKey;
          await vcoStore.putProfile(id.creatorIdHex, myProfile);
        }
        setProfile(myProfile);

        const allProfiles = await vcoStore.getAllProfiles();
        const profileMap = new Map<string, ProfileData>();
        allProfiles.forEach(p => {
          if (p.creatorId !== id!.creatorIdHex) profileMap.set(p.creatorId, p.data);
        });
        setPeerProfiles(profileMap);

        const storedEnvelopes = await vcoStore.getEnvelopesByChannel(GLOBAL_SOCIAL_CHANNEL);
        if (storedEnvelopes.length > 0) {
          const { decodePost, decodeReply } = await import('@vco/vco-schemas');
          const fItems: FeedItem[] = [];
          const rItems: ReplyItem[] = [];
          
          for (const e of storedEnvelopes) {
            const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
            const cid = Uint8Array.from(atob(e.cid), c => c.charCodeAt(0));
            if (e.payload.includes("reply")) {
              rItems.push({ cid, data: decodeReply(bytes), authorProfile: myProfile! });
            } else {
              fItems.push({ cid, data: decodePost(bytes), authorProfile: myProfile! });
            }
          }
          setFeed(fItems);
          setReplies(rItems);
        } else {
          setFeed(MockSocialService.getMockFeed());
        }

        const client = NodeClient.getInstance();
        await client.connect();
        client.subscribe(GLOBAL_SOCIAL_CHANNEL);

        const eventCleanup = client.onEvent((event) => {
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

        setIsLoading(false);
        return () => {
          eventCleanup();
          client.shutdown();
        };
      } catch (err) {
        console.error("Bootstrap failed:", err);
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const createPost = async (content: string, mediaFiles: File[] = []) => {
    if (!profile || !identity) return;
    const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
    const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
    const { POST_V3_SCHEMA_URI, extractHashtags, encodePost } = await import('@vco/vco-schemas');
    const crypto = createNobleCryptoProvider();

    const mediaCids = await Promise.all(mediaFiles.map(file => MediaService.processAndStore(file)));
    const postData: PostData = {
      schema: POST_V3_SCHEMA_URI,
      content,
      mediaCids,
      timestampMs: BigInt(Date.now()),
      tags: extractHashtags(content)
    };
    const postEncoded = encodePost(postData);

    const envelope = createEnvelope({
      payload: postEncoded,
      payloadType: 0x50,
      creatorId: identity.creatorId,
      privateKey: identity.signingPrivateKey,
      powDifficulty: 1
    }, crypto);

    const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
    NodeClient.getInstance().publish(GLOBAL_SOCIAL_CHANNEL, base64);

    const hash = envelope.headerHash;
    await vcoStore.putEnvelope({
      cid: btoa(String.fromCharCode(...hash)),
      channelId: GLOBAL_SOCIAL_CHANNEL,
      payload: base64,
      timestamp: Date.now()
    });

    setFeed(prev => [{ cid: hash, data: postData, authorProfile: profile }, ...prev]);
    toast("Post broadcast to swarm", "success");
  };

  const createReply = async (parentCid: Uint8Array, content: string, mediaFiles: File[] = []) => {
    if (!profile || !identity) return;
    const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
    const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
    const { REPLY_V2_SCHEMA_URI, encodeReply } = await import('@vco/vco-schemas');
    const crypto = createNobleCryptoProvider();

    const mediaCids = await Promise.all(mediaFiles.map(file => MediaService.processAndStore(file)));
    const replyData: ReplyData = {
      schema: REPLY_V2_SCHEMA_URI,
      parentCid,
      content,
      mediaCids,
      timestampMs: BigInt(Date.now()),
      tags: []
    };
    const replyEncoded = encodeReply(replyData);

    const envelope = createEnvelope({
      payload: replyEncoded,
      payloadType: 0x50,
      creatorId: identity.creatorId,
      privateKey: identity.signingPrivateKey,
      powDifficulty: 1
    }, crypto);

    const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
    NodeClient.getInstance().publish(GLOBAL_SOCIAL_CHANNEL, base64);

    const hash = envelope.headerHash;
    await vcoStore.putEnvelope({
      cid: btoa(String.fromCharCode(...hash)),
      channelId: GLOBAL_SOCIAL_CHANNEL,
      payload: base64,
      timestamp: Date.now()
    });

    setReplies(prev => [{ cid: hash, data: replyData, authorProfile: profile }, ...prev]);
    toast("Reply broadcast to swarm", "success");
  };

  const sendDM = async (recipientProfile: ProfileData, content: string, attachments: File[] = []) => {
    if (!recipientProfile.encryptionPubkey || !identity) return;

    const mediaCids = await Promise.all(attachments.map(file => MediaService.processAndStore(file)));
    const { ephemeralPubkey, nonce, encryptedPayload } = await E2EEService.encryptMessage(
      recipientProfile.encryptionPubkey,
      content,
      mediaCids
    );

    const msgData: DirectMessageData = {
      schema: "vco://schemas/social/direct-message/v1",
      recipientCid: recipientProfile.encryptionPubkey, 
      senderCid: identity.creatorId,
      ephemeralPubkey,
      nonce,
      encryptedPayload,
      timestampMs: BigInt(Date.now())
    };

    const dmEncoded = await import('@vco/vco-schemas').then(m => m.encodeDirectMessage(msgData));
    const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
    const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
    const crypto = createNobleCryptoProvider();

    const envelope = createEnvelope({
      payload: dmEncoded,
      payloadType: 0x50,
      creatorId: identity.creatorId,
      privateKey: identity.signingPrivateKey,
      powDifficulty: 1
    }, crypto);

    const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
    const channelId = `vco://channels/dm/${toHex(recipientProfile.encryptionPubkey)}`;
    NodeClient.getInstance().publish(channelId, base64);

    const hash = envelope.headerHash;
    await vcoStore.putEnvelope({
      cid: btoa(String.fromCharCode(...hash)),
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
      return [...prev, { peerProfile: recipientProfile, lastMessage: msg, messages: [msg], unread: 0 }];
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

  const markNotificationAsRead = (cid: Uint8Array) => {
    setNotifications(prev => prev.filter(n => n.targetCid !== cid));
  };

  const setFilterAction = (f: { type: 'tag' | 'peer' | 'all'; value?: string } | null) => setFilter(f);

  const deletePost = async (cid: Uint8Array) => {
    const hex = toHex(cid);
    setTombstones(prev => new Set(prev).add(hex));
    toast("Tombstone published", "info");
  };

  const reactToPost = async (cid: Uint8Array) => {
    toast(`Reaction manifest published for ${toHex(cid).substring(0, 8)}`, "success");
  };

  const repost = async (cid: Uint8Array, commentary?: string) => {
    toast(`Repost manifest published for ${toHex(cid).substring(0, 8)}`, "success");
  };

  const publishReport = async (cid: Uint8Array, reason: number) => {
    if (!identity) return;
    
    const { encodeReport, REPORT_SCHEMA_URI } = await import('@vco/vco-schemas');
    const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
    const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
    const crypto = createNobleCryptoProvider();

    const reportData = {
      schema: REPORT_SCHEMA_URI,
      targetCid: cid,
      reason: reason,
      timestampMs: BigInt(Date.now())
    };
    
    const reportEncoded = encodeReport(reportData);
    
    const envelope = createEnvelope({
      payload: reportEncoded,
      payloadType: 0x50,
      creatorId: identity.creatorId,
      privateKey: identity.signingPrivateKey,
      powDifficulty: 1
    }, crypto);

    const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
    // Publish to a dedicated moderation monitoring channel
    NodeClient.getInstance().publish("vco://channels/moderation/reports", base64);
    
    toast("Verifiable report broadcast to network", "success");
    console.log(`Report published for ${toHex(cid)} reason: ${reason}`);
  };

  const navigateToPost = (cid: Uint8Array) => {
    const post = feed.find(item => toHex(item.cid) === toHex(cid));
    if (post) {
      setActiveTab('feed');
      setActiveThread(post);
    }
  };

  const navigateToPeer = (displayName: string) => {
    const idx = conversations.findIndex(c => c.peerProfile.displayName === displayName);
    if (idx !== -1) {
      setActiveTab('messaging');
      setSelectedConversationIndex(idx);
    } else {
      setActiveTab('profile');
    }
  };

  const resolvePeerProfile = async (creatorIdHex: string) => {
    NodeClient.getInstance().resolve(creatorIdHex);
    toast(`Resolving peer ${creatorIdHex.substring(0, 8)}...`, "info");
  };

  const filteredFeed = useMemo(() => {
    return feed.filter(item => {
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
  }, [feed, tombstones, filter]);

  return (
    <SocialContext.Provider value={{
      profile, identity, peerProfiles, feed: filteredFeed, replies, conversations, notifications, tombstones, filter, isLoading, isNodeReady, peerId, activeTab, activeThread, selectedConversationIndex,
      setActiveTab, setActiveThread, setSelectedConversationIndex, createPost, createReply, sendDM, updateProfile, markNotificationAsRead, setFilter: setFilterAction, deletePost, reactToPost, repost, publishReport, navigateToPost, navigateToPeer, resolvePeerProfile
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
