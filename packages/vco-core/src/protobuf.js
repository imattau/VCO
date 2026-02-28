import { vco } from "./generated/vco.pb.js";
import { assertPayloadFragmentIntegrity, assertPayloadFragmentSetIntegrity, } from "./fragmentation.js";
import { validateEnvelope } from "./validation.js";
function toUint8Array(value) {
    if (!value) {
        return new Uint8Array();
    }
    return value.constructor === Uint8Array ? value : Uint8Array.from(value);
}
function toProtoEnvelope(envelope) {
    return {
        headerHash: envelope.headerHash,
        version: envelope.header.version,
        flags: envelope.header.flags,
        payloadType: envelope.header.payloadType,
        creatorId: envelope.header.creatorId,
        payloadHash: envelope.header.payloadHash,
        signature: envelope.header.signature,
        payload: envelope.payload,
        nonce: envelope.header.nonce,
        zkpExtension: envelope.zkpExtension
            ? {
                circuitId: envelope.zkpExtension.circuitId,
                proofLength: envelope.zkpExtension.proofLength,
                proof: envelope.zkpExtension.proof,
                inputsLength: envelope.zkpExtension.inputsLength,
                publicInputs: envelope.zkpExtension.publicInputs,
                nullifier: envelope.zkpExtension.nullifier,
            }
            : null,
    };
}
function fromProtoEnvelope(message) {
    const zkpExtension = message.zkpExtension
        ? {
            circuitId: message.zkpExtension.circuitId ?? 0,
            proofLength: message.zkpExtension.proofLength ?? 0,
            proof: toUint8Array(message.zkpExtension.proof),
            inputsLength: message.zkpExtension.inputsLength ?? 0,
            publicInputs: toUint8Array(message.zkpExtension.publicInputs),
            nullifier: toUint8Array(message.zkpExtension.nullifier),
        }
        : undefined;
    return {
        headerHash: toUint8Array(message.headerHash),
        header: {
            version: message.version,
            flags: message.flags,
            payloadType: message.payloadType,
            creatorId: toUint8Array(message.creatorId),
            payloadHash: toUint8Array(message.payloadHash),
            signature: toUint8Array(message.signature),
            nonce: message.nonce ?? 0,
        },
        payload: toUint8Array(message.payload),
        zkpExtension,
    };
}
export function encodeEnvelopeProto(envelope) {
    validateEnvelope(envelope);
    const protoEnvelope = toProtoEnvelope(envelope);
    const validationError = vco.v3.Envelope.verify(protoEnvelope);
    if (validationError) {
        throw new Error(`Envelope protobuf validation failed: ${validationError}`);
    }
    return vco.v3.Envelope.encode(vco.v3.Envelope.create(protoEnvelope)).finish();
}
export function decodeEnvelopeProto(encoded) {
    const envelope = fromProtoEnvelope(vco.v3.Envelope.decode(encoded));
    validateEnvelope(envelope);
    return envelope;
}
export function encodeSyncMessageProto(message) {
    const protoMessage = {
        ranges: message.ranges.map((range) => ({
            startHash: range.startHash,
            endHash: range.endHash,
            fingerprint: range.fingerprint,
        })),
    };
    const validationError = vco.v3.SyncMessage.verify(protoMessage);
    if (validationError) {
        throw new Error(`SyncMessage protobuf validation failed: ${validationError}`);
    }
    return vco.v3.SyncMessage.encode(vco.v3.SyncMessage.create(protoMessage)).finish();
}
export function decodeSyncMessageProto(encoded) {
    const object = vco.v3.SyncMessage.decode(encoded);
    return {
        ranges: (object.ranges ?? []).map((range) => ({
            startHash: toUint8Array(range.startHash),
            endHash: toUint8Array(range.endHash),
            fingerprint: toUint8Array(range.fingerprint),
        })),
    };
}
function toProtoPayloadFragment(fragment) {
    return {
        parentHeaderHash: fragment.parentHeaderHash,
        fragmentIndex: fragment.fragmentIndex,
        fragmentCount: fragment.fragmentCount,
        totalPayloadSize: fragment.totalPayloadSize,
        payloadChunk: fragment.payloadChunk,
        payloadHash: fragment.payloadHash,
    };
}
function fromProtoPayloadFragment(fragment) {
    return {
        parentHeaderHash: toUint8Array(fragment.parentHeaderHash),
        fragmentIndex: fragment.fragmentIndex ?? 0,
        fragmentCount: fragment.fragmentCount ?? 0,
        totalPayloadSize: fragment.totalPayloadSize ?? 0,
        payloadChunk: toUint8Array(fragment.payloadChunk),
        payloadHash: toUint8Array(fragment.payloadHash),
    };
}
export function encodePayloadFragmentProto(fragment) {
    assertPayloadFragmentIntegrity(fragment);
    const protoFragment = toProtoPayloadFragment(fragment);
    const validationError = vco.v3.PayloadFragment.verify(protoFragment);
    if (validationError) {
        throw new Error(`PayloadFragment protobuf validation failed: ${validationError}`);
    }
    return vco.v3.PayloadFragment.encode(vco.v3.PayloadFragment.create(protoFragment)).finish();
}
export function decodePayloadFragmentProto(encoded) {
    const fragment = fromProtoPayloadFragment(vco.v3.PayloadFragment.decode(encoded));
    assertPayloadFragmentIntegrity(fragment);
    return fragment;
}
export function encodePayloadFragmentSetProto(fragmentSet) {
    assertPayloadFragmentSetIntegrity(fragmentSet);
    const protoSet = {
        fragments: fragmentSet.fragments.map((fragment) => toProtoPayloadFragment(fragment)),
    };
    const validationError = vco.v3.PayloadFragmentSet.verify(protoSet);
    if (validationError) {
        throw new Error(`PayloadFragmentSet protobuf validation failed: ${validationError}`);
    }
    return vco.v3.PayloadFragmentSet.encode(vco.v3.PayloadFragmentSet.create(protoSet)).finish();
}
export function decodePayloadFragmentSetProto(encoded) {
    const decoded = vco.v3.PayloadFragmentSet.decode(encoded);
    const fragmentSet = {
        fragments: (decoded.fragments ?? []).map((fragment) => fromProtoPayloadFragment(fragment)),
    };
    assertPayloadFragmentSetIntegrity(fragmentSet);
    return fragmentSet;
}
//# sourceMappingURL=protobuf.js.map