import { 
  encodePost, 
  POST_V3_SCHEMA_URI,
  PostData,
  extractHashtags
} from '@vco/vco-schemas';
import { toHex } from '@/lib/encoding';
import { blake3 } from '@vco/vco-crypto';
import { vcoStore } from './VcoStore';

export class FeedService {
  /**
   * Publishes a new post to the decentralized network.
   */
  static async publishPost(
    content: string, 
    mediaFiles: File[] = [],
    channelId?: string
  ): Promise<Uint8Array> {
    const tags = extractHashtags(content);
    
    // Media hashing and storage
    const mediaCids = await Promise.all(mediaFiles.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const cid = blake3(new Uint8Array(buffer));
      await vcoStore.putBlob(cid, file);
      return cid;
    }));

    const postData: PostData = {
      schema: POST_V3_SCHEMA_URI,
      content,
      mediaCids,
      timestampMs: BigInt(Date.now()),
      tags,
      channelId
    };
    
    const encodedPost = encodePost(postData);
    
    // In a real app, we would send this to the vco-node
    console.log("Post encoded:", encodedPost.length, "bytes with", mediaCids.length, "media objects");
    return encodedPost;
  }
}
