import { base64 } from "multiformats/bases/base64";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
function assertNonNegativeInteger(value, fieldName) {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${fieldName} must be a non-negative integer.`);
    }
}
function assertPositiveInteger(value, fieldName) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${fieldName} must be a positive integer.`);
    }
}
function toJsonPacket(packet) {
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
function parseJsonPacket(packet) {
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
export function encodeFramedPacketSet(packetSet) {
    assertNonNegativeInteger(packetSet.totalPayloadLength, "packetSet.totalPayloadLength");
    const encoded = {
        totalPayloadLength: packetSet.totalPayloadLength,
        packets: packetSet.packets.map((packet) => toJsonPacket(packet)),
    };
    return textEncoder.encode(JSON.stringify(encoded));
}
export function decodeFramedPacketSet(encoded) {
    let parsed;
    try {
        parsed = JSON.parse(textDecoder.decode(encoded));
    }
    catch {
        throw new Error("Failed to decode framed packet set JSON.");
    }
    if (typeof parsed !== "object" || parsed == null) {
        throw new Error("Decoded framed packet set must be an object.");
    }
    const packetSet = parsed;
    assertNonNegativeInteger(packetSet.totalPayloadLength ?? -1, "packetSet.totalPayloadLength");
    if (!Array.isArray(packetSet.packets)) {
        throw new Error("packetSet.packets must be an array.");
    }
    return {
        totalPayloadLength: packetSet.totalPayloadLength ?? 0,
        packets: packetSet.packets.map((packet) => parseJsonPacket(packet)),
    };
}
//# sourceMappingURL=packetset-wire.js.map