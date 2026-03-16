import { 
  DirectMessageData,
  decodeDirectMessage
} from '@vco/vco-schemas';
import { decodeEnvelopeProto as decodeCore } from '@vco/vco-core';
import { toHex, fromHex } from './encoding';
import { E2EEService } from './E2EEService';
import { IdentityKeys } from './KeyringService';

export interface MessageWithMetadata {
  cid: Uint8Array;
  data: DirectMessageData;
  payload: { content: string; mediaCids: Uint8Array[] };
  isOwn: boolean;
}

export class DMProcessor {
  /**
   * Processes envelopes to extract and decrypt direct messages.
   */
  static async process(
    envelopes: any[], 
    identity: IdentityKeys
  ): Promise<Map<string, MessageWithMetadata[]>> {
    const dmMap = new Map<string, MessageWithMetadata[]>();

    for (const e of envelopes) {
      if (typeof e.channelId !== 'string') continue;
      if (e.channelId.startsWith("vco://channels/dm/")) {
        try {
          const bytes = Uint8Array.from(atob(e.payload), c => c.charCodeAt(0));
          const coreEnvelope = decodeCore(bytes);
          const cid = fromHex(e.cid);
          const creatorIdHex = toHex(coreEnvelope.header.creatorId);
          const dmData = decodeDirectMessage(coreEnvelope.payload);

          let decrypted: any = { content: "[Encrypted Message]", mediaCids: [] };
          try {
            decrypted = await E2EEService.decryptMessage(
              identity.encryptionPrivateKey,
              dmData.ephemeralPubkey,
              dmData.nonce,
              dmData.encryptedPayload
            );
          } catch (e) {
            console.warn('DMProcessor: decryption failed', e);
          }

          const msg: MessageWithMetadata = {
            cid,
            data: dmData,
            payload: decrypted,
            isOwn: creatorIdHex === identity.creatorIdHex
          };

          const peerKey = e.channelId.replace("vco://channels/dm/", "");
          if (!dmMap.has(peerKey)) dmMap.set(peerKey, []);
          dmMap.get(peerKey)!.push(msg);
        } catch (e) {
          console.warn('DMProcessor: failed to decode envelope or DM for cid', e?.cid, e);
        }
      }
    }

    return dmMap;
  }
}
