import { ED25519_PUBLIC_KEY_LENGTH, MULTICODEC_ED25519_PUB, MULTICODEC_SECP256K1_PUB, MULTIHASH_BLAKE3_256, } from "./constants.js";
import { MultiformatError } from "./errors.js";
import { digest, varint } from "multiformats";
export function encodeVarint(value) {
    if (!Number.isInteger(value) || value < 0) {
        throw new MultiformatError("Varint value must be a non-negative integer.");
    }
    const out = new Uint8Array(varint.encodingLength(value));
    return varint.encodeTo(value, out, 0);
}
export function decodeVarint(bytes, offset = 0) {
    try {
        const [value, bytesRead] = varint.decode(bytes, offset);
        return { value, bytesRead };
    }
    catch {
        throw new MultiformatError("Failed to decode varint.");
    }
}
function concatBytes(...parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
}
export function encodeEd25519Multikey(publicKey) {
    if (publicKey.length !== ED25519_PUBLIC_KEY_LENGTH) {
        throw new MultiformatError(`Ed25519 public key must be ${ED25519_PUBLIC_KEY_LENGTH} bytes.`);
    }
    return concatBytes(encodeVarint(MULTICODEC_ED25519_PUB), publicKey);
}
export function decodeMultikey(multikey) {
    if (multikey.length === 0) {
        throw new MultiformatError("creatorId must not be empty.");
    }
    const { value: codec, bytesRead } = decodeVarint(multikey);
    const keyBytes = multikey.slice(bytesRead);
    if (keyBytes.length === 0) {
        throw new MultiformatError("multikey must include key bytes.");
    }
    return { codec, keyBytes };
}
export function assertValidCreatorMultikey(multikey) {
    const decoded = decodeMultikey(multikey);
    if (decoded.codec === MULTICODEC_ED25519_PUB && decoded.keyBytes.length !== ED25519_PUBLIC_KEY_LENGTH) {
        throw new MultiformatError(`Ed25519 multikey payload must be ${ED25519_PUBLIC_KEY_LENGTH} bytes.`);
    }
    if (decoded.codec === MULTICODEC_SECP256K1_PUB &&
        decoded.keyBytes.length !== 33 &&
        decoded.keyBytes.length !== 65) {
        throw new MultiformatError("Secp256k1 multikey payload must be 33 or 65 bytes.");
    }
    if (decoded.codec !== MULTICODEC_ED25519_PUB && decoded.codec !== MULTICODEC_SECP256K1_PUB) {
        throw new MultiformatError(`Unsupported multikey codec ${decoded.codec}.`);
    }
}
export function encodeBlake3Multihash(digestBytes) {
    return digest.create(MULTIHASH_BLAKE3_256, digestBytes).bytes;
}
export function decodeMultihash(multihash) {
    try {
        const decoded = digest.decode(multihash);
        return {
            code: decoded.code,
            digestSize: decoded.size,
            digestBytes: decoded.digest,
        };
    }
    catch {
        throw new MultiformatError("Failed to decode multihash.");
    }
}
export function assertValidPayloadMultihash(multihash) {
    const decoded = decodeMultihash(multihash);
    if (decoded.digestBytes.length === 0) {
        throw new MultiformatError("multihash digest must not be empty.");
    }
}
//# sourceMappingURL=multiformat.js.map