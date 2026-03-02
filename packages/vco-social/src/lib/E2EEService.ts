import { 
  generateX25519KeyPair, 
  deriveSharedSecret, 
  encryptAesGcm, 
  decryptAesGcm, 
  ByteArray
} from '@vco/vco-crypto';
import { 
  encodeDirectMessagePayload, 
  decodeDirectMessagePayload,
  DirectMessagePayloadData
} from '@vco/vco-schemas';

export class E2EEService {
  /**
   * Encrypts a message for a recipient using their long-term X25519 public key.
   * Performs an ephemeral-static Diffie-Hellman key exchange.
   */
  static async encryptMessage(
    recipientPublicKey: ByteArray, 
    content: string, 
    mediaCids: Uint8Array[] = []
  ): Promise<{ ephemeralPubkey: ByteArray, nonce: ByteArray, encryptedPayload: ByteArray }> {
    // 1. Generate ephemeral keypair for this message
    const ephemeral = generateX25519KeyPair();
    
    // 2. Derive shared secret (X25519 DH)
    const sharedSecret = deriveSharedSecret(ephemeral.privateKey, recipientPublicKey);
    
    // 3. Prepare payload
    const payload: DirectMessagePayloadData = { content, mediaCids };
    const encodedPayload = encodeDirectMessagePayload(payload);
    
    // 4. Generate random nonce (12 bytes for AES-GCM)
    const nonce = window.crypto.getRandomValues(new Uint8Array(12));
    
    // 5. Encrypt with AES-GCM
    const encryptedPayload = await encryptAesGcm(sharedSecret, nonce, encodedPayload);
    
    return {
      ephemeralPubkey: ephemeral.publicKey,
      nonce,
      encryptedPayload
    };
  }

  /**
   * Decrypts a message using the local long-term X25519 private key.
   */
  static async decryptMessage(
    localPrivateKey: ByteArray, 
    ephemeralPublicKey: ByteArray, 
    nonce: ByteArray, 
    encryptedPayload: ByteArray
  ): Promise<DirectMessagePayloadData> {
    // 1. Derive shared secret (X25519 DH)
    const sharedSecret = deriveSharedSecret(localPrivateKey, ephemeralPublicKey);
    
    // 2. Decrypt with AES-GCM
    const decodedPayload = await decryptAesGcm(sharedSecret, nonce, encryptedPayload);
    
    // 3. Decode payload
    return decodeDirectMessagePayload(decodedPayload);
  }
}
