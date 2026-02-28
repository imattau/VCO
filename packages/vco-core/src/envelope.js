import { FLAG_POW_ACTIVE, FLAG_ZKP_AUTH, MULTIHASH_BLAKE3_256, PROTOCOL_VERSION, } from "./constants.js";
import { EnvelopeValidationError } from "./errors.js";
import { vco } from "./generated/vco.pb.js";
import { decodeMultihash, decodeMultikey, encodeBlake3Multihash, } from "./multiformat.js";
import { solvePoWNonce } from "./pow.js";
import { validateEnvelope } from "./validation.js";
const MAX_UINT32 = 0xffff_ffff;
function bytesEqual(left, right) {
    if (left.length !== right.length) {
        return false;
    }
    for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) {
            return false;
        }
    }
    return true;
}
function encodeSigningMaterial(material) {
    return vco.v3.EnvelopeSigningMaterial.encode(vco.v3.EnvelopeSigningMaterial.create(material))
        .finish();
}
function encodeHeaderHashMaterial(material) {
    return vco.v3.EnvelopeHeaderHashMaterial
        .encode(vco.v3.EnvelopeHeaderHashMaterial.create(material))
        .finish();
}
function toEnvelopeSigningMaterial(envelope) {
    return {
        version: envelope.header.version,
        flags: envelope.header.flags,
        payloadType: envelope.header.payloadType,
        creatorId: envelope.header.creatorId,
        payloadHash: envelope.header.payloadHash,
    };
}
function computeHeaderHash(material, signature, nonce, crypto) {
    return crypto.digest(encodeHeaderHashMaterial({
        ...material,
        signature,
        nonce,
    }));
}
function assertUint32(value, fieldName) {
    if (!Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
        throw new EnvelopeValidationError(`${fieldName} must be a uint32.`);
    }
}
function cloneZkpExtension(extension) {
    return {
        circuitId: extension.circuitId,
        proofLength: extension.proofLength,
        proof: Uint8Array.from(extension.proof),
        inputsLength: extension.inputsLength,
        publicInputs: Uint8Array.from(extension.publicInputs),
        nullifier: Uint8Array.from(extension.nullifier),
    };
}
/**
 * Creates a new Verifiable Content Object (VCO) envelope from the given input.
 * Handles signing, payload hashing, and Proof of Work (PoW) computation.
 *
 * @param input The data and configuration for the envelope (e.g., payload, creator keys).
 * @param crypto The cryptographic provider for hashes and signatures.
 * @returns A fully constructed and verified VcoEnvelope object.
 * @throws {EnvelopeValidationError} If input parameters are invalid or cryptographic operations fail.
 */
export function createEnvelope(input, crypto) {
    const requestedDifficulty = input.powDifficulty ?? 0;
    const powRequested = requestedDifficulty > 0;
    const flags = (input.flags ?? 0) | (powRequested ? FLAG_POW_ACTIVE : 0);
    const isZkpAuth = (flags & FLAG_ZKP_AUTH) !== 0;
    const payload = Uint8Array.from(input.payload);
    let creatorId = new Uint8Array();
    let signature = new Uint8Array();
    let signingKey;
    let nonce = input.nonce ?? 0;
    assertUint32(nonce, "nonce");
    if (isZkpAuth) {
        creatorId = new Uint8Array();
        signature = new Uint8Array();
    }
    else {
        const maybeCreatorId = "creatorId" in input ? input.creatorId : undefined;
        const maybePrivateKey = "privateKey" in input ? input.privateKey : undefined;
        if (!maybeCreatorId || !maybePrivateKey) {
            throw new EnvelopeValidationError("creatorId and privateKey are required unless FLAG_ZKP_AUTH is set.");
        }
        creatorId = Uint8Array.from(maybeCreatorId);
        signingKey = Uint8Array.from(maybePrivateKey);
    }
    const payloadDigest = crypto.digest(payload);
    const payloadHash = encodeBlake3Multihash(payloadDigest);
    const material = {
        version: input.version ?? PROTOCOL_VERSION,
        flags,
        payloadType: input.payloadType,
        creatorId,
        payloadHash,
    };
    if (!isZkpAuth) {
        if (!signingKey) {
            throw new EnvelopeValidationError("Missing privateKey for signature-auth envelope.");
        }
        const signingMaterial = encodeSigningMaterial(material);
        signature = Uint8Array.from(crypto.sign(signingMaterial, signingKey));
    }
    let headerHash = computeHeaderHash(material, signature, nonce, crypto);
    if (powRequested) {
        const solved = solvePoWNonce({
            initialNonce: nonce,
            difficulty: requestedDifficulty,
            hashForNonce: (candidateNonce) => computeHeaderHash(material, signature, candidateNonce, crypto),
        });
        nonce = solved.nonce;
        headerHash = solved.headerHash;
    }
    let zkpExtension;
    if (isZkpAuth) {
        if (!("zkpExtension" in input) || !input.zkpExtension) {
            throw new EnvelopeValidationError("zkpExtension is required when FLAG_ZKP_AUTH is set.");
        }
        zkpExtension = cloneZkpExtension(input.zkpExtension);
    }
    const envelope = {
        headerHash,
        header: {
            version: material.version,
            flags: material.flags,
            payloadType: material.payloadType,
            creatorId,
            payloadHash,
            signature,
            nonce,
        },
        payload,
        zkpExtension,
    };
    validateEnvelope(envelope);
    return envelope;
}
/**
 * Asserts the full cryptographic integrity and validity of an envelope.
 * Verifies payload hashes, signatures, and header hashes.
 *
 * @param envelope The envelope to verify.
 * @param crypto The cryptographic provider for hashes and signatures.
 * @throws {EnvelopeValidationError} If any cryptographic verification fails.
 */
export function assertEnvelopeIntegrity(envelope, crypto) {
    validateEnvelope(envelope);
    const decodedPayloadHash = decodeMultihash(envelope.header.payloadHash);
    if (decodedPayloadHash.code !== MULTIHASH_BLAKE3_256) {
        throw new EnvelopeValidationError(`Unsupported payload multihash code ${decodedPayloadHash.code}.`);
    }
    const expectedPayloadDigest = crypto.digest(envelope.payload);
    if (!bytesEqual(expectedPayloadDigest, decodedPayloadHash.digestBytes)) {
        throw new EnvelopeValidationError("Envelope payload hash mismatch.");
    }
    const isZkpAuth = (envelope.header.flags & FLAG_ZKP_AUTH) !== 0;
    if (!isZkpAuth) {
        const signingMaterial = encodeSigningMaterial(toEnvelopeSigningMaterial(envelope));
        const creatorKey = decodeMultikey(envelope.header.creatorId);
        if (!crypto.verify(signingMaterial, envelope.header.signature, creatorKey.keyBytes)) {
            throw new EnvelopeValidationError("Envelope signature verification failed.");
        }
    }
    const expectedHeaderHash = computeHeaderHash(toEnvelopeSigningMaterial(envelope), envelope.header.signature, envelope.header.nonce, crypto);
    if (!bytesEqual(expectedHeaderHash, envelope.headerHash)) {
        throw new EnvelopeValidationError("Envelope header hash mismatch.");
    }
}
/**
 * Verifies the integrity of an envelope and returns a boolean.
 *
 * @param envelope The envelope to verify.
 * @param crypto The cryptographic provider for hashes and signatures.
 * @returns True if the envelope is valid and integrity is verified.
 */
export function verifyEnvelope(envelope, crypto) {
    try {
        assertEnvelopeIntegrity(envelope, crypto);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=envelope.js.map