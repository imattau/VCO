/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-network/policy"] || ($protobuf.roots["vco-schemas-network/policy"] = {});

export const vco = $root.vco = (() => {

    /**
     * Namespace vco.
     * @exports vco
     * @namespace
     */
    const vco = {};

    vco.schemas = (function() {

        /**
         * Namespace schemas.
         * @memberof vco
         * @namespace
         */
        const schemas = {};

        schemas.RelayAdmissionPolicy = (function() {

            /**
             * Properties of a RelayAdmissionPolicy.
             * @memberof vco.schemas
             * @interface IRelayAdmissionPolicy
             * @property {string|null} [schema] RelayAdmissionPolicy schema
             * @property {number|null} [minPowDifficulty] RelayAdmissionPolicy minPowDifficulty
             * @property {Array.<number>|null} [acceptedPayloadTypes] RelayAdmissionPolicy acceptedPayloadTypes
             * @property {number|null} [maxEnvelopeSize] RelayAdmissionPolicy maxEnvelopeSize
             * @property {number|null} [storageTtlSeconds] RelayAdmissionPolicy storageTtlSeconds
             * @property {boolean|null} [requiresZkpAuth] RelayAdmissionPolicy requiresZkpAuth
             * @property {boolean|null} [supportsBlindRouting] RelayAdmissionPolicy supportsBlindRouting
             */

            /**
             * Constructs a new RelayAdmissionPolicy.
             * @memberof vco.schemas
             * @classdesc Represents a RelayAdmissionPolicy.
             * @implements IRelayAdmissionPolicy
             * @constructor
             * @param {vco.schemas.IRelayAdmissionPolicy=} [properties] Properties to set
             */
            function RelayAdmissionPolicy(properties) {
                this.acceptedPayloadTypes = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RelayAdmissionPolicy schema.
             * @member {string} schema
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.schema = "";

            /**
             * RelayAdmissionPolicy minPowDifficulty.
             * @member {number} minPowDifficulty
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.minPowDifficulty = 0;

            /**
             * RelayAdmissionPolicy acceptedPayloadTypes.
             * @member {Array.<number>} acceptedPayloadTypes
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.acceptedPayloadTypes = $util.emptyArray;

            /**
             * RelayAdmissionPolicy maxEnvelopeSize.
             * @member {number} maxEnvelopeSize
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.maxEnvelopeSize = 0;

            /**
             * RelayAdmissionPolicy storageTtlSeconds.
             * @member {number} storageTtlSeconds
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.storageTtlSeconds = 0;

            /**
             * RelayAdmissionPolicy requiresZkpAuth.
             * @member {boolean} requiresZkpAuth
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.requiresZkpAuth = false;

            /**
             * RelayAdmissionPolicy supportsBlindRouting.
             * @member {boolean} supportsBlindRouting
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             */
            RelayAdmissionPolicy.prototype.supportsBlindRouting = false;

            /**
             * Creates a new RelayAdmissionPolicy instance using the specified properties.
             * @function create
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {vco.schemas.IRelayAdmissionPolicy=} [properties] Properties to set
             * @returns {vco.schemas.RelayAdmissionPolicy} RelayAdmissionPolicy instance
             */
            RelayAdmissionPolicy.create = function create(properties) {
                return new RelayAdmissionPolicy(properties);
            };

            /**
             * Encodes the specified RelayAdmissionPolicy message. Does not implicitly {@link vco.schemas.RelayAdmissionPolicy.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {vco.schemas.IRelayAdmissionPolicy} message RelayAdmissionPolicy message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RelayAdmissionPolicy.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.minPowDifficulty != null && Object.hasOwnProperty.call(message, "minPowDifficulty"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.minPowDifficulty);
                if (message.acceptedPayloadTypes != null && message.acceptedPayloadTypes.length) {
                    writer.uint32(/* id 3, wireType 2 =*/26).fork();
                    for (let i = 0; i < message.acceptedPayloadTypes.length; ++i)
                        writer.uint32(message.acceptedPayloadTypes[i]);
                    writer.ldelim();
                }
                if (message.maxEnvelopeSize != null && Object.hasOwnProperty.call(message, "maxEnvelopeSize"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.maxEnvelopeSize);
                if (message.storageTtlSeconds != null && Object.hasOwnProperty.call(message, "storageTtlSeconds"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.storageTtlSeconds);
                if (message.requiresZkpAuth != null && Object.hasOwnProperty.call(message, "requiresZkpAuth"))
                    writer.uint32(/* id 6, wireType 0 =*/48).bool(message.requiresZkpAuth);
                if (message.supportsBlindRouting != null && Object.hasOwnProperty.call(message, "supportsBlindRouting"))
                    writer.uint32(/* id 7, wireType 0 =*/56).bool(message.supportsBlindRouting);
                return writer;
            };

            /**
             * Encodes the specified RelayAdmissionPolicy message, length delimited. Does not implicitly {@link vco.schemas.RelayAdmissionPolicy.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {vco.schemas.IRelayAdmissionPolicy} message RelayAdmissionPolicy message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RelayAdmissionPolicy.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RelayAdmissionPolicy message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.RelayAdmissionPolicy} RelayAdmissionPolicy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RelayAdmissionPolicy.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.RelayAdmissionPolicy();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.schema = reader.string();
                            break;
                        }
                    case 2: {
                            message.minPowDifficulty = reader.uint32();
                            break;
                        }
                    case 3: {
                            if (!(message.acceptedPayloadTypes && message.acceptedPayloadTypes.length))
                                message.acceptedPayloadTypes = [];
                            if ((tag & 7) === 2) {
                                let end2 = reader.uint32() + reader.pos;
                                while (reader.pos < end2)
                                    message.acceptedPayloadTypes.push(reader.uint32());
                            } else
                                message.acceptedPayloadTypes.push(reader.uint32());
                            break;
                        }
                    case 4: {
                            message.maxEnvelopeSize = reader.uint32();
                            break;
                        }
                    case 5: {
                            message.storageTtlSeconds = reader.uint32();
                            break;
                        }
                    case 6: {
                            message.requiresZkpAuth = reader.bool();
                            break;
                        }
                    case 7: {
                            message.supportsBlindRouting = reader.bool();
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
             * Decodes a RelayAdmissionPolicy message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.RelayAdmissionPolicy} RelayAdmissionPolicy
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RelayAdmissionPolicy.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RelayAdmissionPolicy message.
             * @function verify
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RelayAdmissionPolicy.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.minPowDifficulty != null && message.hasOwnProperty("minPowDifficulty"))
                    if (!$util.isInteger(message.minPowDifficulty))
                        return "minPowDifficulty: integer expected";
                if (message.acceptedPayloadTypes != null && message.hasOwnProperty("acceptedPayloadTypes")) {
                    if (!Array.isArray(message.acceptedPayloadTypes))
                        return "acceptedPayloadTypes: array expected";
                    for (let i = 0; i < message.acceptedPayloadTypes.length; ++i)
                        if (!$util.isInteger(message.acceptedPayloadTypes[i]))
                            return "acceptedPayloadTypes: integer[] expected";
                }
                if (message.maxEnvelopeSize != null && message.hasOwnProperty("maxEnvelopeSize"))
                    if (!$util.isInteger(message.maxEnvelopeSize))
                        return "maxEnvelopeSize: integer expected";
                if (message.storageTtlSeconds != null && message.hasOwnProperty("storageTtlSeconds"))
                    if (!$util.isInteger(message.storageTtlSeconds))
                        return "storageTtlSeconds: integer expected";
                if (message.requiresZkpAuth != null && message.hasOwnProperty("requiresZkpAuth"))
                    if (typeof message.requiresZkpAuth !== "boolean")
                        return "requiresZkpAuth: boolean expected";
                if (message.supportsBlindRouting != null && message.hasOwnProperty("supportsBlindRouting"))
                    if (typeof message.supportsBlindRouting !== "boolean")
                        return "supportsBlindRouting: boolean expected";
                return null;
            };

            /**
             * Creates a RelayAdmissionPolicy message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.RelayAdmissionPolicy} RelayAdmissionPolicy
             */
            RelayAdmissionPolicy.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.RelayAdmissionPolicy)
                    return object;
                let message = new $root.vco.schemas.RelayAdmissionPolicy();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.minPowDifficulty != null)
                    message.minPowDifficulty = object.minPowDifficulty >>> 0;
                if (object.acceptedPayloadTypes) {
                    if (!Array.isArray(object.acceptedPayloadTypes))
                        throw TypeError(".vco.schemas.RelayAdmissionPolicy.acceptedPayloadTypes: array expected");
                    message.acceptedPayloadTypes = [];
                    for (let i = 0; i < object.acceptedPayloadTypes.length; ++i)
                        message.acceptedPayloadTypes[i] = object.acceptedPayloadTypes[i] >>> 0;
                }
                if (object.maxEnvelopeSize != null)
                    message.maxEnvelopeSize = object.maxEnvelopeSize >>> 0;
                if (object.storageTtlSeconds != null)
                    message.storageTtlSeconds = object.storageTtlSeconds >>> 0;
                if (object.requiresZkpAuth != null)
                    message.requiresZkpAuth = Boolean(object.requiresZkpAuth);
                if (object.supportsBlindRouting != null)
                    message.supportsBlindRouting = Boolean(object.supportsBlindRouting);
                return message;
            };

            /**
             * Creates a plain object from a RelayAdmissionPolicy message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {vco.schemas.RelayAdmissionPolicy} message RelayAdmissionPolicy
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RelayAdmissionPolicy.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.acceptedPayloadTypes = [];
                if (options.defaults) {
                    object.schema = "";
                    object.minPowDifficulty = 0;
                    object.maxEnvelopeSize = 0;
                    object.storageTtlSeconds = 0;
                    object.requiresZkpAuth = false;
                    object.supportsBlindRouting = false;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.minPowDifficulty != null && message.hasOwnProperty("minPowDifficulty"))
                    object.minPowDifficulty = message.minPowDifficulty;
                if (message.acceptedPayloadTypes && message.acceptedPayloadTypes.length) {
                    object.acceptedPayloadTypes = [];
                    for (let j = 0; j < message.acceptedPayloadTypes.length; ++j)
                        object.acceptedPayloadTypes[j] = message.acceptedPayloadTypes[j];
                }
                if (message.maxEnvelopeSize != null && message.hasOwnProperty("maxEnvelopeSize"))
                    object.maxEnvelopeSize = message.maxEnvelopeSize;
                if (message.storageTtlSeconds != null && message.hasOwnProperty("storageTtlSeconds"))
                    object.storageTtlSeconds = message.storageTtlSeconds;
                if (message.requiresZkpAuth != null && message.hasOwnProperty("requiresZkpAuth"))
                    object.requiresZkpAuth = message.requiresZkpAuth;
                if (message.supportsBlindRouting != null && message.hasOwnProperty("supportsBlindRouting"))
                    object.supportsBlindRouting = message.supportsBlindRouting;
                return object;
            };

            /**
             * Converts this RelayAdmissionPolicy to JSON.
             * @function toJSON
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RelayAdmissionPolicy.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RelayAdmissionPolicy
             * @function getTypeUrl
             * @memberof vco.schemas.RelayAdmissionPolicy
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RelayAdmissionPolicy.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.RelayAdmissionPolicy";
            };

            return RelayAdmissionPolicy;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const RelayAdmissionPolicy = vco.schemas.RelayAdmissionPolicy;
