/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const vco = $root.vco = (() => {

    /**
     * Namespace vco.
     * @exports vco
     * @namespace
     */
    const vco = {};

    vco.v3 = (function() {

        /**
         * Namespace v3.
         * @memberof vco
         * @namespace
         */
        const v3 = {};

        v3.ZKPExtension = (function() {

            /**
             * Properties of a ZKPExtension.
             * @memberof vco.v3
             * @interface IZKPExtension
             * @property {number|null} [circuitId] ZKPExtension circuitId
             * @property {number|null} [proofLength] ZKPExtension proofLength
             * @property {Uint8Array|null} [proof] ZKPExtension proof
             * @property {number|null} [inputsLength] ZKPExtension inputsLength
             * @property {Uint8Array|null} [publicInputs] ZKPExtension publicInputs
             * @property {Uint8Array|null} [nullifier] ZKPExtension nullifier
             */

            /**
             * Constructs a new ZKPExtension.
             * @memberof vco.v3
             * @classdesc Represents a ZKPExtension.
             * @implements IZKPExtension
             * @constructor
             * @param {vco.v3.IZKPExtension=} [properties] Properties to set
             */
            function ZKPExtension(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ZKPExtension circuitId.
             * @member {number} circuitId
             * @memberof vco.v3.ZKPExtension
             * @instance
             */
            ZKPExtension.prototype.circuitId = 0;

            /**
             * ZKPExtension proofLength.
             * @member {number} proofLength
             * @memberof vco.v3.ZKPExtension
             * @instance
             */
            ZKPExtension.prototype.proofLength = 0;

            /**
             * ZKPExtension proof.
             * @member {Uint8Array} proof
             * @memberof vco.v3.ZKPExtension
             * @instance
             */
            ZKPExtension.prototype.proof = $util.newBuffer([]);

            /**
             * ZKPExtension inputsLength.
             * @member {number} inputsLength
             * @memberof vco.v3.ZKPExtension
             * @instance
             */
            ZKPExtension.prototype.inputsLength = 0;

            /**
             * ZKPExtension publicInputs.
             * @member {Uint8Array} publicInputs
             * @memberof vco.v3.ZKPExtension
             * @instance
             */
            ZKPExtension.prototype.publicInputs = $util.newBuffer([]);

            /**
             * ZKPExtension nullifier.
             * @member {Uint8Array} nullifier
             * @memberof vco.v3.ZKPExtension
             * @instance
             */
            ZKPExtension.prototype.nullifier = $util.newBuffer([]);

            /**
             * Creates a new ZKPExtension instance using the specified properties.
             * @function create
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {vco.v3.IZKPExtension=} [properties] Properties to set
             * @returns {vco.v3.ZKPExtension} ZKPExtension instance
             */
            ZKPExtension.create = function create(properties) {
                return new ZKPExtension(properties);
            };

            /**
             * Encodes the specified ZKPExtension message. Does not implicitly {@link vco.v3.ZKPExtension.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {vco.v3.IZKPExtension} message ZKPExtension message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ZKPExtension.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.circuitId != null && Object.hasOwnProperty.call(message, "circuitId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.circuitId);
                if (message.proofLength != null && Object.hasOwnProperty.call(message, "proofLength"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.proofLength);
                if (message.proof != null && Object.hasOwnProperty.call(message, "proof"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.proof);
                if (message.inputsLength != null && Object.hasOwnProperty.call(message, "inputsLength"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.inputsLength);
                if (message.publicInputs != null && Object.hasOwnProperty.call(message, "publicInputs"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.publicInputs);
                if (message.nullifier != null && Object.hasOwnProperty.call(message, "nullifier"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.nullifier);
                return writer;
            };

            /**
             * Encodes the specified ZKPExtension message, length delimited. Does not implicitly {@link vco.v3.ZKPExtension.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {vco.v3.IZKPExtension} message ZKPExtension message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ZKPExtension.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ZKPExtension message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.ZKPExtension} ZKPExtension
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ZKPExtension.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.ZKPExtension();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.circuitId = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.proofLength = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.proof = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.inputsLength = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.publicInputs = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.nullifier = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ZKPExtension message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.ZKPExtension} ZKPExtension
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ZKPExtension.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ZKPExtension message.
             * @function verify
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ZKPExtension.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.circuitId != null && message.hasOwnProperty("circuitId"))
                    if (!$util.isInteger(message.circuitId))
                        return "circuitId: integer expected";
                if (message.proofLength != null && message.hasOwnProperty("proofLength"))
                    if (!$util.isInteger(message.proofLength))
                        return "proofLength: integer expected";
                if (message.proof != null && message.hasOwnProperty("proof"))
                    if (!(message.proof && typeof message.proof.length === "number" || $util.isString(message.proof)))
                        return "proof: buffer expected";
                if (message.inputsLength != null && message.hasOwnProperty("inputsLength"))
                    if (!$util.isInteger(message.inputsLength))
                        return "inputsLength: integer expected";
                if (message.publicInputs != null && message.hasOwnProperty("publicInputs"))
                    if (!(message.publicInputs && typeof message.publicInputs.length === "number" || $util.isString(message.publicInputs)))
                        return "publicInputs: buffer expected";
                if (message.nullifier != null && message.hasOwnProperty("nullifier"))
                    if (!(message.nullifier && typeof message.nullifier.length === "number" || $util.isString(message.nullifier)))
                        return "nullifier: buffer expected";
                return null;
            };

            /**
             * Creates a ZKPExtension message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.ZKPExtension} ZKPExtension
             */
            ZKPExtension.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.ZKPExtension)
                    return object;
                let message = new $root.vco.v3.ZKPExtension();
                if (object.circuitId != null)
                    message.circuitId = object.circuitId >>> 0;
                if (object.proofLength != null)
                    message.proofLength = object.proofLength >>> 0;
                if (object.proof != null)
                    if (typeof object.proof === "string")
                        $util.base64.decode(object.proof, message.proof = $util.newBuffer($util.base64.length(object.proof)), 0);
                    else if (object.proof.length >= 0)
                        message.proof = object.proof;
                if (object.inputsLength != null)
                    message.inputsLength = object.inputsLength >>> 0;
                if (object.publicInputs != null)
                    if (typeof object.publicInputs === "string")
                        $util.base64.decode(object.publicInputs, message.publicInputs = $util.newBuffer($util.base64.length(object.publicInputs)), 0);
                    else if (object.publicInputs.length >= 0)
                        message.publicInputs = object.publicInputs;
                if (object.nullifier != null)
                    if (typeof object.nullifier === "string")
                        $util.base64.decode(object.nullifier, message.nullifier = $util.newBuffer($util.base64.length(object.nullifier)), 0);
                    else if (object.nullifier.length >= 0)
                        message.nullifier = object.nullifier;
                return message;
            };

            /**
             * Creates a plain object from a ZKPExtension message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {vco.v3.ZKPExtension} message ZKPExtension
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ZKPExtension.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.circuitId = 0;
                    object.proofLength = 0;
                    if (options.bytes === String)
                        object.proof = "";
                    else {
                        object.proof = [];
                        if (options.bytes !== Array)
                            object.proof = $util.newBuffer(object.proof);
                    }
                    object.inputsLength = 0;
                    if (options.bytes === String)
                        object.publicInputs = "";
                    else {
                        object.publicInputs = [];
                        if (options.bytes !== Array)
                            object.publicInputs = $util.newBuffer(object.publicInputs);
                    }
                    if (options.bytes === String)
                        object.nullifier = "";
                    else {
                        object.nullifier = [];
                        if (options.bytes !== Array)
                            object.nullifier = $util.newBuffer(object.nullifier);
                    }
                }
                if (message.circuitId != null && message.hasOwnProperty("circuitId"))
                    object.circuitId = message.circuitId;
                if (message.proofLength != null && message.hasOwnProperty("proofLength"))
                    object.proofLength = message.proofLength;
                if (message.proof != null && message.hasOwnProperty("proof"))
                    object.proof = options.bytes === String ? $util.base64.encode(message.proof, 0, message.proof.length) : options.bytes === Array ? Array.prototype.slice.call(message.proof) : message.proof;
                if (message.inputsLength != null && message.hasOwnProperty("inputsLength"))
                    object.inputsLength = message.inputsLength;
                if (message.publicInputs != null && message.hasOwnProperty("publicInputs"))
                    object.publicInputs = options.bytes === String ? $util.base64.encode(message.publicInputs, 0, message.publicInputs.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicInputs) : message.publicInputs;
                if (message.nullifier != null && message.hasOwnProperty("nullifier"))
                    object.nullifier = options.bytes === String ? $util.base64.encode(message.nullifier, 0, message.nullifier.length) : options.bytes === Array ? Array.prototype.slice.call(message.nullifier) : message.nullifier;
                return object;
            };

            /**
             * Converts this ZKPExtension to JSON.
             * @function toJSON
             * @memberof vco.v3.ZKPExtension
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ZKPExtension.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ZKPExtension
             * @function getTypeUrl
             * @memberof vco.v3.ZKPExtension
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ZKPExtension.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.ZKPExtension";
            };

            return ZKPExtension;
        })();

        v3.Envelope = (function() {

            /**
             * Properties of an Envelope.
             * @memberof vco.v3
             * @interface IEnvelope
             * @property {Uint8Array|null} [headerHash] Envelope headerHash
             * @property {number|null} [version] Envelope version
             * @property {number|null} [flags] Envelope flags
             * @property {number|null} [payloadType] Envelope payloadType
             * @property {Uint8Array|null} [creatorId] Envelope creatorId
             * @property {Uint8Array|null} [payloadHash] Envelope payloadHash
             * @property {Uint8Array|null} [signature] Envelope signature
             * @property {Uint8Array|null} [payload] Envelope payload
             * @property {vco.v3.IZKPExtension|null} [zkpExtension] Envelope zkpExtension
             * @property {number|null} [nonce] Envelope nonce
             */

            /**
             * Constructs a new Envelope.
             * @memberof vco.v3
             * @classdesc Represents an Envelope.
             * @implements IEnvelope
             * @constructor
             * @param {vco.v3.IEnvelope=} [properties] Properties to set
             */
            function Envelope(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Envelope headerHash.
             * @member {Uint8Array} headerHash
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.headerHash = $util.newBuffer([]);

            /**
             * Envelope version.
             * @member {number} version
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.version = 0;

            /**
             * Envelope flags.
             * @member {number} flags
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.flags = 0;

            /**
             * Envelope payloadType.
             * @member {number} payloadType
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.payloadType = 0;

            /**
             * Envelope creatorId.
             * @member {Uint8Array} creatorId
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.creatorId = $util.newBuffer([]);

            /**
             * Envelope payloadHash.
             * @member {Uint8Array} payloadHash
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.payloadHash = $util.newBuffer([]);

            /**
             * Envelope signature.
             * @member {Uint8Array} signature
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.signature = $util.newBuffer([]);

            /**
             * Envelope payload.
             * @member {Uint8Array} payload
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.payload = $util.newBuffer([]);

            /**
             * Envelope zkpExtension.
             * @member {vco.v3.IZKPExtension|null|undefined} zkpExtension
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.zkpExtension = null;

            /**
             * Envelope nonce.
             * @member {number} nonce
             * @memberof vco.v3.Envelope
             * @instance
             */
            Envelope.prototype.nonce = 0;

            /**
             * Creates a new Envelope instance using the specified properties.
             * @function create
             * @memberof vco.v3.Envelope
             * @static
             * @param {vco.v3.IEnvelope=} [properties] Properties to set
             * @returns {vco.v3.Envelope} Envelope instance
             */
            Envelope.create = function create(properties) {
                return new Envelope(properties);
            };

            /**
             * Encodes the specified Envelope message. Does not implicitly {@link vco.v3.Envelope.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.Envelope
             * @static
             * @param {vco.v3.IEnvelope} message Envelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Envelope.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.headerHash != null && Object.hasOwnProperty.call(message, "headerHash"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.headerHash);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.version);
                if (message.flags != null && Object.hasOwnProperty.call(message, "flags"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.flags);
                if (message.payloadType != null && Object.hasOwnProperty.call(message, "payloadType"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.payloadType);
                if (message.creatorId != null && Object.hasOwnProperty.call(message, "creatorId"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.creatorId);
                if (message.payloadHash != null && Object.hasOwnProperty.call(message, "payloadHash"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.payloadHash);
                if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.signature);
                if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                    writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.payload);
                if (message.zkpExtension != null && Object.hasOwnProperty.call(message, "zkpExtension"))
                    $root.vco.v3.ZKPExtension.encode(message.zkpExtension, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                    writer.uint32(/* id 10, wireType 0 =*/80).uint32(message.nonce);
                return writer;
            };

            /**
             * Encodes the specified Envelope message, length delimited. Does not implicitly {@link vco.v3.Envelope.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.Envelope
             * @static
             * @param {vco.v3.IEnvelope} message Envelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Envelope.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Envelope message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.Envelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.Envelope} Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Envelope.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.Envelope();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.headerHash = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.version = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.flags = reader.uint32();
                            break;
                        }
                    case 4: {
                            message.payloadType = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.creatorId = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.payloadHash = reader.bytes();
                            break;
                        }
                    case 7: {
                            message.signature = reader.bytes();
                            break;
                        }
                    case 8: {
                            message.payload = reader.bytes();
                            break;
                        }
                    case 9: {
                            message.zkpExtension = $root.vco.v3.ZKPExtension.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            message.nonce = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Envelope message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.Envelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.Envelope} Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Envelope.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Envelope message.
             * @function verify
             * @memberof vco.v3.Envelope
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Envelope.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.headerHash != null && message.hasOwnProperty("headerHash"))
                    if (!(message.headerHash && typeof message.headerHash.length === "number" || $util.isString(message.headerHash)))
                        return "headerHash: buffer expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags))
                        return "flags: integer expected";
                if (message.payloadType != null && message.hasOwnProperty("payloadType"))
                    if (!$util.isInteger(message.payloadType))
                        return "payloadType: integer expected";
                if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                    if (!(message.creatorId && typeof message.creatorId.length === "number" || $util.isString(message.creatorId)))
                        return "creatorId: buffer expected";
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    if (!(message.payloadHash && typeof message.payloadHash.length === "number" || $util.isString(message.payloadHash)))
                        return "payloadHash: buffer expected";
                if (message.signature != null && message.hasOwnProperty("signature"))
                    if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                        return "signature: buffer expected";
                if (message.payload != null && message.hasOwnProperty("payload"))
                    if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                        return "payload: buffer expected";
                if (message.zkpExtension != null && message.hasOwnProperty("zkpExtension")) {
                    let error = $root.vco.v3.ZKPExtension.verify(message.zkpExtension);
                    if (error)
                        return "zkpExtension." + error;
                }
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    if (!$util.isInteger(message.nonce))
                        return "nonce: integer expected";
                return null;
            };

            /**
             * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.Envelope
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.Envelope} Envelope
             */
            Envelope.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.Envelope)
                    return object;
                let message = new $root.vco.v3.Envelope();
                if (object.headerHash != null)
                    if (typeof object.headerHash === "string")
                        $util.base64.decode(object.headerHash, message.headerHash = $util.newBuffer($util.base64.length(object.headerHash)), 0);
                    else if (object.headerHash.length >= 0)
                        message.headerHash = object.headerHash;
                if (object.version != null)
                    message.version = object.version >>> 0;
                if (object.flags != null)
                    message.flags = object.flags >>> 0;
                if (object.payloadType != null)
                    message.payloadType = object.payloadType >>> 0;
                if (object.creatorId != null)
                    if (typeof object.creatorId === "string")
                        $util.base64.decode(object.creatorId, message.creatorId = $util.newBuffer($util.base64.length(object.creatorId)), 0);
                    else if (object.creatorId.length >= 0)
                        message.creatorId = object.creatorId;
                if (object.payloadHash != null)
                    if (typeof object.payloadHash === "string")
                        $util.base64.decode(object.payloadHash, message.payloadHash = $util.newBuffer($util.base64.length(object.payloadHash)), 0);
                    else if (object.payloadHash.length >= 0)
                        message.payloadHash = object.payloadHash;
                if (object.signature != null)
                    if (typeof object.signature === "string")
                        $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                    else if (object.signature.length >= 0)
                        message.signature = object.signature;
                if (object.payload != null)
                    if (typeof object.payload === "string")
                        $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                    else if (object.payload.length >= 0)
                        message.payload = object.payload;
                if (object.zkpExtension != null) {
                    if (typeof object.zkpExtension !== "object")
                        throw TypeError(".vco.v3.Envelope.zkpExtension: object expected");
                    message.zkpExtension = $root.vco.v3.ZKPExtension.fromObject(object.zkpExtension);
                }
                if (object.nonce != null)
                    message.nonce = object.nonce >>> 0;
                return message;
            };

            /**
             * Creates a plain object from an Envelope message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.Envelope
             * @static
             * @param {vco.v3.Envelope} message Envelope
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Envelope.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.headerHash = "";
                    else {
                        object.headerHash = [];
                        if (options.bytes !== Array)
                            object.headerHash = $util.newBuffer(object.headerHash);
                    }
                    object.version = 0;
                    object.flags = 0;
                    object.payloadType = 0;
                    if (options.bytes === String)
                        object.creatorId = "";
                    else {
                        object.creatorId = [];
                        if (options.bytes !== Array)
                            object.creatorId = $util.newBuffer(object.creatorId);
                    }
                    if (options.bytes === String)
                        object.payloadHash = "";
                    else {
                        object.payloadHash = [];
                        if (options.bytes !== Array)
                            object.payloadHash = $util.newBuffer(object.payloadHash);
                    }
                    if (options.bytes === String)
                        object.signature = "";
                    else {
                        object.signature = [];
                        if (options.bytes !== Array)
                            object.signature = $util.newBuffer(object.signature);
                    }
                    if (options.bytes === String)
                        object.payload = "";
                    else {
                        object.payload = [];
                        if (options.bytes !== Array)
                            object.payload = $util.newBuffer(object.payload);
                    }
                    object.zkpExtension = null;
                    object.nonce = 0;
                }
                if (message.headerHash != null && message.hasOwnProperty("headerHash"))
                    object.headerHash = options.bytes === String ? $util.base64.encode(message.headerHash, 0, message.headerHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.headerHash) : message.headerHash;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.flags != null && message.hasOwnProperty("flags"))
                    object.flags = message.flags;
                if (message.payloadType != null && message.hasOwnProperty("payloadType"))
                    object.payloadType = message.payloadType;
                if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                    object.creatorId = options.bytes === String ? $util.base64.encode(message.creatorId, 0, message.creatorId.length) : options.bytes === Array ? Array.prototype.slice.call(message.creatorId) : message.creatorId;
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    object.payloadHash = options.bytes === String ? $util.base64.encode(message.payloadHash, 0, message.payloadHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.payloadHash) : message.payloadHash;
                if (message.signature != null && message.hasOwnProperty("signature"))
                    object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
                if (message.payload != null && message.hasOwnProperty("payload"))
                    object.payload = options.bytes === String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === Array ? Array.prototype.slice.call(message.payload) : message.payload;
                if (message.zkpExtension != null && message.hasOwnProperty("zkpExtension"))
                    object.zkpExtension = $root.vco.v3.ZKPExtension.toObject(message.zkpExtension, options);
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    object.nonce = message.nonce;
                return object;
            };

            /**
             * Converts this Envelope to JSON.
             * @function toJSON
             * @memberof vco.v3.Envelope
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Envelope.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Envelope
             * @function getTypeUrl
             * @memberof vco.v3.Envelope
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Envelope.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.Envelope";
            };

            return Envelope;
        })();

        v3.EnvelopeSigningMaterial = (function() {

            /**
             * Properties of an EnvelopeSigningMaterial.
             * @memberof vco.v3
             * @interface IEnvelopeSigningMaterial
             * @property {number|null} [version] EnvelopeSigningMaterial version
             * @property {number|null} [flags] EnvelopeSigningMaterial flags
             * @property {number|null} [payloadType] EnvelopeSigningMaterial payloadType
             * @property {Uint8Array|null} [creatorId] EnvelopeSigningMaterial creatorId
             * @property {Uint8Array|null} [payloadHash] EnvelopeSigningMaterial payloadHash
             */

            /**
             * Constructs a new EnvelopeSigningMaterial.
             * @memberof vco.v3
             * @classdesc Represents an EnvelopeSigningMaterial.
             * @implements IEnvelopeSigningMaterial
             * @constructor
             * @param {vco.v3.IEnvelopeSigningMaterial=} [properties] Properties to set
             */
            function EnvelopeSigningMaterial(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EnvelopeSigningMaterial version.
             * @member {number} version
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @instance
             */
            EnvelopeSigningMaterial.prototype.version = 0;

            /**
             * EnvelopeSigningMaterial flags.
             * @member {number} flags
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @instance
             */
            EnvelopeSigningMaterial.prototype.flags = 0;

            /**
             * EnvelopeSigningMaterial payloadType.
             * @member {number} payloadType
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @instance
             */
            EnvelopeSigningMaterial.prototype.payloadType = 0;

            /**
             * EnvelopeSigningMaterial creatorId.
             * @member {Uint8Array} creatorId
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @instance
             */
            EnvelopeSigningMaterial.prototype.creatorId = $util.newBuffer([]);

            /**
             * EnvelopeSigningMaterial payloadHash.
             * @member {Uint8Array} payloadHash
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @instance
             */
            EnvelopeSigningMaterial.prototype.payloadHash = $util.newBuffer([]);

            /**
             * Creates a new EnvelopeSigningMaterial instance using the specified properties.
             * @function create
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {vco.v3.IEnvelopeSigningMaterial=} [properties] Properties to set
             * @returns {vco.v3.EnvelopeSigningMaterial} EnvelopeSigningMaterial instance
             */
            EnvelopeSigningMaterial.create = function create(properties) {
                return new EnvelopeSigningMaterial(properties);
            };

            /**
             * Encodes the specified EnvelopeSigningMaterial message. Does not implicitly {@link vco.v3.EnvelopeSigningMaterial.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {vco.v3.IEnvelopeSigningMaterial} message EnvelopeSigningMaterial message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EnvelopeSigningMaterial.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.version);
                if (message.flags != null && Object.hasOwnProperty.call(message, "flags"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.flags);
                if (message.payloadType != null && Object.hasOwnProperty.call(message, "payloadType"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.payloadType);
                if (message.creatorId != null && Object.hasOwnProperty.call(message, "creatorId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.creatorId);
                if (message.payloadHash != null && Object.hasOwnProperty.call(message, "payloadHash"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.payloadHash);
                return writer;
            };

            /**
             * Encodes the specified EnvelopeSigningMaterial message, length delimited. Does not implicitly {@link vco.v3.EnvelopeSigningMaterial.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {vco.v3.IEnvelopeSigningMaterial} message EnvelopeSigningMaterial message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EnvelopeSigningMaterial.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EnvelopeSigningMaterial message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.EnvelopeSigningMaterial} EnvelopeSigningMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EnvelopeSigningMaterial.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.EnvelopeSigningMaterial();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.version = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.flags = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.payloadType = reader.uint32();
                            break;
                        }
                    case 4: {
                            message.creatorId = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.payloadHash = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EnvelopeSigningMaterial message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.EnvelopeSigningMaterial} EnvelopeSigningMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EnvelopeSigningMaterial.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EnvelopeSigningMaterial message.
             * @function verify
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EnvelopeSigningMaterial.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags))
                        return "flags: integer expected";
                if (message.payloadType != null && message.hasOwnProperty("payloadType"))
                    if (!$util.isInteger(message.payloadType))
                        return "payloadType: integer expected";
                if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                    if (!(message.creatorId && typeof message.creatorId.length === "number" || $util.isString(message.creatorId)))
                        return "creatorId: buffer expected";
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    if (!(message.payloadHash && typeof message.payloadHash.length === "number" || $util.isString(message.payloadHash)))
                        return "payloadHash: buffer expected";
                return null;
            };

            /**
             * Creates an EnvelopeSigningMaterial message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.EnvelopeSigningMaterial} EnvelopeSigningMaterial
             */
            EnvelopeSigningMaterial.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.EnvelopeSigningMaterial)
                    return object;
                let message = new $root.vco.v3.EnvelopeSigningMaterial();
                if (object.version != null)
                    message.version = object.version >>> 0;
                if (object.flags != null)
                    message.flags = object.flags >>> 0;
                if (object.payloadType != null)
                    message.payloadType = object.payloadType >>> 0;
                if (object.creatorId != null)
                    if (typeof object.creatorId === "string")
                        $util.base64.decode(object.creatorId, message.creatorId = $util.newBuffer($util.base64.length(object.creatorId)), 0);
                    else if (object.creatorId.length >= 0)
                        message.creatorId = object.creatorId;
                if (object.payloadHash != null)
                    if (typeof object.payloadHash === "string")
                        $util.base64.decode(object.payloadHash, message.payloadHash = $util.newBuffer($util.base64.length(object.payloadHash)), 0);
                    else if (object.payloadHash.length >= 0)
                        message.payloadHash = object.payloadHash;
                return message;
            };

            /**
             * Creates a plain object from an EnvelopeSigningMaterial message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {vco.v3.EnvelopeSigningMaterial} message EnvelopeSigningMaterial
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EnvelopeSigningMaterial.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.version = 0;
                    object.flags = 0;
                    object.payloadType = 0;
                    if (options.bytes === String)
                        object.creatorId = "";
                    else {
                        object.creatorId = [];
                        if (options.bytes !== Array)
                            object.creatorId = $util.newBuffer(object.creatorId);
                    }
                    if (options.bytes === String)
                        object.payloadHash = "";
                    else {
                        object.payloadHash = [];
                        if (options.bytes !== Array)
                            object.payloadHash = $util.newBuffer(object.payloadHash);
                    }
                }
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.flags != null && message.hasOwnProperty("flags"))
                    object.flags = message.flags;
                if (message.payloadType != null && message.hasOwnProperty("payloadType"))
                    object.payloadType = message.payloadType;
                if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                    object.creatorId = options.bytes === String ? $util.base64.encode(message.creatorId, 0, message.creatorId.length) : options.bytes === Array ? Array.prototype.slice.call(message.creatorId) : message.creatorId;
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    object.payloadHash = options.bytes === String ? $util.base64.encode(message.payloadHash, 0, message.payloadHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.payloadHash) : message.payloadHash;
                return object;
            };

            /**
             * Converts this EnvelopeSigningMaterial to JSON.
             * @function toJSON
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EnvelopeSigningMaterial.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EnvelopeSigningMaterial
             * @function getTypeUrl
             * @memberof vco.v3.EnvelopeSigningMaterial
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EnvelopeSigningMaterial.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.EnvelopeSigningMaterial";
            };

            return EnvelopeSigningMaterial;
        })();

        v3.EnvelopeHeaderHashMaterial = (function() {

            /**
             * Properties of an EnvelopeHeaderHashMaterial.
             * @memberof vco.v3
             * @interface IEnvelopeHeaderHashMaterial
             * @property {number|null} [version] EnvelopeHeaderHashMaterial version
             * @property {number|null} [flags] EnvelopeHeaderHashMaterial flags
             * @property {number|null} [payloadType] EnvelopeHeaderHashMaterial payloadType
             * @property {Uint8Array|null} [creatorId] EnvelopeHeaderHashMaterial creatorId
             * @property {Uint8Array|null} [payloadHash] EnvelopeHeaderHashMaterial payloadHash
             * @property {Uint8Array|null} [signature] EnvelopeHeaderHashMaterial signature
             * @property {number|null} [nonce] EnvelopeHeaderHashMaterial nonce
             */

            /**
             * Constructs a new EnvelopeHeaderHashMaterial.
             * @memberof vco.v3
             * @classdesc Represents an EnvelopeHeaderHashMaterial.
             * @implements IEnvelopeHeaderHashMaterial
             * @constructor
             * @param {vco.v3.IEnvelopeHeaderHashMaterial=} [properties] Properties to set
             */
            function EnvelopeHeaderHashMaterial(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EnvelopeHeaderHashMaterial version.
             * @member {number} version
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.version = 0;

            /**
             * EnvelopeHeaderHashMaterial flags.
             * @member {number} flags
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.flags = 0;

            /**
             * EnvelopeHeaderHashMaterial payloadType.
             * @member {number} payloadType
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.payloadType = 0;

            /**
             * EnvelopeHeaderHashMaterial creatorId.
             * @member {Uint8Array} creatorId
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.creatorId = $util.newBuffer([]);

            /**
             * EnvelopeHeaderHashMaterial payloadHash.
             * @member {Uint8Array} payloadHash
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.payloadHash = $util.newBuffer([]);

            /**
             * EnvelopeHeaderHashMaterial signature.
             * @member {Uint8Array} signature
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.signature = $util.newBuffer([]);

            /**
             * EnvelopeHeaderHashMaterial nonce.
             * @member {number} nonce
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             */
            EnvelopeHeaderHashMaterial.prototype.nonce = 0;

            /**
             * Creates a new EnvelopeHeaderHashMaterial instance using the specified properties.
             * @function create
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {vco.v3.IEnvelopeHeaderHashMaterial=} [properties] Properties to set
             * @returns {vco.v3.EnvelopeHeaderHashMaterial} EnvelopeHeaderHashMaterial instance
             */
            EnvelopeHeaderHashMaterial.create = function create(properties) {
                return new EnvelopeHeaderHashMaterial(properties);
            };

            /**
             * Encodes the specified EnvelopeHeaderHashMaterial message. Does not implicitly {@link vco.v3.EnvelopeHeaderHashMaterial.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {vco.v3.IEnvelopeHeaderHashMaterial} message EnvelopeHeaderHashMaterial message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EnvelopeHeaderHashMaterial.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.version);
                if (message.flags != null && Object.hasOwnProperty.call(message, "flags"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.flags);
                if (message.payloadType != null && Object.hasOwnProperty.call(message, "payloadType"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.payloadType);
                if (message.creatorId != null && Object.hasOwnProperty.call(message, "creatorId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.creatorId);
                if (message.payloadHash != null && Object.hasOwnProperty.call(message, "payloadHash"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.payloadHash);
                if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.signature);
                if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.nonce);
                return writer;
            };

            /**
             * Encodes the specified EnvelopeHeaderHashMaterial message, length delimited. Does not implicitly {@link vco.v3.EnvelopeHeaderHashMaterial.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {vco.v3.IEnvelopeHeaderHashMaterial} message EnvelopeHeaderHashMaterial message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EnvelopeHeaderHashMaterial.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EnvelopeHeaderHashMaterial message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.EnvelopeHeaderHashMaterial} EnvelopeHeaderHashMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EnvelopeHeaderHashMaterial.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.EnvelopeHeaderHashMaterial();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.version = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.flags = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.payloadType = reader.uint32();
                            break;
                        }
                    case 4: {
                            message.creatorId = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.payloadHash = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.signature = reader.bytes();
                            break;
                        }
                    case 7: {
                            message.nonce = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EnvelopeHeaderHashMaterial message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.EnvelopeHeaderHashMaterial} EnvelopeHeaderHashMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EnvelopeHeaderHashMaterial.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EnvelopeHeaderHashMaterial message.
             * @function verify
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EnvelopeHeaderHashMaterial.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags))
                        return "flags: integer expected";
                if (message.payloadType != null && message.hasOwnProperty("payloadType"))
                    if (!$util.isInteger(message.payloadType))
                        return "payloadType: integer expected";
                if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                    if (!(message.creatorId && typeof message.creatorId.length === "number" || $util.isString(message.creatorId)))
                        return "creatorId: buffer expected";
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    if (!(message.payloadHash && typeof message.payloadHash.length === "number" || $util.isString(message.payloadHash)))
                        return "payloadHash: buffer expected";
                if (message.signature != null && message.hasOwnProperty("signature"))
                    if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                        return "signature: buffer expected";
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    if (!$util.isInteger(message.nonce))
                        return "nonce: integer expected";
                return null;
            };

            /**
             * Creates an EnvelopeHeaderHashMaterial message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.EnvelopeHeaderHashMaterial} EnvelopeHeaderHashMaterial
             */
            EnvelopeHeaderHashMaterial.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.EnvelopeHeaderHashMaterial)
                    return object;
                let message = new $root.vco.v3.EnvelopeHeaderHashMaterial();
                if (object.version != null)
                    message.version = object.version >>> 0;
                if (object.flags != null)
                    message.flags = object.flags >>> 0;
                if (object.payloadType != null)
                    message.payloadType = object.payloadType >>> 0;
                if (object.creatorId != null)
                    if (typeof object.creatorId === "string")
                        $util.base64.decode(object.creatorId, message.creatorId = $util.newBuffer($util.base64.length(object.creatorId)), 0);
                    else if (object.creatorId.length >= 0)
                        message.creatorId = object.creatorId;
                if (object.payloadHash != null)
                    if (typeof object.payloadHash === "string")
                        $util.base64.decode(object.payloadHash, message.payloadHash = $util.newBuffer($util.base64.length(object.payloadHash)), 0);
                    else if (object.payloadHash.length >= 0)
                        message.payloadHash = object.payloadHash;
                if (object.signature != null)
                    if (typeof object.signature === "string")
                        $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                    else if (object.signature.length >= 0)
                        message.signature = object.signature;
                if (object.nonce != null)
                    message.nonce = object.nonce >>> 0;
                return message;
            };

            /**
             * Creates a plain object from an EnvelopeHeaderHashMaterial message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {vco.v3.EnvelopeHeaderHashMaterial} message EnvelopeHeaderHashMaterial
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EnvelopeHeaderHashMaterial.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.version = 0;
                    object.flags = 0;
                    object.payloadType = 0;
                    if (options.bytes === String)
                        object.creatorId = "";
                    else {
                        object.creatorId = [];
                        if (options.bytes !== Array)
                            object.creatorId = $util.newBuffer(object.creatorId);
                    }
                    if (options.bytes === String)
                        object.payloadHash = "";
                    else {
                        object.payloadHash = [];
                        if (options.bytes !== Array)
                            object.payloadHash = $util.newBuffer(object.payloadHash);
                    }
                    if (options.bytes === String)
                        object.signature = "";
                    else {
                        object.signature = [];
                        if (options.bytes !== Array)
                            object.signature = $util.newBuffer(object.signature);
                    }
                    object.nonce = 0;
                }
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.flags != null && message.hasOwnProperty("flags"))
                    object.flags = message.flags;
                if (message.payloadType != null && message.hasOwnProperty("payloadType"))
                    object.payloadType = message.payloadType;
                if (message.creatorId != null && message.hasOwnProperty("creatorId"))
                    object.creatorId = options.bytes === String ? $util.base64.encode(message.creatorId, 0, message.creatorId.length) : options.bytes === Array ? Array.prototype.slice.call(message.creatorId) : message.creatorId;
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    object.payloadHash = options.bytes === String ? $util.base64.encode(message.payloadHash, 0, message.payloadHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.payloadHash) : message.payloadHash;
                if (message.signature != null && message.hasOwnProperty("signature"))
                    object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    object.nonce = message.nonce;
                return object;
            };

            /**
             * Converts this EnvelopeHeaderHashMaterial to JSON.
             * @function toJSON
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EnvelopeHeaderHashMaterial.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EnvelopeHeaderHashMaterial
             * @function getTypeUrl
             * @memberof vco.v3.EnvelopeHeaderHashMaterial
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EnvelopeHeaderHashMaterial.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.EnvelopeHeaderHashMaterial";
            };

            return EnvelopeHeaderHashMaterial;
        })();

        v3.PayloadFragment = (function() {

            /**
             * Properties of a PayloadFragment.
             * @memberof vco.v3
             * @interface IPayloadFragment
             * @property {Uint8Array|null} [parentHeaderHash] PayloadFragment parentHeaderHash
             * @property {number|null} [fragmentIndex] PayloadFragment fragmentIndex
             * @property {number|null} [fragmentCount] PayloadFragment fragmentCount
             * @property {number|null} [totalPayloadSize] PayloadFragment totalPayloadSize
             * @property {Uint8Array|null} [payloadChunk] PayloadFragment payloadChunk
             * @property {Uint8Array|null} [payloadHash] PayloadFragment payloadHash
             */

            /**
             * Constructs a new PayloadFragment.
             * @memberof vco.v3
             * @classdesc Represents a PayloadFragment.
             * @implements IPayloadFragment
             * @constructor
             * @param {vco.v3.IPayloadFragment=} [properties] Properties to set
             */
            function PayloadFragment(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PayloadFragment parentHeaderHash.
             * @member {Uint8Array} parentHeaderHash
             * @memberof vco.v3.PayloadFragment
             * @instance
             */
            PayloadFragment.prototype.parentHeaderHash = $util.newBuffer([]);

            /**
             * PayloadFragment fragmentIndex.
             * @member {number} fragmentIndex
             * @memberof vco.v3.PayloadFragment
             * @instance
             */
            PayloadFragment.prototype.fragmentIndex = 0;

            /**
             * PayloadFragment fragmentCount.
             * @member {number} fragmentCount
             * @memberof vco.v3.PayloadFragment
             * @instance
             */
            PayloadFragment.prototype.fragmentCount = 0;

            /**
             * PayloadFragment totalPayloadSize.
             * @member {number} totalPayloadSize
             * @memberof vco.v3.PayloadFragment
             * @instance
             */
            PayloadFragment.prototype.totalPayloadSize = 0;

            /**
             * PayloadFragment payloadChunk.
             * @member {Uint8Array} payloadChunk
             * @memberof vco.v3.PayloadFragment
             * @instance
             */
            PayloadFragment.prototype.payloadChunk = $util.newBuffer([]);

            /**
             * PayloadFragment payloadHash.
             * @member {Uint8Array} payloadHash
             * @memberof vco.v3.PayloadFragment
             * @instance
             */
            PayloadFragment.prototype.payloadHash = $util.newBuffer([]);

            /**
             * Creates a new PayloadFragment instance using the specified properties.
             * @function create
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {vco.v3.IPayloadFragment=} [properties] Properties to set
             * @returns {vco.v3.PayloadFragment} PayloadFragment instance
             */
            PayloadFragment.create = function create(properties) {
                return new PayloadFragment(properties);
            };

            /**
             * Encodes the specified PayloadFragment message. Does not implicitly {@link vco.v3.PayloadFragment.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {vco.v3.IPayloadFragment} message PayloadFragment message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PayloadFragment.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.parentHeaderHash != null && Object.hasOwnProperty.call(message, "parentHeaderHash"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.parentHeaderHash);
                if (message.fragmentIndex != null && Object.hasOwnProperty.call(message, "fragmentIndex"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.fragmentIndex);
                if (message.fragmentCount != null && Object.hasOwnProperty.call(message, "fragmentCount"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.fragmentCount);
                if (message.totalPayloadSize != null && Object.hasOwnProperty.call(message, "totalPayloadSize"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.totalPayloadSize);
                if (message.payloadChunk != null && Object.hasOwnProperty.call(message, "payloadChunk"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.payloadChunk);
                if (message.payloadHash != null && Object.hasOwnProperty.call(message, "payloadHash"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.payloadHash);
                return writer;
            };

            /**
             * Encodes the specified PayloadFragment message, length delimited. Does not implicitly {@link vco.v3.PayloadFragment.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {vco.v3.IPayloadFragment} message PayloadFragment message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PayloadFragment.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PayloadFragment message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.PayloadFragment} PayloadFragment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PayloadFragment.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.PayloadFragment();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.parentHeaderHash = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.fragmentIndex = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.fragmentCount = reader.uint32();
                            break;
                        }
                    case 4: {
                            message.totalPayloadSize = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.payloadChunk = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.payloadHash = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PayloadFragment message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.PayloadFragment} PayloadFragment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PayloadFragment.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PayloadFragment message.
             * @function verify
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PayloadFragment.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.parentHeaderHash != null && message.hasOwnProperty("parentHeaderHash"))
                    if (!(message.parentHeaderHash && typeof message.parentHeaderHash.length === "number" || $util.isString(message.parentHeaderHash)))
                        return "parentHeaderHash: buffer expected";
                if (message.fragmentIndex != null && message.hasOwnProperty("fragmentIndex"))
                    if (!$util.isInteger(message.fragmentIndex))
                        return "fragmentIndex: integer expected";
                if (message.fragmentCount != null && message.hasOwnProperty("fragmentCount"))
                    if (!$util.isInteger(message.fragmentCount))
                        return "fragmentCount: integer expected";
                if (message.totalPayloadSize != null && message.hasOwnProperty("totalPayloadSize"))
                    if (!$util.isInteger(message.totalPayloadSize))
                        return "totalPayloadSize: integer expected";
                if (message.payloadChunk != null && message.hasOwnProperty("payloadChunk"))
                    if (!(message.payloadChunk && typeof message.payloadChunk.length === "number" || $util.isString(message.payloadChunk)))
                        return "payloadChunk: buffer expected";
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    if (!(message.payloadHash && typeof message.payloadHash.length === "number" || $util.isString(message.payloadHash)))
                        return "payloadHash: buffer expected";
                return null;
            };

            /**
             * Creates a PayloadFragment message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.PayloadFragment} PayloadFragment
             */
            PayloadFragment.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.PayloadFragment)
                    return object;
                let message = new $root.vco.v3.PayloadFragment();
                if (object.parentHeaderHash != null)
                    if (typeof object.parentHeaderHash === "string")
                        $util.base64.decode(object.parentHeaderHash, message.parentHeaderHash = $util.newBuffer($util.base64.length(object.parentHeaderHash)), 0);
                    else if (object.parentHeaderHash.length >= 0)
                        message.parentHeaderHash = object.parentHeaderHash;
                if (object.fragmentIndex != null)
                    message.fragmentIndex = object.fragmentIndex >>> 0;
                if (object.fragmentCount != null)
                    message.fragmentCount = object.fragmentCount >>> 0;
                if (object.totalPayloadSize != null)
                    message.totalPayloadSize = object.totalPayloadSize >>> 0;
                if (object.payloadChunk != null)
                    if (typeof object.payloadChunk === "string")
                        $util.base64.decode(object.payloadChunk, message.payloadChunk = $util.newBuffer($util.base64.length(object.payloadChunk)), 0);
                    else if (object.payloadChunk.length >= 0)
                        message.payloadChunk = object.payloadChunk;
                if (object.payloadHash != null)
                    if (typeof object.payloadHash === "string")
                        $util.base64.decode(object.payloadHash, message.payloadHash = $util.newBuffer($util.base64.length(object.payloadHash)), 0);
                    else if (object.payloadHash.length >= 0)
                        message.payloadHash = object.payloadHash;
                return message;
            };

            /**
             * Creates a plain object from a PayloadFragment message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {vco.v3.PayloadFragment} message PayloadFragment
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PayloadFragment.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.parentHeaderHash = "";
                    else {
                        object.parentHeaderHash = [];
                        if (options.bytes !== Array)
                            object.parentHeaderHash = $util.newBuffer(object.parentHeaderHash);
                    }
                    object.fragmentIndex = 0;
                    object.fragmentCount = 0;
                    object.totalPayloadSize = 0;
                    if (options.bytes === String)
                        object.payloadChunk = "";
                    else {
                        object.payloadChunk = [];
                        if (options.bytes !== Array)
                            object.payloadChunk = $util.newBuffer(object.payloadChunk);
                    }
                    if (options.bytes === String)
                        object.payloadHash = "";
                    else {
                        object.payloadHash = [];
                        if (options.bytes !== Array)
                            object.payloadHash = $util.newBuffer(object.payloadHash);
                    }
                }
                if (message.parentHeaderHash != null && message.hasOwnProperty("parentHeaderHash"))
                    object.parentHeaderHash = options.bytes === String ? $util.base64.encode(message.parentHeaderHash, 0, message.parentHeaderHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.parentHeaderHash) : message.parentHeaderHash;
                if (message.fragmentIndex != null && message.hasOwnProperty("fragmentIndex"))
                    object.fragmentIndex = message.fragmentIndex;
                if (message.fragmentCount != null && message.hasOwnProperty("fragmentCount"))
                    object.fragmentCount = message.fragmentCount;
                if (message.totalPayloadSize != null && message.hasOwnProperty("totalPayloadSize"))
                    object.totalPayloadSize = message.totalPayloadSize;
                if (message.payloadChunk != null && message.hasOwnProperty("payloadChunk"))
                    object.payloadChunk = options.bytes === String ? $util.base64.encode(message.payloadChunk, 0, message.payloadChunk.length) : options.bytes === Array ? Array.prototype.slice.call(message.payloadChunk) : message.payloadChunk;
                if (message.payloadHash != null && message.hasOwnProperty("payloadHash"))
                    object.payloadHash = options.bytes === String ? $util.base64.encode(message.payloadHash, 0, message.payloadHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.payloadHash) : message.payloadHash;
                return object;
            };

            /**
             * Converts this PayloadFragment to JSON.
             * @function toJSON
             * @memberof vco.v3.PayloadFragment
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PayloadFragment.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PayloadFragment
             * @function getTypeUrl
             * @memberof vco.v3.PayloadFragment
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PayloadFragment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.PayloadFragment";
            };

            return PayloadFragment;
        })();

        v3.PayloadFragmentSet = (function() {

            /**
             * Properties of a PayloadFragmentSet.
             * @memberof vco.v3
             * @interface IPayloadFragmentSet
             * @property {Array.<vco.v3.IPayloadFragment>|null} [fragments] PayloadFragmentSet fragments
             */

            /**
             * Constructs a new PayloadFragmentSet.
             * @memberof vco.v3
             * @classdesc Represents a PayloadFragmentSet.
             * @implements IPayloadFragmentSet
             * @constructor
             * @param {vco.v3.IPayloadFragmentSet=} [properties] Properties to set
             */
            function PayloadFragmentSet(properties) {
                this.fragments = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PayloadFragmentSet fragments.
             * @member {Array.<vco.v3.IPayloadFragment>} fragments
             * @memberof vco.v3.PayloadFragmentSet
             * @instance
             */
            PayloadFragmentSet.prototype.fragments = $util.emptyArray;

            /**
             * Creates a new PayloadFragmentSet instance using the specified properties.
             * @function create
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {vco.v3.IPayloadFragmentSet=} [properties] Properties to set
             * @returns {vco.v3.PayloadFragmentSet} PayloadFragmentSet instance
             */
            PayloadFragmentSet.create = function create(properties) {
                return new PayloadFragmentSet(properties);
            };

            /**
             * Encodes the specified PayloadFragmentSet message. Does not implicitly {@link vco.v3.PayloadFragmentSet.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {vco.v3.IPayloadFragmentSet} message PayloadFragmentSet message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PayloadFragmentSet.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fragments != null && message.fragments.length)
                    for (let i = 0; i < message.fragments.length; ++i)
                        $root.vco.v3.PayloadFragment.encode(message.fragments[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified PayloadFragmentSet message, length delimited. Does not implicitly {@link vco.v3.PayloadFragmentSet.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {vco.v3.IPayloadFragmentSet} message PayloadFragmentSet message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PayloadFragmentSet.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PayloadFragmentSet message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.PayloadFragmentSet} PayloadFragmentSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PayloadFragmentSet.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.PayloadFragmentSet();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.fragments && message.fragments.length))
                                message.fragments = [];
                            message.fragments.push($root.vco.v3.PayloadFragment.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PayloadFragmentSet message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.PayloadFragmentSet} PayloadFragmentSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PayloadFragmentSet.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PayloadFragmentSet message.
             * @function verify
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PayloadFragmentSet.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fragments != null && message.hasOwnProperty("fragments")) {
                    if (!Array.isArray(message.fragments))
                        return "fragments: array expected";
                    for (let i = 0; i < message.fragments.length; ++i) {
                        let error = $root.vco.v3.PayloadFragment.verify(message.fragments[i]);
                        if (error)
                            return "fragments." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a PayloadFragmentSet message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.PayloadFragmentSet} PayloadFragmentSet
             */
            PayloadFragmentSet.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.PayloadFragmentSet)
                    return object;
                let message = new $root.vco.v3.PayloadFragmentSet();
                if (object.fragments) {
                    if (!Array.isArray(object.fragments))
                        throw TypeError(".vco.v3.PayloadFragmentSet.fragments: array expected");
                    message.fragments = [];
                    for (let i = 0; i < object.fragments.length; ++i) {
                        if (typeof object.fragments[i] !== "object")
                            throw TypeError(".vco.v3.PayloadFragmentSet.fragments: object expected");
                        message.fragments[i] = $root.vco.v3.PayloadFragment.fromObject(object.fragments[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a PayloadFragmentSet message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {vco.v3.PayloadFragmentSet} message PayloadFragmentSet
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PayloadFragmentSet.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.fragments = [];
                if (message.fragments && message.fragments.length) {
                    object.fragments = [];
                    for (let j = 0; j < message.fragments.length; ++j)
                        object.fragments[j] = $root.vco.v3.PayloadFragment.toObject(message.fragments[j], options);
                }
                return object;
            };

            /**
             * Converts this PayloadFragmentSet to JSON.
             * @function toJSON
             * @memberof vco.v3.PayloadFragmentSet
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PayloadFragmentSet.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PayloadFragmentSet
             * @function getTypeUrl
             * @memberof vco.v3.PayloadFragmentSet
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PayloadFragmentSet.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.PayloadFragmentSet";
            };

            return PayloadFragmentSet;
        })();

        /**
         * PriorityLevel enum.
         * @name vco.v3.PriorityLevel
         * @enum {number}
         * @property {number} PRIORITY_CRITICAL=0 PRIORITY_CRITICAL value
         * @property {number} PRIORITY_HIGH=1 PRIORITY_HIGH value
         * @property {number} PRIORITY_NORMAL=2 PRIORITY_NORMAL value
         * @property {number} PRIORITY_LOW=3 PRIORITY_LOW value
         */
        v3.PriorityLevel = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "PRIORITY_CRITICAL"] = 0;
            values[valuesById[1] = "PRIORITY_HIGH"] = 1;
            values[valuesById[2] = "PRIORITY_NORMAL"] = 2;
            values[valuesById[3] = "PRIORITY_LOW"] = 3;
            return values;
        })();

        v3.InterestVector = (function() {

            /**
             * Properties of an InterestVector.
             * @memberof vco.v3
             * @interface IInterestVector
             * @property {Array.<Uint8Array>|null} [targetCids] InterestVector targetCids
             * @property {vco.v3.PriorityLevel|null} [priority] InterestVector priority
             */

            /**
             * Constructs a new InterestVector.
             * @memberof vco.v3
             * @classdesc Represents an InterestVector.
             * @implements IInterestVector
             * @constructor
             * @param {vco.v3.IInterestVector=} [properties] Properties to set
             */
            function InterestVector(properties) {
                this.targetCids = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * InterestVector targetCids.
             * @member {Array.<Uint8Array>} targetCids
             * @memberof vco.v3.InterestVector
             * @instance
             */
            InterestVector.prototype.targetCids = $util.emptyArray;

            /**
             * InterestVector priority.
             * @member {vco.v3.PriorityLevel} priority
             * @memberof vco.v3.InterestVector
             * @instance
             */
            InterestVector.prototype.priority = 0;

            /**
             * Creates a new InterestVector instance using the specified properties.
             * @function create
             * @memberof vco.v3.InterestVector
             * @static
             * @param {vco.v3.IInterestVector=} [properties] Properties to set
             * @returns {vco.v3.InterestVector} InterestVector instance
             */
            InterestVector.create = function create(properties) {
                return new InterestVector(properties);
            };

            /**
             * Encodes the specified InterestVector message. Does not implicitly {@link vco.v3.InterestVector.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.InterestVector
             * @static
             * @param {vco.v3.IInterestVector} message InterestVector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InterestVector.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.targetCids != null && message.targetCids.length)
                    for (let i = 0; i < message.targetCids.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.targetCids[i]);
                if (message.priority != null && Object.hasOwnProperty.call(message, "priority"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.priority);
                return writer;
            };

            /**
             * Encodes the specified InterestVector message, length delimited. Does not implicitly {@link vco.v3.InterestVector.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.InterestVector
             * @static
             * @param {vco.v3.IInterestVector} message InterestVector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InterestVector.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an InterestVector message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.InterestVector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.InterestVector} InterestVector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InterestVector.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.InterestVector();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.targetCids && message.targetCids.length))
                                message.targetCids = [];
                            message.targetCids.push(reader.bytes());
                            break;
                        }
                    case 2: {
                            message.priority = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an InterestVector message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.InterestVector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.InterestVector} InterestVector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InterestVector.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an InterestVector message.
             * @function verify
             * @memberof vco.v3.InterestVector
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            InterestVector.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.targetCids != null && message.hasOwnProperty("targetCids")) {
                    if (!Array.isArray(message.targetCids))
                        return "targetCids: array expected";
                    for (let i = 0; i < message.targetCids.length; ++i)
                        if (!(message.targetCids[i] && typeof message.targetCids[i].length === "number" || $util.isString(message.targetCids[i])))
                            return "targetCids: buffer[] expected";
                }
                if (message.priority != null && message.hasOwnProperty("priority"))
                    switch (message.priority) {
                    default:
                        return "priority: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                return null;
            };

            /**
             * Creates an InterestVector message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.InterestVector
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.InterestVector} InterestVector
             */
            InterestVector.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.InterestVector)
                    return object;
                let message = new $root.vco.v3.InterestVector();
                if (object.targetCids) {
                    if (!Array.isArray(object.targetCids))
                        throw TypeError(".vco.v3.InterestVector.targetCids: array expected");
                    message.targetCids = [];
                    for (let i = 0; i < object.targetCids.length; ++i)
                        if (typeof object.targetCids[i] === "string")
                            $util.base64.decode(object.targetCids[i], message.targetCids[i] = $util.newBuffer($util.base64.length(object.targetCids[i])), 0);
                        else if (object.targetCids[i].length >= 0)
                            message.targetCids[i] = object.targetCids[i];
                }
                switch (object.priority) {
                default:
                    if (typeof object.priority === "number") {
                        message.priority = object.priority;
                        break;
                    }
                    break;
                case "PRIORITY_CRITICAL":
                case 0:
                    message.priority = 0;
                    break;
                case "PRIORITY_HIGH":
                case 1:
                    message.priority = 1;
                    break;
                case "PRIORITY_NORMAL":
                case 2:
                    message.priority = 2;
                    break;
                case "PRIORITY_LOW":
                case 3:
                    message.priority = 3;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from an InterestVector message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.InterestVector
             * @static
             * @param {vco.v3.InterestVector} message InterestVector
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            InterestVector.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.targetCids = [];
                if (options.defaults)
                    object.priority = options.enums === String ? "PRIORITY_CRITICAL" : 0;
                if (message.targetCids && message.targetCids.length) {
                    object.targetCids = [];
                    for (let j = 0; j < message.targetCids.length; ++j)
                        object.targetCids[j] = options.bytes === String ? $util.base64.encode(message.targetCids[j], 0, message.targetCids[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.targetCids[j]) : message.targetCids[j];
                }
                if (message.priority != null && message.hasOwnProperty("priority"))
                    object.priority = options.enums === String ? $root.vco.v3.PriorityLevel[message.priority] === undefined ? message.priority : $root.vco.v3.PriorityLevel[message.priority] : message.priority;
                return object;
            };

            /**
             * Converts this InterestVector to JSON.
             * @function toJSON
             * @memberof vco.v3.InterestVector
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            InterestVector.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for InterestVector
             * @function getTypeUrl
             * @memberof vco.v3.InterestVector
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            InterestVector.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.InterestVector";
            };

            return InterestVector;
        })();

        v3.PowChallenge = (function() {

            /**
             * Properties of a PowChallenge.
             * @memberof vco.v3
             * @interface IPowChallenge
             * @property {number|null} [minDifficulty] PowChallenge minDifficulty
             * @property {number|null} [ttlSeconds] PowChallenge ttlSeconds
             * @property {string|null} [reason] PowChallenge reason
             */

            /**
             * Constructs a new PowChallenge.
             * @memberof vco.v3
             * @classdesc Represents a PowChallenge.
             * @implements IPowChallenge
             * @constructor
             * @param {vco.v3.IPowChallenge=} [properties] Properties to set
             */
            function PowChallenge(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PowChallenge minDifficulty.
             * @member {number} minDifficulty
             * @memberof vco.v3.PowChallenge
             * @instance
             */
            PowChallenge.prototype.minDifficulty = 0;

            /**
             * PowChallenge ttlSeconds.
             * @member {number} ttlSeconds
             * @memberof vco.v3.PowChallenge
             * @instance
             */
            PowChallenge.prototype.ttlSeconds = 0;

            /**
             * PowChallenge reason.
             * @member {string} reason
             * @memberof vco.v3.PowChallenge
             * @instance
             */
            PowChallenge.prototype.reason = "";

            /**
             * Creates a new PowChallenge instance using the specified properties.
             * @function create
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {vco.v3.IPowChallenge=} [properties] Properties to set
             * @returns {vco.v3.PowChallenge} PowChallenge instance
             */
            PowChallenge.create = function create(properties) {
                return new PowChallenge(properties);
            };

            /**
             * Encodes the specified PowChallenge message. Does not implicitly {@link vco.v3.PowChallenge.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {vco.v3.IPowChallenge} message PowChallenge message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PowChallenge.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.minDifficulty != null && Object.hasOwnProperty.call(message, "minDifficulty"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.minDifficulty);
                if (message.ttlSeconds != null && Object.hasOwnProperty.call(message, "ttlSeconds"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.ttlSeconds);
                if (message.reason != null && Object.hasOwnProperty.call(message, "reason"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.reason);
                return writer;
            };

            /**
             * Encodes the specified PowChallenge message, length delimited. Does not implicitly {@link vco.v3.PowChallenge.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {vco.v3.IPowChallenge} message PowChallenge message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PowChallenge.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PowChallenge message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.PowChallenge} PowChallenge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PowChallenge.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.PowChallenge();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.minDifficulty = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.ttlSeconds = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.reason = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PowChallenge message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.PowChallenge} PowChallenge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PowChallenge.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PowChallenge message.
             * @function verify
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PowChallenge.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.minDifficulty != null && message.hasOwnProperty("minDifficulty"))
                    if (!$util.isInteger(message.minDifficulty))
                        return "minDifficulty: integer expected";
                if (message.ttlSeconds != null && message.hasOwnProperty("ttlSeconds"))
                    if (!$util.isInteger(message.ttlSeconds))
                        return "ttlSeconds: integer expected";
                if (message.reason != null && message.hasOwnProperty("reason"))
                    if (!$util.isString(message.reason))
                        return "reason: string expected";
                return null;
            };

            /**
             * Creates a PowChallenge message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.PowChallenge} PowChallenge
             */
            PowChallenge.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.PowChallenge)
                    return object;
                let message = new $root.vco.v3.PowChallenge();
                if (object.minDifficulty != null)
                    message.minDifficulty = object.minDifficulty >>> 0;
                if (object.ttlSeconds != null)
                    message.ttlSeconds = object.ttlSeconds >>> 0;
                if (object.reason != null)
                    message.reason = String(object.reason);
                return message;
            };

            /**
             * Creates a plain object from a PowChallenge message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {vco.v3.PowChallenge} message PowChallenge
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PowChallenge.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.minDifficulty = 0;
                    object.ttlSeconds = 0;
                    object.reason = "";
                }
                if (message.minDifficulty != null && message.hasOwnProperty("minDifficulty"))
                    object.minDifficulty = message.minDifficulty;
                if (message.ttlSeconds != null && message.hasOwnProperty("ttlSeconds"))
                    object.ttlSeconds = message.ttlSeconds;
                if (message.reason != null && message.hasOwnProperty("reason"))
                    object.reason = message.reason;
                return object;
            };

            /**
             * Converts this PowChallenge to JSON.
             * @function toJSON
             * @memberof vco.v3.PowChallenge
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PowChallenge.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PowChallenge
             * @function getTypeUrl
             * @memberof vco.v3.PowChallenge
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PowChallenge.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.PowChallenge";
            };

            return PowChallenge;
        })();

        v3.SyncControl = (function() {

            /**
             * Properties of a SyncControl.
             * @memberof vco.v3
             * @interface ISyncControl
             * @property {vco.v3.ISyncMessage|null} [syncMessage] SyncControl syncMessage
             * @property {vco.v3.IPowChallenge|null} [powChallenge] SyncControl powChallenge
             * @property {vco.v3.IInterestVector|null} [interestVector] SyncControl interestVector
             */

            /**
             * Constructs a new SyncControl.
             * @memberof vco.v3
             * @classdesc Represents a SyncControl.
             * @implements ISyncControl
             * @constructor
             * @param {vco.v3.ISyncControl=} [properties] Properties to set
             */
            function SyncControl(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SyncControl syncMessage.
             * @member {vco.v3.ISyncMessage|null|undefined} syncMessage
             * @memberof vco.v3.SyncControl
             * @instance
             */
            SyncControl.prototype.syncMessage = null;

            /**
             * SyncControl powChallenge.
             * @member {vco.v3.IPowChallenge|null|undefined} powChallenge
             * @memberof vco.v3.SyncControl
             * @instance
             */
            SyncControl.prototype.powChallenge = null;

            /**
             * SyncControl interestVector.
             * @member {vco.v3.IInterestVector|null|undefined} interestVector
             * @memberof vco.v3.SyncControl
             * @instance
             */
            SyncControl.prototype.interestVector = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * SyncControl message.
             * @member {"syncMessage"|"powChallenge"|"interestVector"|undefined} message
             * @memberof vco.v3.SyncControl
             * @instance
             */
            Object.defineProperty(SyncControl.prototype, "message", {
                get: $util.oneOfGetter($oneOfFields = ["syncMessage", "powChallenge", "interestVector"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new SyncControl instance using the specified properties.
             * @function create
             * @memberof vco.v3.SyncControl
             * @static
             * @param {vco.v3.ISyncControl=} [properties] Properties to set
             * @returns {vco.v3.SyncControl} SyncControl instance
             */
            SyncControl.create = function create(properties) {
                return new SyncControl(properties);
            };

            /**
             * Encodes the specified SyncControl message. Does not implicitly {@link vco.v3.SyncControl.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.SyncControl
             * @static
             * @param {vco.v3.ISyncControl} message SyncControl message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SyncControl.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.syncMessage != null && Object.hasOwnProperty.call(message, "syncMessage"))
                    $root.vco.v3.SyncMessage.encode(message.syncMessage, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.powChallenge != null && Object.hasOwnProperty.call(message, "powChallenge"))
                    $root.vco.v3.PowChallenge.encode(message.powChallenge, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.interestVector != null && Object.hasOwnProperty.call(message, "interestVector"))
                    $root.vco.v3.InterestVector.encode(message.interestVector, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified SyncControl message, length delimited. Does not implicitly {@link vco.v3.SyncControl.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.SyncControl
             * @static
             * @param {vco.v3.ISyncControl} message SyncControl message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SyncControl.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SyncControl message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.SyncControl
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.SyncControl} SyncControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SyncControl.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.SyncControl();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.syncMessage = $root.vco.v3.SyncMessage.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.powChallenge = $root.vco.v3.PowChallenge.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.interestVector = $root.vco.v3.InterestVector.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SyncControl message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.SyncControl
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.SyncControl} SyncControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SyncControl.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SyncControl message.
             * @function verify
             * @memberof vco.v3.SyncControl
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SyncControl.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                let properties = {};
                if (message.syncMessage != null && message.hasOwnProperty("syncMessage")) {
                    properties.message = 1;
                    {
                        let error = $root.vco.v3.SyncMessage.verify(message.syncMessage);
                        if (error)
                            return "syncMessage." + error;
                    }
                }
                if (message.powChallenge != null && message.hasOwnProperty("powChallenge")) {
                    if (properties.message === 1)
                        return "message: multiple values";
                    properties.message = 1;
                    {
                        let error = $root.vco.v3.PowChallenge.verify(message.powChallenge);
                        if (error)
                            return "powChallenge." + error;
                    }
                }
                if (message.interestVector != null && message.hasOwnProperty("interestVector")) {
                    if (properties.message === 1)
                        return "message: multiple values";
                    properties.message = 1;
                    {
                        let error = $root.vco.v3.InterestVector.verify(message.interestVector);
                        if (error)
                            return "interestVector." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a SyncControl message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.SyncControl
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.SyncControl} SyncControl
             */
            SyncControl.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.SyncControl)
                    return object;
                let message = new $root.vco.v3.SyncControl();
                if (object.syncMessage != null) {
                    if (typeof object.syncMessage !== "object")
                        throw TypeError(".vco.v3.SyncControl.syncMessage: object expected");
                    message.syncMessage = $root.vco.v3.SyncMessage.fromObject(object.syncMessage);
                }
                if (object.powChallenge != null) {
                    if (typeof object.powChallenge !== "object")
                        throw TypeError(".vco.v3.SyncControl.powChallenge: object expected");
                    message.powChallenge = $root.vco.v3.PowChallenge.fromObject(object.powChallenge);
                }
                if (object.interestVector != null) {
                    if (typeof object.interestVector !== "object")
                        throw TypeError(".vco.v3.SyncControl.interestVector: object expected");
                    message.interestVector = $root.vco.v3.InterestVector.fromObject(object.interestVector);
                }
                return message;
            };

            /**
             * Creates a plain object from a SyncControl message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.SyncControl
             * @static
             * @param {vco.v3.SyncControl} message SyncControl
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SyncControl.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (message.syncMessage != null && message.hasOwnProperty("syncMessage")) {
                    object.syncMessage = $root.vco.v3.SyncMessage.toObject(message.syncMessage, options);
                    if (options.oneofs)
                        object.message = "syncMessage";
                }
                if (message.powChallenge != null && message.hasOwnProperty("powChallenge")) {
                    object.powChallenge = $root.vco.v3.PowChallenge.toObject(message.powChallenge, options);
                    if (options.oneofs)
                        object.message = "powChallenge";
                }
                if (message.interestVector != null && message.hasOwnProperty("interestVector")) {
                    object.interestVector = $root.vco.v3.InterestVector.toObject(message.interestVector, options);
                    if (options.oneofs)
                        object.message = "interestVector";
                }
                return object;
            };

            /**
             * Converts this SyncControl to JSON.
             * @function toJSON
             * @memberof vco.v3.SyncControl
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SyncControl.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for SyncControl
             * @function getTypeUrl
             * @memberof vco.v3.SyncControl
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            SyncControl.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.SyncControl";
            };

            return SyncControl;
        })();

        v3.SyncMessage = (function() {

            /**
             * Properties of a SyncMessage.
             * @memberof vco.v3
             * @interface ISyncMessage
             * @property {Array.<vco.v3.SyncMessage.IRange>|null} [ranges] SyncMessage ranges
             */

            /**
             * Constructs a new SyncMessage.
             * @memberof vco.v3
             * @classdesc Represents a SyncMessage.
             * @implements ISyncMessage
             * @constructor
             * @param {vco.v3.ISyncMessage=} [properties] Properties to set
             */
            function SyncMessage(properties) {
                this.ranges = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SyncMessage ranges.
             * @member {Array.<vco.v3.SyncMessage.IRange>} ranges
             * @memberof vco.v3.SyncMessage
             * @instance
             */
            SyncMessage.prototype.ranges = $util.emptyArray;

            /**
             * Creates a new SyncMessage instance using the specified properties.
             * @function create
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {vco.v3.ISyncMessage=} [properties] Properties to set
             * @returns {vco.v3.SyncMessage} SyncMessage instance
             */
            SyncMessage.create = function create(properties) {
                return new SyncMessage(properties);
            };

            /**
             * Encodes the specified SyncMessage message. Does not implicitly {@link vco.v3.SyncMessage.verify|verify} messages.
             * @function encode
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {vco.v3.ISyncMessage} message SyncMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SyncMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.ranges != null && message.ranges.length)
                    for (let i = 0; i < message.ranges.length; ++i)
                        $root.vco.v3.SyncMessage.Range.encode(message.ranges[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified SyncMessage message, length delimited. Does not implicitly {@link vco.v3.SyncMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {vco.v3.ISyncMessage} message SyncMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SyncMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SyncMessage message from the specified reader or buffer.
             * @function decode
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.v3.SyncMessage} SyncMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SyncMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.SyncMessage();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.ranges && message.ranges.length))
                                message.ranges = [];
                            message.ranges.push($root.vco.v3.SyncMessage.Range.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SyncMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.v3.SyncMessage} SyncMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SyncMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SyncMessage message.
             * @function verify
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SyncMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.ranges != null && message.hasOwnProperty("ranges")) {
                    if (!Array.isArray(message.ranges))
                        return "ranges: array expected";
                    for (let i = 0; i < message.ranges.length; ++i) {
                        let error = $root.vco.v3.SyncMessage.Range.verify(message.ranges[i]);
                        if (error)
                            return "ranges." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a SyncMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.v3.SyncMessage} SyncMessage
             */
            SyncMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.v3.SyncMessage)
                    return object;
                let message = new $root.vco.v3.SyncMessage();
                if (object.ranges) {
                    if (!Array.isArray(object.ranges))
                        throw TypeError(".vco.v3.SyncMessage.ranges: array expected");
                    message.ranges = [];
                    for (let i = 0; i < object.ranges.length; ++i) {
                        if (typeof object.ranges[i] !== "object")
                            throw TypeError(".vco.v3.SyncMessage.ranges: object expected");
                        message.ranges[i] = $root.vco.v3.SyncMessage.Range.fromObject(object.ranges[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a SyncMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {vco.v3.SyncMessage} message SyncMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SyncMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.ranges = [];
                if (message.ranges && message.ranges.length) {
                    object.ranges = [];
                    for (let j = 0; j < message.ranges.length; ++j)
                        object.ranges[j] = $root.vco.v3.SyncMessage.Range.toObject(message.ranges[j], options);
                }
                return object;
            };

            /**
             * Converts this SyncMessage to JSON.
             * @function toJSON
             * @memberof vco.v3.SyncMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SyncMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for SyncMessage
             * @function getTypeUrl
             * @memberof vco.v3.SyncMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            SyncMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.v3.SyncMessage";
            };

            SyncMessage.Range = (function() {

                /**
                 * Properties of a Range.
                 * @memberof vco.v3.SyncMessage
                 * @interface IRange
                 * @property {Uint8Array|null} [startHash] Range startHash
                 * @property {Uint8Array|null} [endHash] Range endHash
                 * @property {Uint8Array|null} [fingerprint] Range fingerprint
                 */

                /**
                 * Constructs a new Range.
                 * @memberof vco.v3.SyncMessage
                 * @classdesc Represents a Range.
                 * @implements IRange
                 * @constructor
                 * @param {vco.v3.SyncMessage.IRange=} [properties] Properties to set
                 */
                function Range(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Range startHash.
                 * @member {Uint8Array} startHash
                 * @memberof vco.v3.SyncMessage.Range
                 * @instance
                 */
                Range.prototype.startHash = $util.newBuffer([]);

                /**
                 * Range endHash.
                 * @member {Uint8Array} endHash
                 * @memberof vco.v3.SyncMessage.Range
                 * @instance
                 */
                Range.prototype.endHash = $util.newBuffer([]);

                /**
                 * Range fingerprint.
                 * @member {Uint8Array} fingerprint
                 * @memberof vco.v3.SyncMessage.Range
                 * @instance
                 */
                Range.prototype.fingerprint = $util.newBuffer([]);

                /**
                 * Creates a new Range instance using the specified properties.
                 * @function create
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {vco.v3.SyncMessage.IRange=} [properties] Properties to set
                 * @returns {vco.v3.SyncMessage.Range} Range instance
                 */
                Range.create = function create(properties) {
                    return new Range(properties);
                };

                /**
                 * Encodes the specified Range message. Does not implicitly {@link vco.v3.SyncMessage.Range.verify|verify} messages.
                 * @function encode
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {vco.v3.SyncMessage.IRange} message Range message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Range.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.startHash != null && Object.hasOwnProperty.call(message, "startHash"))
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.startHash);
                    if (message.endHash != null && Object.hasOwnProperty.call(message, "endHash"))
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.endHash);
                    if (message.fingerprint != null && Object.hasOwnProperty.call(message, "fingerprint"))
                        writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.fingerprint);
                    return writer;
                };

                /**
                 * Encodes the specified Range message, length delimited. Does not implicitly {@link vco.v3.SyncMessage.Range.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {vco.v3.SyncMessage.IRange} message Range message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Range.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Range message from the specified reader or buffer.
                 * @function decode
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {vco.v3.SyncMessage.Range} Range
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Range.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.v3.SyncMessage.Range();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.startHash = reader.bytes();
                                break;
                            }
                        case 2: {
                                message.endHash = reader.bytes();
                                break;
                            }
                        case 3: {
                                message.fingerprint = reader.bytes();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Range message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {vco.v3.SyncMessage.Range} Range
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Range.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Range message.
                 * @function verify
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Range.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.startHash != null && message.hasOwnProperty("startHash"))
                        if (!(message.startHash && typeof message.startHash.length === "number" || $util.isString(message.startHash)))
                            return "startHash: buffer expected";
                    if (message.endHash != null && message.hasOwnProperty("endHash"))
                        if (!(message.endHash && typeof message.endHash.length === "number" || $util.isString(message.endHash)))
                            return "endHash: buffer expected";
                    if (message.fingerprint != null && message.hasOwnProperty("fingerprint"))
                        if (!(message.fingerprint && typeof message.fingerprint.length === "number" || $util.isString(message.fingerprint)))
                            return "fingerprint: buffer expected";
                    return null;
                };

                /**
                 * Creates a Range message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {vco.v3.SyncMessage.Range} Range
                 */
                Range.fromObject = function fromObject(object) {
                    if (object instanceof $root.vco.v3.SyncMessage.Range)
                        return object;
                    let message = new $root.vco.v3.SyncMessage.Range();
                    if (object.startHash != null)
                        if (typeof object.startHash === "string")
                            $util.base64.decode(object.startHash, message.startHash = $util.newBuffer($util.base64.length(object.startHash)), 0);
                        else if (object.startHash.length >= 0)
                            message.startHash = object.startHash;
                    if (object.endHash != null)
                        if (typeof object.endHash === "string")
                            $util.base64.decode(object.endHash, message.endHash = $util.newBuffer($util.base64.length(object.endHash)), 0);
                        else if (object.endHash.length >= 0)
                            message.endHash = object.endHash;
                    if (object.fingerprint != null)
                        if (typeof object.fingerprint === "string")
                            $util.base64.decode(object.fingerprint, message.fingerprint = $util.newBuffer($util.base64.length(object.fingerprint)), 0);
                        else if (object.fingerprint.length >= 0)
                            message.fingerprint = object.fingerprint;
                    return message;
                };

                /**
                 * Creates a plain object from a Range message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {vco.v3.SyncMessage.Range} message Range
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Range.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === String)
                            object.startHash = "";
                        else {
                            object.startHash = [];
                            if (options.bytes !== Array)
                                object.startHash = $util.newBuffer(object.startHash);
                        }
                        if (options.bytes === String)
                            object.endHash = "";
                        else {
                            object.endHash = [];
                            if (options.bytes !== Array)
                                object.endHash = $util.newBuffer(object.endHash);
                        }
                        if (options.bytes === String)
                            object.fingerprint = "";
                        else {
                            object.fingerprint = [];
                            if (options.bytes !== Array)
                                object.fingerprint = $util.newBuffer(object.fingerprint);
                        }
                    }
                    if (message.startHash != null && message.hasOwnProperty("startHash"))
                        object.startHash = options.bytes === String ? $util.base64.encode(message.startHash, 0, message.startHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.startHash) : message.startHash;
                    if (message.endHash != null && message.hasOwnProperty("endHash"))
                        object.endHash = options.bytes === String ? $util.base64.encode(message.endHash, 0, message.endHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.endHash) : message.endHash;
                    if (message.fingerprint != null && message.hasOwnProperty("fingerprint"))
                        object.fingerprint = options.bytes === String ? $util.base64.encode(message.fingerprint, 0, message.fingerprint.length) : options.bytes === Array ? Array.prototype.slice.call(message.fingerprint) : message.fingerprint;
                    return object;
                };

                /**
                 * Converts this Range to JSON.
                 * @function toJSON
                 * @memberof vco.v3.SyncMessage.Range
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Range.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Range
                 * @function getTypeUrl
                 * @memberof vco.v3.SyncMessage.Range
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Range.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/vco.v3.SyncMessage.Range";
                };

                return Range;
            })();

            return SyncMessage;
        })();

        return v3;
    })();

    return vco;
})();

export { $root as default };
