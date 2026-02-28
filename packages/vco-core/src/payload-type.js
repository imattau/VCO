import { code as jsonCodec } from "multiformats/codecs/json";
import { code as rawCodec } from "multiformats/codecs/raw";
import { MULTICODEC_PROTOBUF, MULTICODEC_VCO_SEQUENCE } from "./constants.js";
import { EnvelopeValidationError } from "./errors.js";
import { KNOWN_MULTICODEC_CODES } from "./generated/multicodec.codes.js";
const KNOWN_PAYLOAD_MULTICODECS = new Set([...KNOWN_MULTICODEC_CODES, MULTICODEC_VCO_SEQUENCE]);
const SUPPORTED_PAYLOAD_MULTICODECS = new Set([
    MULTICODEC_PROTOBUF,
    MULTICODEC_VCO_SEQUENCE,
    rawCodec,
    jsonCodec,
]);
export function getKnownPayloadTypes() {
    return KNOWN_MULTICODEC_CODES;
}
export function getSupportedPayloadTypes() {
    return [...SUPPORTED_PAYLOAD_MULTICODECS.values()].sort((left, right) => left - right);
}
export function isKnownPayloadType(payloadType) {
    return KNOWN_PAYLOAD_MULTICODECS.has(payloadType);
}
export function isSupportedPayloadType(payloadType) {
    return SUPPORTED_PAYLOAD_MULTICODECS.has(payloadType);
}
export function assertValidPayloadType(payloadType) {
    if (!Number.isInteger(payloadType) ||
        payloadType < 0 ||
        payloadType > 0xffff_ffff) {
        throw new EnvelopeValidationError("payloadType must be a uint32 multicodec code.");
    }
    if (!isKnownPayloadType(payloadType)) {
        throw new EnvelopeValidationError(`Unknown payloadType ${payloadType}. It must be a registered multicodec identifier.`);
    }
}
export function assertSupportedPayloadType(payloadType) {
    if (!isSupportedPayloadType(payloadType)) {
        throw new EnvelopeValidationError(`Unsupported payloadType ${payloadType}. Supported runtime codecs: ${getSupportedPayloadTypes().join(", ")}.`);
    }
}
//# sourceMappingURL=payload-type.js.map