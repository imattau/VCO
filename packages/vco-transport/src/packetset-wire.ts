import { base64 } from "multiformats/bases/base64";
import type { FramedPacket, FramedPacketSet } from "./types.js";

interface JsonFramedPacket {
  index: number;
  count: number;
  payloadLength: number;
  frameBase64: string;
}

interface JsonFramedPacketSet {
  totalPayloadLength: number;
  packets: JsonFramedPacket[];
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function assertNonNegativeInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }
}

function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
}

function toJsonPacket(packet: FramedPacket): JsonFramedPacket {
  assertNonNegativeInteger(packet.index, "packet.index");
  assertPositiveInteger(packet.count, "packet.count");
  assertNonNegativeInteger(packet.payloadLength, "packet.payloadLength");

  return {
    index: packet.index,
    count: packet.count,
    payloadLength: packet.payloadLength,
    frameBase64: base64.encode(packet.frame),
  };
}

function parseJsonPacket(packet: JsonFramedPacket): FramedPacket {
  if (typeof packet !== "object" || packet == null) {
    throw new Error("packet must be an object.");
  }

  assertNonNegativeInteger(packet.index, "packet.index");
  assertPositiveInteger(packet.count, "packet.count");
  assertNonNegativeInteger(packet.payloadLength, "packet.payloadLength");

  if (typeof packet.frameBase64 !== "string" || packet.frameBase64.length === 0) {
    throw new Error("packet.frameBase64 must be a non-empty base64 string.");
  }

  return {
    index: packet.index,
    count: packet.count,
    payloadLength: packet.payloadLength,
    frame: base64.decode(packet.frameBase64),
  };
}

export function encodeFramedPacketSet(packetSet: FramedPacketSet): Uint8Array {
  assertNonNegativeInteger(packetSet.totalPayloadLength, "packetSet.totalPayloadLength");

  const encoded: JsonFramedPacketSet = {
    totalPayloadLength: packetSet.totalPayloadLength,
    packets: packetSet.packets.map((packet) => toJsonPacket(packet)),
  };

  return textEncoder.encode(JSON.stringify(encoded));
}

export function decodeFramedPacketSet(encoded: Uint8Array): FramedPacketSet {
  let parsed: unknown;
  try {
    parsed = JSON.parse(textDecoder.decode(encoded));
  } catch {
    throw new Error("Failed to decode framed packet set JSON.");
  }

  if (typeof parsed !== "object" || parsed == null) {
    throw new Error("Decoded framed packet set must be an object.");
  }

  const packetSet = parsed as Partial<JsonFramedPacketSet>;
  assertNonNegativeInteger(packetSet.totalPayloadLength ?? -1, "packetSet.totalPayloadLength");

  if (!Array.isArray(packetSet.packets)) {
    throw new Error("packetSet.packets must be an array.");
  }

  return {
    totalPayloadLength: packetSet.totalPayloadLength ?? 0,
    packets: packetSet.packets.map((packet) => parseJsonPacket(packet)),
  };
}
