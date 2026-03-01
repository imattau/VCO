import { vco } from "./generated/vco.pb.js";
import {
  assertPayloadFragmentIntegrity,
  assertPayloadFragmentSetIntegrity,
  type PayloadFragment,
  type PayloadFragmentSet,
} from "./fragmentation.js";
import type { VcoEnvelope } from "./types.js";
import { validateEnvelope } from "./validation.js";

interface ProtoSyncRange {
  startHash: Uint8Array;
  endHash: Uint8Array;
  fingerprint: Uint8Array;
}

interface ProtoSyncMessage {
  ranges: ProtoSyncRange[];
}

interface ProtoPayloadFragment {
  parentHeaderHash: Uint8Array;
  fragmentIndex: number;
  fragmentCount: number;
  totalPayloadSize: number;
  payloadChunk: Uint8Array;
  payloadHash: Uint8Array;
}

interface ProtoPayloadFragmentSet {
  fragments: ProtoPayloadFragment[];
}

export interface SyncRange {
  startHash: Uint8Array;
  endHash: Uint8Array;
  fingerprint: Uint8Array;
}

export interface SyncMessage {
  ranges: SyncRange[];
}

function toUint8Array(value: Uint8Array | number[] | null | undefined): Uint8Array {
  if (!value) {
    return new Uint8Array();
  }

  return value.constructor === Uint8Array ? value as Uint8Array : Uint8Array.from(value);
}

function toProtoEnvelope(envelope: VcoEnvelope): vco.v3.IEnvelope {
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
    contextId: envelope.header.contextId,
    nullifier: envelope.header.nullifier,
    zkpExtension: envelope.zkpExtension
      ? {
          circuitId: envelope.zkpExtension.circuitId,
          proofLength: envelope.zkpExtension.proofLength,
          proof: envelope.zkpExtension.proof,
          inputsLength: envelope.zkpExtension.inputsLength,
          publicInputs: envelope.zkpExtension.publicInputs,
        }
      : null,
  };
}

function fromProtoEnvelope(message: vco.v3.IEnvelope): VcoEnvelope {
  const zkpExtension = message.zkpExtension
    ? {
        circuitId: message.zkpExtension.circuitId ?? 0,
        proofLength: message.zkpExtension.proofLength ?? 0,
        proof: toUint8Array(message.zkpExtension.proof),
        inputsLength: message.zkpExtension.inputsLength ?? 0,
        publicInputs: toUint8Array(message.zkpExtension.publicInputs),
      }
    : undefined;

  const contextId = message.contextId ? toUint8Array(message.contextId) : undefined;
  const nullifier = message.nullifier ? toUint8Array(message.nullifier) : undefined;

  return {
    headerHash: toUint8Array(message.headerHash),
    header: {
      version: message.version ?? 0,
      flags: message.flags ?? 0,
      payloadType: message.payloadType ?? 0,
      creatorId: toUint8Array(message.creatorId),
      payloadHash: toUint8Array(message.payloadHash),
      signature: toUint8Array(message.signature),
      nonce: message.nonce ?? 0,
      priorityHint: (message.flags ?? 0) & 0x03,
      contextId: contextId && contextId.length > 0 ? contextId : undefined,
      nullifier: nullifier && nullifier.length > 0 ? nullifier : undefined,
    },
    payload: toUint8Array(message.payload),
    zkpExtension,
    nullifier: nullifier && nullifier.length > 0 ? nullifier : undefined,
  };
}

export function encodeEnvelopeProto(envelope: VcoEnvelope): Uint8Array {
  validateEnvelope(envelope);

  const protoEnvelope = toProtoEnvelope(envelope);
  const validationError = vco.v3.Envelope.verify(
    protoEnvelope as unknown as Record<string, unknown>,
  );
  if (validationError) {
    throw new Error(`Envelope protobuf validation failed: ${validationError}`);
  }

  return vco.v3.Envelope.encode(vco.v3.Envelope.create(protoEnvelope)).finish();
}

export function decodeEnvelopeProto(encoded: Uint8Array): VcoEnvelope {
  const envelope = fromProtoEnvelope(vco.v3.Envelope.decode(encoded));
  validateEnvelope(envelope);
  return envelope;
}

