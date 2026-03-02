import { 
  encodePost, 
  POST_V3_SCHEMA_URI,
  PostData,
  extractHashtags
} from '@vco/vco-schemas';

export class FeedService {
  /**
   * Publishes a new post to the decentralized network.
   */
  static async publishPost(
    content: string, 
    mediaCids: Uint8Array[] = [],
    channelId?: string
  ): Promise<Uint8Array> {
    const tags = extractHashtags(content);
    
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
    // Mocking for now
    console.log("Post encoded:", encodedPost.length, "bytes");
    return encodedPost;
  }
}
