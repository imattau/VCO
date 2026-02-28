import { FLAG_POW_ACTIVE, FLAG_ZKP_AUTH } from "./constants.js";
import { assertEnvelopeIntegrity } from "./envelope.js";
import { verifyPoW } from "./pow.js";
export class InMemoryNullifierStore {
    seen = new Set();
    has(nullifierHex) {
        return this.seen.has(nullifierHex);
    }
    add(nullifierHex) {
        this.seen.add(nullifierHex);
    }
}
export function isZkpAuthEnvelope(envelope) {
    return (envelope.header.flags & FLAG_ZKP_AUTH) !== 0;
}
function toHex(bytes) {
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}
export class VCOCore {
    crypto;
    verifiers = new Map();
    nullifierStore;
    minPowDifficulty;
    constructor(crypto, options = {}) {
        this.crypto = crypto;
        this.nullifierStore = options.nullifierStore ?? new InMemoryNullifierStore();
        this.minPowDifficulty = options.minPowDifficulty ?? 0;
    }
    registerVerifier(verifier) {
        this.verifiers.set(verifier.circuitId, verifier);
    }
    unregisterVerifier(circuitId) {
        this.verifiers.delete(circuitId);
    }
    async validateEnvelope(envelope, options = {}) {
        try {
            assertEnvelopeIntegrity(envelope, this.crypto);
        }
        catch {
            return false;
        }
        const requiredPowDifficulty = options.powDifficulty ?? this.minPowDifficulty;
        if (requiredPowDifficulty > 0) {
            const powActive = (envelope.header.flags & FLAG_POW_ACTIVE) !== 0;
            if (!powActive) {
                return false;
            }
            let validPow = false;
            try {
                validPow = verifyPoW(envelope.headerHash, requiredPowDifficulty);
            }
            catch {
                return false;
            }
            if (!validPow) {
                return false;
            }
        }
        if (!isZkpAuthEnvelope(envelope)) {
            return true;
        }
        if (!envelope.zkpExtension) {
            return false;
        }
        const verifier = this.verifiers.get(envelope.zkpExtension.circuitId);
        if (!verifier) {
            return false;
        }
        const nullifierHex = toHex(envelope.zkpExtension.nullifier);
        if (await this.nullifierStore.has(nullifierHex)) {
            return false;
        }
        let isProofValid = false;
        try {
            isProofValid = await verifier.verify(envelope.zkpExtension.proof, envelope.zkpExtension.publicInputs, envelope.header.payloadHash);
        }
        catch {
            return false;
        }
        if (!isProofValid) {
            return false;
        }
        await this.nullifierStore.add(nullifierHex);
        return true;
    }
}
//# sourceMappingURL=zkp.js.map