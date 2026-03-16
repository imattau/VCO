import { 
  ProfileData, 
  PostData, 
  ReplyData,
  RepostData,
  decodePost,
  decodeReply,
  decodeFollow,
  decodeReaction,
  decodeRepost,
  POST_SCHEMA_URI,
  POST_V2_SCHEMA_URI,
  POST_V3_SCHEMA_URI,
  REPLY_SCHEMA_URI,
  FOLLOW_SCHEMA_URI,
  REACTION_SCHEMA_URI,
  REPOST_SCHEMA_URI
} from '@vco/vco-schemas';
import { decodeEnvelopeProto as decodeCore } from '@vco/vco-core';
import { toHex, fromHex } from './encoding';
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
    followingSet: Set<string>,
    myCreatorIdHex?: string,
    extraPostsByCid?: Map<string, { authorId: Uint8Array, data: PostData, authorProfile: ProfileData }>
  ): ProcessedResults {
    const feedItems: FeedItem[] = [];
    const replyItems: ReplyItem[] = [];
    const followSet = new Set<string>(followingSet);
    const reactionMap = new Map<string, Set<string>>();
    const repostMap = new Map<string, Set<string>>();
    const notifications: any[] = [];

    const effectiveMyCreatorIdHex = myCreatorIdHex || "";

    // Pass 1: Cache posts — seed with any posts resolved from a prior session.
    const allPostsByCid = new Map<string, { authorId: Uint8Array, data: PostData, authorProfile: ProfileData }>(extraPostsByCid);
    for (const e of envelopes) {
      try {
        const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
        const coreEnvelope = decodeCore(bytes);
        
        // Attempt to decode as Post first to cache them for reply/reaction/repost resolution
        try {
          const post = decodePost(coreEnvelope.payload);
          if (post.schema === POST_SCHEMA_URI || post.schema === POST_V2_SCHEMA_URI || post.schema === POST_V3_SCHEMA_URI) {
            const creatorIdHex = toHex(coreEnvelope.header.creatorId);
            const authorProfile = creatorIdHex === effectiveMyCreatorIdHex ? myProfile : profileMap.get(creatorIdHex) || this.createPlaceholderProfile(creatorIdHex);
            
            allPostsByCid.set(toHex(coreEnvelope.headerHash), {
              authorId: coreEnvelope.header.creatorId,
              data: post,
              authorProfile
            });
          }
        } catch { /* Not a post */ }
      } catch (e) { 
        console.warn('FeedProcessor: failed to process item', e);
      }
    }

    // Pass 2: Full processing
    for (const e of envelopes) {
      try {
        const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
        const coreEnvelope = decodeCore(bytes);
        const cid = fromHex(e.cid);
        const creatorIdHex = toHex(coreEnvelope.header.creatorId);
        const authorProfile = creatorIdHex === effectiveMyCreatorIdHex ? myProfile : profileMap.get(creatorIdHex) || this.createPlaceholderProfile(creatorIdHex);

        if (e.channelId === Constants.GLOBAL_SOCIAL_CHANNEL) {
          // Identify schema by attempting to decode in priority order
          
          // 1. Reply?
          try {
            const reply = decodeReply(coreEnvelope.payload);
            if (reply.schema === REPLY_SCHEMA_URI) {
              replyItems.push({ cid, authorId: coreEnvelope.header.creatorId, data: reply, authorProfile });
              
              const parentPost = allPostsByCid.get(toHex(reply.parentCid));
              if (parentPost == null) {
                console.debug('FeedProcessor: reply references unknown parent CID', toHex(reply.parentCid));
              } else if (toHex(parentPost.authorId) === effectiveMyCreatorIdHex && creatorIdHex !== effectiveMyCreatorIdHex) {
                notifications.push({
                  cid,
                  type: 1, // Reply
                  actorCid: coreEnvelope.header.creatorId,
                  targetCid: reply.parentCid,
                  content: `replied to your post: "${reply.content.substring(0, 30)}..."`,
                  timestampMs: reply.timestampMs
                });
              }
              continue;
            }
          } catch { /* Not a reply */ }

          // 2. Post?
          try {
            const post = decodePost(coreEnvelope.payload);
            if (post.schema === POST_SCHEMA_URI || post.schema === POST_V2_SCHEMA_URI || post.schema === POST_V3_SCHEMA_URI) {
              feedItems.push({ cid, authorId: coreEnvelope.header.creatorId, data: post, authorProfile });
              continue;
            }
          } catch { /* Not a post */ }

          // 3. Follow?
          try {
            const followData = decodeFollow(coreEnvelope.payload);
            if (followData.schema === FOLLOW_SCHEMA_URI) {
              if (creatorIdHex === effectiveMyCreatorIdHex) {
                if (followData.action === "follow") followSet.add(toHex(followData.subjectKey));
                else followSet.delete(toHex(followData.subjectKey));
              }
              continue;
            }
          } catch { /* Not follow */ }

          // 4. Reaction?
          try {
            const reactionData = decodeReaction(coreEnvelope.payload);
            if (reactionData.schema === REACTION_SCHEMA_URI) {
              const targetHex = toHex(reactionData.targetCid);
              if (!reactionMap.has(targetHex)) reactionMap.set(targetHex, new Set());
              reactionMap.get(targetHex)!.add(creatorIdHex);

              const targetPost = allPostsByCid.get(targetHex);
              if (targetPost == null) {
                console.debug('FeedProcessor: reaction references unknown target CID', targetHex);
              } else if (toHex(targetPost.authorId) === effectiveMyCreatorIdHex && creatorIdHex !== effectiveMyCreatorIdHex) {
                notifications.push({
                  cid,
                  type: 3, // Reaction/Like
                  actorCid: coreEnvelope.header.creatorId,
                  targetCid: reactionData.targetCid,
                  content: `liked your post`,
                  timestampMs: reactionData.timestampMs || BigInt(Date.now())
                });
              }
              continue;
            }
          } catch { /* Not a reaction */ }

          // 5. Repost?
          try {
            const repostData = decodeRepost(coreEnvelope.payload);
            if (repostData.schema === REPOST_SCHEMA_URI) {
              const targetHex = toHex(repostData.originalPostCid);
              if (!repostMap.has(targetHex)) repostMap.set(targetHex, new Set());
              repostMap.get(targetHex)!.add(creatorIdHex);

              const original = allPostsByCid.get(targetHex);
              if (original == null) {
                console.debug('FeedProcessor: repost references unknown original CID', targetHex);
              } else {
                feedItems.push({ 
                  cid, 
                  authorId: original.authorId, 
                  data: original.data, 
                  authorProfile: original.authorProfile,
                  repostBy: {
                    profile: authorProfile,
                    timestampMs: repostData.timestampMs
                  }
                });

                if (toHex(original.authorId) === effectiveMyCreatorIdHex && creatorIdHex !== effectiveMyCreatorIdHex) {
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
              continue;
            }
          } catch { /* Not a repost */ }
        }
      } catch (e) { /* Skip invalid item */ }
    }

    return { feedItems, replyItems, followSet, reactionMap, repostMap, notifications };
  }

  private static createPlaceholderProfile(hex: string): ProfileData {
    return {
      schema: Constants.PROFILE_SCHEMA_URI,
      displayName: `User ${hex.substring(0, 6)}`,
      bio: "Offline identity",
      avatarCid: new Uint8Array(0),
      nip05: "",
      lightningAddress: "",
      customFields: {}
    };
  }
}
