export const PROTOCOL_VERSION = 0x03;
export const MAX_VCO_SIZE = 4_194_304;
export const RECON_THRESHOLD = 16;
export const IDLE_TIMEOUT_SECONDS = 300;
export const MAGIC_BYTES = 0x56434f03;
export const HEADER_HASH_LENGTH = 32;
export const FLAG_EPHEMERAL = 1 << 7;
export const FLAG_OBFUSCATED = 1 << 6;
export const FLAG_POW_ACTIVE = 1 << 5;
export const FLAG_ZKP_AUTH = 1 << 4;
// Deprecated alias maintained for compatibility with pre-v3.2 callers.
export const FLAG_FRAGMENTED = FLAG_POW_ACTIVE;
export const RESERVED_FLAG_MASK = 0x0f;
// Multicodec values (https://github.com/multiformats/multicodec)
export const MULTICODEC_ED25519_PUB = 0xed;
export const MULTICODEC_SECP256K1_PUB = 0xe7;
export const MULTICODEC_PROTOBUF = 0x50;
export const MULTIHASH_BLAKE3_256 = 0x1e;
export const ED25519_PUBLIC_KEY_LENGTH = 32;
export const ED25519_SIGNATURE_LENGTH = 64;
export const MULTICODEC_VCO_SEQUENCE = 0x04;
//# sourceMappingURL=constants.js.map