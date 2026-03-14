import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { 
  ProfileData, 
  PostData, 
  ReplyData,
  DirectMessageData, 
  NotificationData,
  NotificationType,
  ReportReason
} from '@vco/vco-schemas';

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
import * as Constants from '@/lib/constants';

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
  authorId: Uint8Array;
  data: PostData;
  authorProfile: ProfileData;
}

interface ReplyItem {
  cid: Uint8Array;
  authorId: Uint8Array;
  data: ReplyData;
  authorProfile: ProfileData;
}

interface SocialContextType {
  profile: ProfileData | null;
  identity: IdentityKeys | null;
  peerProfiles: Map<string, ProfileData>;
  feed: FeedItem[];
  replies: ReplyItem[];
  following: Set<string>;
  conversations: Conversation[];
  notifications: NotificationData[];
  tombstones: Set<string>; 
  reactions: Map<string, Set<string>>; // targetCid -> Set of creatorIdHex
  reposts: Map<string, Set<string>>;    // targetCid -> Set of creatorIdHex
  filter: { type: 'tag' | 'peer' | 'all'; value?: string } | null;
  isLoading: boolean;
  isNodeReady: boolean;
  peerId: string | null;
  activeTab: SocialTab;
  activeThread: FeedItem | null;
  selectedConversationIndex: number | null;
  hasMoreFeed: boolean;
  
  // Actions
  setActiveTab: (tab: SocialTab) => void;
  setActiveThread: (thread: FeedItem | null) => void;
  setSelectedConversationIndex: (index: number | null) => void;
  createPost: (content: string, mediaFiles?: File[]) => Promise<void>;
  createReply: (parentCid: Uint8Array, content: string, mediaFiles?: File[]) => Promise<void>;
  sendDM: (recipientProfile: ProfileData, content: string, attachments?: File[]) => Promise<void>;
  followPeer: (creatorIdHex: string) => Promise<void>;
  unfollowPeer: (creatorIdHex: string) => Promise<void>;
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
  loadMoreFeed: () => Promise<void>;
  
  // Auth Actions
  unlock: (password: string) => Promise<void>;
  createIdentity: (password: string) => Promise<void>;
  hasExistingIdentity: () => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [identity, setIdentity] = useState<IdentityKeys | null>(null);
  const [peerProfiles, setPeerProfiles] = useState<Map<string, ProfileData>>(new Map());
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [tombstones, setTombstones] = useState<Set<string>>(new Set());
  const [reactions, setReactions] = useState<Map<string, Set<string>>>(new Map());
  const [reposts, setReposts] = useState<Map<string, Set<string>>>(new Map());
  const [filter, setFilter] = useState<{ type: 'tag' | 'peer' | 'all'; value?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNodeReady, setIsNodeReady] = useState(false);
  const [networkLoad, setNetworkLoad] = useState(1.0);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SocialTab>('feed');
  const [activeThread, setActiveThread] = useState<FeedItem | null>(null);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<number | null>(null);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const { toast } = useToast();

  const identityRef = useRef<IdentityKeys | null>(null);
  const profileRef = useRef<ProfileData | null>(null);
  const peerProfilesRef = useRef<Map<string, ProfileData>>(new Map());
  const isNodeReadyRef = useRef(false);

  useEffect(() => { identityRef.current = identity; }, [identity]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { peerProfilesRef.current = peerProfiles; }, [peerProfiles]);
  useEffect(() => { isNodeReadyRef.current = isNodeReady; }, [isNodeReady]);

  const calculateDifficulty = useCallback((payload: Uint8Array) => {
    const sizeScaling = Math.floor(Math.log2(payload.length / 1024 + 1));
    return Math.floor((Constants.DEFAULT_POW_DIFFICULTY + sizeScaling) * networkLoad);
  }, [networkLoad]);

  const unlock = async (password: string) => {
    const id = await KeyringService.unlockIdentity(password);
    if (id) {
      setIdentity(id);
      toast("Identity unlocked successfully", "success");
    } else {
      throw new Error("Invalid password");
    }
  };

  const createIdentity = async (password: string) => {
    const id = await KeyringService.generateAndStoreIdentity(password);
    setIdentity(id);
    toast("New secure identity created", "success");
  };

  const hasExistingIdentity = async () => await KeyringService.hasIdentity();