export function encodeSyncMessageProto(message: SyncMessage): Uint8Array {
  const protoMessage: ProtoSyncMessage = {
    ranges: message.ranges.map((range) => ({
      startHash: range.startHash,
      endHash: range.endHash,
      fingerprint: range.fingerprint,
    })),
  };

  const validationError = vco.v3.SyncMessage.verify(
    protoMessage as unknown as Record<string, unknown>,
  );
  if (validationError) {
    throw new Error(`SyncMessage protobuf validation failed: ${validationError}`);
  }

  return vco.v3.SyncMessage.encode(vco.v3.SyncMessage.create(protoMessage)).finish();
}

export function decodeSyncMessageProto(encoded: Uint8Array): SyncMessage {
  const object = vco.v3.SyncMessage.decode(encoded);

  return {
    ranges: (object.ranges ?? []).map((range) => ({
      startHash: toUint8Array(range.startHash),
      endHash: toUint8Array(range.endHash),
      fingerprint: toUint8Array(range.fingerprint),
    })),
  };
}

function toProtoPayloadFragment(fragment: PayloadFragment): ProtoPayloadFragment {
  return {
    parentHeaderHash: fragment.parentHeaderHash,
    fragmentIndex: fragment.fragmentIndex,
    fragmentCount: fragment.fragmentCount,
    totalPayloadSize: fragment.totalPayloadSize,
    payloadChunk: fragment.payloadChunk,
    payloadHash: fragment.payloadHash,
  };
}

function fromProtoPayloadFragment(fragment: vco.v3.IPayloadFragment): PayloadFragment {
  return {
    parentHeaderHash: toUint8Array(fragment.parentHeaderHash),
    fragmentIndex: fragment.fragmentIndex ?? 0,
    fragmentCount: fragment.fragmentCount ?? 0,
    totalPayloadSize: fragment.totalPayloadSize ?? 0,
    payloadChunk: toUint8Array(fragment.payloadChunk),
    payloadHash: toUint8Array(fragment.payloadHash),
  };
}

export function encodePayloadFragmentProto(fragment: PayloadFragment): Uint8Array {
  assertPayloadFragmentIntegrity(fragment);

  const protoFragment = toProtoPayloadFragment(fragment);
  const validationError = vco.v3.PayloadFragment.verify(
    protoFragment as unknown as Record<string, unknown>,
  );
  if (validationError) {
    throw new Error(`PayloadFragment protobuf validation failed: ${validationError}`);
  }

  return vco.v3.PayloadFragment.encode(vco.v3.PayloadFragment.create(protoFragment)).finish();
}

export function decodePayloadFragmentProto(encoded: Uint8Array): PayloadFragment {
  const fragment = fromProtoPayloadFragment(vco.v3.PayloadFragment.decode(encoded));
  assertPayloadFragmentIntegrity(fragment);
  return fragment;
}

export function encodePayloadFragmentSetProto(fragmentSet: PayloadFragmentSet): Uint8Array {
  assertPayloadFragmentSetIntegrity(fragmentSet);

  const protoSet: ProtoPayloadFragmentSet = {
    fragments: fragmentSet.fragments.map((fragment) => toProtoPayloadFragment(fragment)),
  };
  const validationError = vco.v3.PayloadFragmentSet.verify(
    protoSet as unknown as Record<string, unknown>,
  );
  if (validationError) {
    throw new Error(`PayloadFragmentSet protobuf validation failed: ${validationError}`);
  }

  return vco.v3.PayloadFragmentSet.encode(vco.v3.PayloadFragmentSet.create(protoSet)).finish();
}

export function decodePayloadFragmentSetProto(encoded: Uint8Array): PayloadFragmentSet {
  const decoded = vco.v3.PayloadFragmentSet.decode(encoded);
  const fragmentSet = {
    fragments: (decoded.fragments ?? []).map((fragment) => fromProtoPayloadFragment(fragment)),
  };
  assertPayloadFragmentSetIntegrity(fragmentSet);
  return fragmentSet;
}
