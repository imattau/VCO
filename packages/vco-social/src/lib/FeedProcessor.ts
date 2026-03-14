import { 
  ProfileData, 
  PostData, 
  ReplyData,
  RepostData,
  decodePost,
  decodeReply,
  decodeFollow,
  decodeReaction,
  decodeRepost
} from '@vco/vco-schemas';
import { decodeEnvelopeProto as decodeCore } from '@vco/vco-core';
import { toHex } from '@vco/vco-testing';
import * as Constants from './constants';

export interface FeedItem {
  cid: Uint8Array;
  authorId: Uint8Array;
  data: PostData;
  authorProfile: ProfileData;
  repostBy?: {
    profile: ProfileData;
    timestampMs: bigint;
  };
}

export interface ReplyItem {
  cid: Uint8Array;
  authorId: Uint8Array;
  data: ReplyData;
  authorProfile: ProfileData;
}

export interface ProcessedResults {
  feedItems: FeedItem[];
  replyItems: ReplyItem[];
  followSet: Set<string>;
  reactionMap: Map<string, Set<string>>;
  repostMap: Map<string, Set<string>>;
  notifications: any[];
}

export class FeedProcessor {
  /**
   * Pure logic to process a batch of envelopes and build timeline state.
   */
  static process(
    envelopes: any[], 
    myProfile: ProfileData, 
    profileMap: Map<string, ProfileData>, 
    myCreatorIdHex: string
  ): ProcessedResults {
    const feedItems: FeedItem[] = [];
    const replyItems: ReplyItem[] = [];
    const followSet = new Set<string>();
    const reactionMap = new Map<string, Set<string>>();
    const repostMap = new Map<string, Set<string>>();
    const notifications: any[] = [];

    // Pass 1: Cache posts
    const allPostsByCid = new Map<string, { authorId: Uint8Array, data: PostData, authorProfile: ProfileData }>();
    for (const e of envelopes) {
      try {
        const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
        const coreEnvelope = decodeCore(bytes);
        const payloadRaw = new TextDecoder().decode(coreEnvelope.payload);
        
        if (payloadRaw.includes(Constants.POST_SCHEMA_URI)) {
          const creatorIdHex = toHex(coreEnvelope.header.creatorId);
          const authorProfile = creatorIdHex === myCreatorIdHex ? myProfile : profileMap.get(creatorIdHex) || this.createPlaceholderProfile(creatorIdHex);
          
          allPostsByCid.set(toHex(coreEnvelope.headerHash), {
            authorId: coreEnvelope.header.creatorId,
            data: decodePost(coreEnvelope.payload),
            authorProfile
          });
        }
      } catch {}
    }

    // Pass 2: Full processing
    for (const e of envelopes) {
      try {
        const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
        const coreEnvelope = decodeCore(bytes);
        const cid = Uint8Array.from(atob(e.cid), c => c.charCodeAt(0));
        const creatorIdHex = toHex(coreEnvelope.header.creatorId);
        const authorProfile = creatorIdHex === myCreatorIdHex ? myProfile : profileMap.get(creatorIdHex) || this.createPlaceholderProfile(creatorIdHex);

        if (e.channelId === Constants.GLOBAL_SOCIAL_CHANNEL) {
          const payloadRaw = new TextDecoder().decode(coreEnvelope.payload);

          if (payloadRaw.includes(Constants.REPLY_SCHEMA_URI)) {
            const data = decodeReply(coreEnvelope.payload);
            replyItems.push({ cid, authorId: coreEnvelope.header.creatorId, data, authorProfile });
            
            // Notification: Someone replied to me
            const parentPost = allPostsByCid.get(toHex(data.parentCid));
            if (parentPost && toHex(parentPost.authorId) === myCreatorIdHex && creatorIdHex !== myCreatorIdHex) {
              notifications.push({
                cid,
                type: 1, // Reply
                actorCid: coreEnvelope.header.creatorId,
                targetCid: data.parentCid,
                content: `replied to your post: "${data.content.substring(0, 30)}..."`,
                timestampMs: data.timestampMs
              });
            }
          } else if (payloadRaw.includes(Constants.FOLLOW_SCHEMA_URI)) {
            const followData = decodeFollow(coreEnvelope.payload);
            if (creatorIdHex === myCreatorIdHex) {
              if (followData.action === "follow") followSet.add(toHex(followData.subjectKey));
              else followSet.delete(toHex(followData.subjectKey));
            }
          } else if (payloadRaw.includes(Constants.POST_SCHEMA_URI)) {
            feedItems.push({ cid, authorId: coreEnvelope.header.creatorId, data: decodePost(coreEnvelope.payload), authorProfile });
          } else if (payloadRaw.includes(Constants.REACTION_SCHEMA_URI)) {
            const reactionData = decodeReaction(coreEnvelope.payload);
            const targetHex = toHex(reactionData.targetCid);
            
            if (!reactionMap.has(targetHex)) reactionMap.set(targetHex, new Set());
            reactionMap.get(targetHex)!.add(creatorIdHex);

            // Notification: Someone liked my post
            const targetPost = allPostsByCid.get(targetHex);
            if (targetPost && toHex(targetPost.authorId) === myCreatorIdHex && creatorIdHex !== myCreatorIdHex) {
              notifications.push({
                cid,
                type: 3, // Reaction/Like
                actorCid: coreEnvelope.header.creatorId,
                targetCid: reactionData.targetCid,
                content: `liked your post`,
                timestampMs: reactionData.timestampMs || BigInt(Date.now())
              });
            }
          } else if (payloadRaw.includes(Constants.REPOST_SCHEMA_URI)) {
            const repostData = decodeRepost(coreEnvelope.payload);
            const targetHex = toHex(repostData.originalPostCid);
            
            if (!repostMap.has(targetHex)) repostMap.set(targetHex, new Set());
            repostMap.get(targetHex)!.add(creatorIdHex);

            const original = allPostsByCid.get(targetHex);
            if (original) {
              feedItems.push({
                cid: repostData.originalPostCid,
                authorId: original.authorId,
                data: original.data,
                authorProfile: original.authorProfile,
                repostBy: { profile: authorProfile, timestampMs: repostData.timestampMs }
              });

              // Notification: Someone reposted me
              if (toHex(original.authorId) === myCreatorIdHex && creatorIdHex !== myCreatorIdHex) {
                notifications.push({
                  cid,
                  type: 2, // Repost
                  actorCid: coreEnvelope.header.creatorId,
                  targetCid: repostData.originalPostCid,
                  content: `reposted your post`,
                  timestampMs: repostData.timestampMs
                });
              }
            }
          }
        }
      } catch {}
    }

    return { feedItems, replyItems, followSet, reactionMap, repostMap, notifications };
  }

  private static createPlaceholderProfile(hex: string): ProfileData {
    return {
      schema: Constants.PROFILE_SCHEMA_URI,
      displayName: `Peer ${hex.substring(0, 6)}`,
      avatarCid: new Uint8Array(0),
      previousManifest: new Uint8Array(0),
      bio: "Offline identity"
    };
  }
}