  const processEnvelopes = useCallback(async (envelopes: any[], myProfile: ProfileData, profileMap: Map<string, ProfileData>, identity: IdentityKeys) => {
    const { decodePost, decodeReply, decodeDirectMessage, decodeFollow, decodeReaction, decodeRepost } = await import('@vco/vco-schemas');
    const { decodeEnvelopeProto: decodeCore } = await import('@vco/vco-core');
    
    const fItems: FeedItem[] = [];
    const rItems: ReplyItem[] = [];
    const followSet = new Set<string>();
    const dmMap = new Map<string, MessageWithMetadata[]>();
    const reactionMap = new Map<string, Set<string>>();
    const repostMap = new Map<string, Set<string>>();

    for (const e of envelopes) {
      try {
        const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
        const coreEnvelope = decodeCore(bytes);
        const cid = Uint8Array.from(atob(e.cid), c => c.charCodeAt(0));
        const creatorIdHex = toHex(coreEnvelope.header.creatorId);
        
        const authorProfile = creatorIdHex === identity.creatorIdHex ? myProfile : profileMap.get(creatorIdHex) || {
          schema: Constants.PROFILE_SCHEMA_URI,
          displayName: `Peer ${creatorIdHex.substring(0, 6)}`,
          avatarCid: new Uint8Array(0),
          previousManifest: new Uint8Array(0),
          bio: "Offline identity"
        };

        if (e.channelId === Constants.GLOBAL_SOCIAL_CHANNEL) {
          const payloadJson = JSON.parse(new TextDecoder().decode(coreEnvelope.payload));
          
          if (payloadJson.schema === Constants.REPLY_SCHEMA_URI) {
            rItems.push({ cid, authorId: coreEnvelope.header.creatorId, data: decodeReply(coreEnvelope.payload), authorProfile });
          } else if (payloadJson.schema === Constants.FOLLOW_SCHEMA_URI) {
            const followData = decodeFollow(coreEnvelope.payload);
            if (creatorIdHex === identity.creatorIdHex) {
              if (followData.action === "follow") followSet.add(toHex(followData.subjectKey));
              else followSet.delete(toHex(followData.subjectKey));
            }
          } else if (payloadJson.schema === Constants.POST_SCHEMA_URI) {
            fItems.push({ cid, authorId: coreEnvelope.header.creatorId, data: decodePost(coreEnvelope.payload), authorProfile });
          } else if (payloadJson.schema === Constants.REACTION_SCHEMA_URI) {
            const reactionData = decodeReaction(coreEnvelope.payload);
            const targetHex = toHex(reactionData.targetCid);
            if (!reactionMap.has(targetHex)) reactionMap.set(targetHex, new Set());
            reactionMap.get(targetHex)!.add(creatorIdHex);
          } else if (payloadJson.schema === Constants.REPOST_SCHEMA_URI) {
            const repostData = decodeRepost(coreEnvelope.payload);
            const targetHex = toHex(repostData.originalPostCid);
            if (!repostMap.has(targetHex)) repostMap.set(targetHex, new Set());
            repostMap.get(targetHex)!.add(creatorIdHex);
          }
        } else if (e.channelId.startsWith("vco://channels/dm/")) {
          const dmData = decodeDirectMessage(coreEnvelope.payload);
          let decrypted: any = { content: "[Encrypted Message]", mediaCids: [] };
          
          try {
            decrypted = await E2EEService.decryptMessage(
              identity.encryptionPrivateKey,
              dmData.ephemeralPubkey,
              dmData.nonce,
              dmData.encryptedPayload
            );
          } catch(e) {}

          const msg: MessageWithMetadata = {
            cid,
            data: dmData,
            payload: decrypted,
            isOwn: creatorIdHex === identity.creatorIdHex
          };

          const peerKey = e.channelId.replace("vco://channels/dm/", "");
          if (!dmMap.has(peerKey)) dmMap.set(peerKey, []);
          dmMap.get(peerKey)!.push(msg);
        }
      } catch (err) {
        console.warn("ProcessEnvelopes: Failed to decode envelope", err);
      }
    }
    return { fItems, rItems, followSet, dmMap, reactionMap, repostMap };
  }, []);

  const handleInboundEnvelope = useCallback(async (base64: string, channelId: string) => {
    const currentIdentity = identityRef.current;
    const currentProfile = profileRef.current;
    if (!currentIdentity || !currentProfile) return;

    try {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const { decodeEnvelopeProto, verifyEnvelope } = await import('@vco/vco-core');
      const { createNobleCryptoProvider, blake3 } = await import('@vco/vco-crypto');
      const { toHex } = await import('@vco/vco-testing');
      
      const crypto = createNobleCryptoProvider();
      const envelope = decodeEnvelopeProto(bytes);
      if (!verifyEnvelope(envelope, crypto)) return;

      const actualHash = blake3((envelope.header as any).encode());
      if (toHex(actualHash) !== toHex(envelope.headerHash)) return;

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
          schema: Constants.PROFILE_SCHEMA_URI,
          displayName: `Peer ${creatorIdHex.substring(0, 6)}`,
          bio: "Identity resolving...",
          avatarCid: new Uint8Array(0),
          previousManifest: new Uint8Array(0)
        };
      }
      
      const { fItems, rItems, followSet, dmMap, reactionMap, repostMap } = await processEnvelopes([{ cid: cidBase64, channelId, payload: base64 }], currentProfile, peerProfilesRef.current, currentIdentity);
      
      if (fItems.length > 0) setFeed(prev => [fItems[0], ...prev]);
      if (rItems.length > 0) setReplies(prev => [rItems[0], ...prev]);
      if (followSet.size > 0) {
        setFollowing(prev => {
          const next = new Set(prev);
          followSet.forEach(f => next.add(f));
          return next;
        });
      }
      if (dmMap.size > 0) {
        for (const [peerKey, msgs] of dmMap.entries()) {
           setConversations(prev => {
             const existing = prev.find(c => c.peerProfile.displayName === authorProfile!.displayName);
             if (existing) {
               return prev.map(c => c.peerProfile.displayName === authorProfile!.displayName
                 ? { ...c, lastMessage: msgs[0], messages: [...c.messages, msgs[0]], unread: c.unread + 1 }
                 : c
               );
             }
             return [...prev, { peerProfile: authorProfile!, lastMessage: msgs[0], messages: [msgs[0]], unread: 1 }];
           });
        }
      }
      if (reactionMap.size > 0) {
        setReactions(prev => {
          const next = new Map(prev);
          reactionMap.forEach((creators, target) => {
            const set = next.get(target) || new Set();
            creators.forEach(c => set.add(c));
            next.set(target, set);
          });
          return next;
        });
      }
      if (repostMap.size > 0) {
        setReposts(prev => {
          const next = new Map(prev);
          repostMap.forEach((creators, target) => {
            const set = next.get(target) || new Set();
            creators.forEach(c => set.add(c));
            next.set(target, set);
          });
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to process inbound envelope:", err);
    }
  }, [processEnvelopes]);

  const loadMoreFeed = useCallback(async () => {
    const currentIdentity = identityRef.current;
    const currentProfile = profileRef.current;
    if (!currentIdentity || !hasMoreFeed || !currentProfile) return;
    
    const lastTimestamp = feed.length > 0 ? Number(feed[feed.length - 1].data.timestampMs) : undefined;
    const moreEnvelopes = await vcoStore.getEnvelopesPaged(Constants.FEED_PAGE_SIZE, lastTimestamp);
    
    if (moreEnvelopes.length < Constants.FEED_PAGE_SIZE) setHasMoreFeed(false);
    if (moreEnvelopes.length === 0) return;

    const { fItems, reactionMap, repostMap } = await processEnvelopes(moreEnvelopes, currentProfile, peerProfilesRef.current, currentIdentity);
    setFeed(prev => [...prev, ...fItems.sort((a,b) => Number(b.data.timestampMs - a.data.timestampMs))]);
    
    if (reactionMap.size > 0) {
      setReactions(prev => {
        const next = new Map(prev);
        reactionMap.forEach((creators, target) => {
          const set = next.get(target) || new Set();
          creators.forEach(c => set.add(c));
          next.set(target, set);
        });
        return next;
      });
    }
    if (repostMap.size > 0) {
      setReposts(prev => {
        const next = new Map(prev);
        repostMap.forEach((creators, target) => {
          const set = next.get(target) || new Set();
          creators.forEach(c => set.add(c));
          next.set(target, set);
        });
        return next;
      });
    }
  }, [hasMoreFeed, feed.length, processEnvelopes]);

  useEffect(() => {
    if (!identity) {
      setIsLoading(false);
      return;
    }

    const bootstrapData = async () => {
      setIsLoading(true);
      try {
        console.log("VCO Social: Starting data bootstrap for identity", identity.creatorIdHex);
        
        let myProfile = await vcoStore.getProfile(identity.creatorIdHex);
        if (!myProfile) {
          myProfile = {
            schema: Constants.PROFILE_SCHEMA_URI,
            displayName: identity.creatorIdHex.substring(0, 12),
            bio: "Establishing swarm identity...",
            avatarCid: new Uint8Array(0),
            previousManifest: new Uint8Array(0),
            encryptionPubkey: identity.encryptionPublicKey
          };
          await vcoStore.putProfile(identity.creatorIdHex, myProfile);
        }
        setProfile(myProfile);

        const refreshedProfiles = await vcoStore.getAllProfiles();
        const profileMap = new Map<string, ProfileData>();
        refreshedProfiles.forEach(p => {
          if (p.creatorId !== identity.creatorIdHex) profileMap.set(p.creatorId, p.data);
        });
        setPeerProfiles(profileMap);

        const storedNotifs = await vcoStore.getAllNotifications();
        setNotifications(storedNotifs.sort((a,b) => Number(b.timestampMs - a.timestampMs)));

        // Load ALL local envelopes first to ensure persistence
        const allLocalEnvelopes = await vcoStore.getAllEnvelopes();
        console.log(`VCO Social: Loaded ${allLocalEnvelopes.length} envelopes from local store.`);
        
        // Then load paginated feed for UI
        const initialEnvelopes = await vcoStore.getEnvelopesPaged(Constants.FEED_PAGE_SIZE * 2);
        if (initialEnvelopes.length < Constants.FEED_PAGE_SIZE * 2) setHasMoreFeed(false);

        // Process all local envelopes to build full state (reactions, reposts, etc)
        if (allLocalEnvelopes.length > 0) {
          const { fItems, rItems, followSet, dmMap, reactionMap, repostMap } = await processEnvelopes(allLocalEnvelopes, myProfile, profileMap, identity);
          
          console.log(`VCO Social: Processed ${fItems.length} posts from local storage.`);
          setFeed(fItems.sort((a,b) => Number(b.data.timestampMs - a.data.timestampMs)));
          setReplies(rItems);
          setFollowing(followSet);
          setReactions(reactionMap);
          setReposts(repostMap);
          
          const convs: Conversation[] = [];
          for (const [peerKey, messages] of dmMap.entries()) {
            const sortedMsgs = messages.sort((a,b) => Number(a.data.timestampMs - b.data.timestampMs));
            const peerProfile = Array.from(profileMap.values()).find(p => p.encryptionPubkey && toHex(p.encryptionPubkey) === peerKey) || {
              schema: Constants.PROFILE_SCHEMA_URI,
              displayName: `Peer ${peerKey.substring(0,6)}`,
              avatarCid: new Uint8Array(0),
              previousManifest: new Uint8Array(0),
              bio: "E2EE contact",
              encryptionPubkey: Uint8Array.from(peerKey.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
            };
            
            convs.push({
              peerProfile,
              messages: sortedMsgs,
              lastMessage: sortedMsgs[sortedMsgs.length - 1],
              unread: 0
            });
          }
          setConversations(convs);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("VCO Social: Bootstrap failed:", err);
        setIsLoading(false);
      }
    };

    bootstrapData();
  }, [identity, processEnvelopes]);

  useEffect(() => {
    if (!identity || isLoading) return;

    const client = NodeClient.getInstance();
    let eventCleanup: (() => void) | null = null;

    const connectNode = async () => {
      await client.connect();
      client.subscribe(Constants.GLOBAL_SOCIAL_CHANNEL);
      client.subscribe(`vco://channels/dm/${toHex(identity.encryptionPublicKey)}`);

      eventCleanup = client.onEvent((event) => {
        if (event.type === 'envelope') {
          handleInboundEnvelope(event.envelope, event.channelId);
        } else if (event.type === 'stats') {
          setNetworkLoad(event.networkLoad || 1.0);
          if (!isNodeReadyRef.current) {
            setIsNodeReady(true);
            setPeerId(event.peerId);
            toast("Connected to VCO swarm", "success");
            
            client.bootstrap(Constants.BOOTSTRAP_NODES);
            
            if (profileRef.current) {
              const myProfile = profileRef.current;
              import('@vco/vco-core').then(core => {
                import('@vco/vco-crypto').then(cryptoMod => {
                  import('@vco/vco-schemas').then(schemas => {
                    const crypto = cryptoMod.createNobleCryptoProvider();
                    const payload = schemas.encodeProfile(myProfile);
                    const envelope = core.createEnvelope({
                      payload,
                      payloadType: 0x50,
                      creatorId: identity.creatorId,
                      privateKey: identity.signingPrivateKey,
                      powDifficulty: 10
                    }, crypto);
                    const base64 = btoa(String.fromCharCode(...core.encodeEnvelopeProto(envelope)));
                    client.putRecord(identity.creatorIdHex, base64);
                  });
                });
              });
            }
          }
        } else if (event.type === 'error') {
          toast(`Node Error: ${event.message}`, "error");
        }
      });
    };

    connectNode();

    return () => {
      if (eventCleanup) eventCleanup();
      client.shutdown();
    };
  }, [identity, isLoading, handleInboundEnvelope, toast]);

  const createPost = async (content: string, mediaFiles: File[] = []) => {
    if (!profile || !identity) return;
    try {
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const { extractHashtags, encodePost } = await import('@vco/vco-schemas');
      const crypto = createNobleCryptoProvider();

      const mediaCids = await Promise.all(mediaFiles.map(file => MediaService.processAndStore(file)));
      const postData: PostData = {
        schema: Constants.POST_SCHEMA_URI,
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
        powDifficulty: calculateDifficulty(postEncoded)
      }, crypto);

      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);

      const hash = envelope.headerHash;
      await vcoStore.putEnvelope({
        cid: btoa(String.fromCharCode(...hash)),
        channelId: Constants.GLOBAL_SOCIAL_CHANNEL,
        payload: base64,
        timestamp: Date.now()
      });

      setFeed(prev => [{ cid: hash, authorId: identity.creatorId, data: postData, authorProfile: profile }, ...prev]);
      toast("Post broadcast to swarm", "success");
    } catch (err) {
      console.error("Failed to create post:", err);
      toast("Failed to publish post to swarm", "error");
    }
  };

  const createReply = async (parentCid: Uint8Array, content: string, mediaFiles: File[] = []) => {
    if (!profile || !identity) return;
    try {
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const { encodeReply } = await import('@vco/vco-schemas');
      const crypto = createNobleCryptoProvider();

      const mediaCids = await Promise.all(mediaFiles.map(file => MediaService.processAndStore(file)));
      const replyData: ReplyData = {
        schema: Constants.REPLY_SCHEMA_URI,
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
        powDifficulty: calculateDifficulty(replyEncoded)
      }, crypto);

      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);

      const hash = envelope.headerHash;
      await vcoStore.putEnvelope({
        cid: btoa(String.fromCharCode(...hash)),
        channelId: Constants.GLOBAL_SOCIAL_CHANNEL,
        payload: base64,
        timestamp: Date.now()
      });

      setReplies(prev => [{ cid: hash, authorId: identity.creatorId, data: replyData, authorProfile: profile }, ...prev]);
      toast("Reply broadcast to swarm", "success");
    } catch (err) {
      console.error("Failed to create reply:", err);
      toast("Failed to publish reply to swarm", "error");
    }
  };

  const sendDM = async (recipientProfile: ProfileData, content: string, attachments: File[] = []) => {
    if (!recipientProfile.encryptionPubkey || !identity) return;

    try {
      const mediaCids = await Promise.all(attachments.map(file => MediaService.processAndStore(file)));
      const { ephemeralPubkey, nonce, encryptedPayload } = await E2EEService.encryptMessage(
        recipientProfile.encryptionPubkey,
        content,
        mediaCids
      );

      const msgData: DirectMessageData = {
        schema: Constants.DM_SCHEMA_URI,
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
        powDifficulty: calculateDifficulty(dmEncoded)
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
    } catch (err) {
      console.error("Failed to send DM:", err);
      toast("Failed to encrypt or transmit DM", "error");
    }
  };

  const followPeer = async (creatorIdHex: string) => {
    if (!identity) return;
    try {
      const { encodeFollow } = await import('@vco/vco-schemas');
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const crypto = createNobleCryptoProvider();

      const subjectKey = Uint8Array.from(creatorIdHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
      const followData = { schema: Constants.FOLLOW_SCHEMA_URI, subjectKey, action: "follow" as const, timestampMs: BigInt(Date.now()) };
      const payload = encodeFollow(followData);
      
      const envelope = createEnvelope({ payload, payloadType: 0x50, creatorId: identity.creatorId, privateKey: identity.signingPrivateKey, powDifficulty: calculateDifficulty(payload) }, crypto);
      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);
      await vcoStore.putEnvelope({ cid: btoa(String.fromCharCode(...envelope.headerHash)), channelId: Constants.GLOBAL_SOCIAL_CHANNEL, payload: base64, timestamp: Date.now() });
      
      setFollowing(prev => new Set(prev).add(creatorIdHex));
      toast("Follow manifest published", "success");
    } catch (err) {
      console.error("Follow failed:", err);
      toast("Failed to publish follow manifest", "error");
    }
  };

  const unfollowPeer = async (creatorIdHex: string) => {
    if (!identity) return;
    try {
      const { encodeFollow } = await import('@vco/vco-schemas');
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const crypto = createNobleCryptoProvider();

      const subjectKey = Uint8Array.from(creatorIdHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
      const followData = { schema: Constants.FOLLOW_SCHEMA_URI, subjectKey, action: "unfollow" as const, timestampMs: BigInt(Date.now()) };
      const payload = encodeFollow(followData);
      
      const envelope = createEnvelope({ payload, payloadType: 0x50, creatorId: identity.creatorId, privateKey: identity.signingPrivateKey, powDifficulty: calculateDifficulty(payload) }, crypto);
      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);
      await vcoStore.putEnvelope({ cid: btoa(String.fromCharCode(...envelope.headerHash)), channelId: Constants.GLOBAL_SOCIAL_CHANNEL, payload: base64, timestamp: Date.now() });
      
      setFollowing(prev => {
        const next = new Set(prev);
        next.delete(creatorIdHex);
        return next;
      });
      toast("Unfollow manifest published", "info");
    } catch (err) {
      console.error("Unfollow failed:", err);
      toast("Failed to publish unfollow manifest", "error");
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    if (profile && identity) {
      try {
        const updated = { ...profile, ...data };
        setProfile(updated);
        await vcoStore.putProfile(identity.creatorIdHex, updated);
        
        const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
        const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
        const { encodeProfile } = await import('@vco/vco-schemas');
        const crypto = createNobleCryptoProvider();
        const payload = encodeProfile(updated);
        
        const envelope = createEnvelope({
          payload,
          payloadType: 0x50,
          creatorId: identity.creatorId,
          privateKey: identity.signingPrivateKey,
          powDifficulty: calculateDifficulty(payload)
        }, crypto);
        
        const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
        NodeClient.getInstance().putRecord(identity.creatorIdHex, base64);
        
        toast("Profile manifest updated locally and published to DHT", "success");
      } catch (err) {
        console.error("Profile update failed:", err);
        toast("Failed to update or publish profile", "error");
      }
    }
  };

  const markNotificationAsRead = (cid: Uint8Array) => {
    setNotifications(prev => prev.filter(n => n.targetCid !== cid));
    vcoStore.deleteNotificationByTarget(cid);
  };

  const setFilterAction = (f: { type: 'tag' | 'peer' | 'all'; value?: string } | null) => setFilter(f);

  const deletePost = async (cid: Uint8Array) => {
    if (!identity) return;
    try {
      const { encodeTombstone } = await import('@vco/vco-schemas');
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const crypto = createNobleCryptoProvider();
      const tombstoneData = { schema: Constants.TOMBSTONE_SCHEMA_URI, targetCid: cid, reason: "User requested deletion", timestampMs: BigInt(Date.now()) };
      const payload = encodeTombstone(tombstoneData);
      const envelope = createEnvelope({ payload, payloadType: 0x50, creatorId: identity.creatorId, privateKey: identity.signingPrivateKey, powDifficulty: calculateDifficulty(payload) }, crypto);
      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);
      await vcoStore.putEnvelope({ cid: btoa(String.fromCharCode(...envelope.headerHash)), channelId: Constants.GLOBAL_SOCIAL_CHANNEL, payload: base64, timestamp: Date.now() });
      setTombstones(prev => new Set(prev).add(toHex(cid)));
      toast("Tombstone published to swarm", "info");
    } catch (err) {
      console.error("Deletion failed:", err);
      toast("Failed to publish tombstone manifest", "error");
    }
  };

  const reactToPost = async (cid: Uint8Array) => {
    if (!identity) return;
    try {
      const { encodeReaction } = await import('@vco/vco-schemas');
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const crypto = createNobleCryptoProvider();
      const reactionData = { schema: Constants.REACTION_SCHEMA_URI, targetCid: cid, emoji: "❤️", timestampMs: BigInt(Date.now()) };
      const payload = encodeReaction(reactionData);
      const envelope = createEnvelope({ payload, payloadType: 0x50, creatorId: identity.creatorId, privateKey: identity.signingPrivateKey, powDifficulty: calculateDifficulty(payload) }, crypto);
      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);
      
      const targetHex = toHex(cid);
      setReactions(prev => {
        const next = new Map(prev);
        const set = next.get(targetHex) || new Set();
        set.add(identity.creatorIdHex);
        next.set(targetHex, set);
        return next;
      });

      toast("Reaction published", "success");
    } catch (err) {
      console.error("Reaction failed:", err);
      toast("Failed to publish reaction", "error");
    }
  };

  const repost = async (cid: Uint8Array, commentary: string = "") => {
    if (!identity) return;
    try {
      const { encodeRepost } = await import('@vco/vco-schemas');
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const crypto = createNobleCryptoProvider();
      const originalPost = feed.find(f => toHex(f.cid) === toHex(cid));
      if (!originalPost) return;
      const repostData = { schema: Constants.REPOST_SCHEMA_URI, originalPostCid: cid, originalAuthorCid: originalPost.authorId, commentary, timestampMs: BigInt(Date.now()) };
      const payload = encodeRepost(repostData);
      const envelope = createEnvelope({ payload, payloadType: 0x50, creatorId: identity.creatorId, privateKey: identity.signingPrivateKey, powDifficulty: calculateDifficulty(payload) }, crypto);
      const base64 = btoa(String.fromCharCode(...encodeEnvelopeProto(envelope)));
      NodeClient.getInstance().publish(Constants.GLOBAL_SOCIAL_CHANNEL, base64);
      
      const targetHex = toHex(cid);
      setReposts(prev => {
        const next = new Map(prev);
        const set = next.get(targetHex) || new Set();
        set.add(identity.creatorIdHex);
        next.set(targetHex, set);
        return next;
      });

      toast("Repost published to swarm", "success");
    } catch (err) {
      console.error("Repost failed:", err);
      toast("Failed to publish repost manifest", "error");
    }
  };

  const publishReport = async (cid: Uint8Array, reason: number) => {
    if (!identity) return;
    try {
      const { encodeReport } = await import('@vco/vco-schemas');
      const { createEnvelope, encodeEnvelopeProto } = await import('@vco/vco-core');
      const { createNobleCryptoProvider } = await import('@vco/vco-crypto');
      const crypto = createNobleCryptoProvider();
      const reportData = { schema: Constants.REPORT_SCHEMA_URI, targetCid: cid, reason: reason, timestampMs: BigInt(Date.now()) };
      const payload = encodeReport(reportData);
      const envelope = createEnvelope({ payload, payloadType: 0x50, creatorId: identity.creatorId, privateKey: identity.signingPrivateKey, powDifficulty: calculateDifficulty(payload) }, crypto);
      NodeClient.getInstance().publish(Constants.MODERATION_REPORTS_CHANNEL, btoa(String.fromCharCode(...encodeEnvelopeProto(envelope))));
      toast("Verifiable report broadcast to network", "success");
    } catch (err) {
      console.error("Reporting failed:", err);
      toast("Failed to publish moderation report", "error");
    }
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
      profile, identity, peerProfiles, feed: filteredFeed, replies, following, conversations, notifications, tombstones, reactions, reposts, filter, isLoading, isNodeReady, peerId, activeTab, activeThread, selectedConversationIndex, hasMoreFeed,
      setActiveTab, setActiveThread, setSelectedConversationIndex, createPost, createReply, sendDM, followPeer, unfollowPeer, updateProfile, markNotificationAsRead, setFilter: setFilterAction, deletePost, reactToPost, repost, publishReport, navigateToPost, navigateToPeer, resolvePeerProfile, loadMoreFeed,
      unlock, createIdentity, hasExistingIdentity
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
