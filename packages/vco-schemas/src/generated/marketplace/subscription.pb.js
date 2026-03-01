/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-marketplace/subscription"] || ($protobuf.roots["vco-schemas-marketplace/subscription"] = {});

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

        schemas.SubscriptionManifest = (function() {

            /**
             * Properties of a SubscriptionManifest.
             * @memberof vco.schemas
             * @interface ISubscriptionManifest
             * @property {string|null} [schema] SubscriptionManifest schema
             * @property {Uint8Array|null} [contentCid] SubscriptionManifest contentCid
             * @property {string|null} [tierName] SubscriptionManifest tierName
             * @property {Array.<vco.schemas.SubscriptionManifest.IRequirement>|null} [requirements] SubscriptionManifest requirements
             */

            /**
             * Constructs a new SubscriptionManifest.
             * @memberof vco.schemas
             * @classdesc Represents a SubscriptionManifest.
             * @implements ISubscriptionManifest
             * @constructor
             * @param {vco.schemas.ISubscriptionManifest=} [properties] Properties to set
             */
            function SubscriptionManifest(properties) {
                this.requirements = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SubscriptionManifest schema.
             * @member {string} schema
             * @memberof vco.schemas.SubscriptionManifest
             * @instance
             */
            SubscriptionManifest.prototype.schema = "";

            /**
             * SubscriptionManifest contentCid.
             * @member {Uint8Array} contentCid
             * @memberof vco.schemas.SubscriptionManifest
             * @instance
             */
            SubscriptionManifest.prototype.contentCid = $util.newBuffer([]);

            /**
             * SubscriptionManifest tierName.
             * @member {string} tierName
             * @memberof vco.schemas.SubscriptionManifest
             * @instance
             */
            SubscriptionManifest.prototype.tierName = "";

            /**
             * SubscriptionManifest requirements.
             * @member {Array.<vco.schemas.SubscriptionManifest.IRequirement>} requirements
             * @memberof vco.schemas.SubscriptionManifest
             * @instance
             */
            SubscriptionManifest.prototype.requirements = $util.emptyArray;

            /**
             * Creates a new SubscriptionManifest instance using the specified properties.
             * @function create
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {vco.schemas.ISubscriptionManifest=} [properties] Properties to set
             * @returns {vco.schemas.SubscriptionManifest} SubscriptionManifest instance
             */
            SubscriptionManifest.create = function create(properties) {
                return new SubscriptionManifest(properties);
            };

            /**
             * Encodes the specified SubscriptionManifest message. Does not implicitly {@link vco.schemas.SubscriptionManifest.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {vco.schemas.ISubscriptionManifest} message SubscriptionManifest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SubscriptionManifest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.contentCid != null && Object.hasOwnProperty.call(message, "contentCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.contentCid);
                if (message.tierName != null && Object.hasOwnProperty.call(message, "tierName"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.tierName);
                if (message.requirements != null && message.requirements.length)
                    for (let i = 0; i < message.requirements.length; ++i)
                        $root.vco.schemas.SubscriptionManifest.Requirement.encode(message.requirements[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified SubscriptionManifest message, length delimited. Does not implicitly {@link vco.schemas.SubscriptionManifest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {vco.schemas.ISubscriptionManifest} message SubscriptionManifest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SubscriptionManifest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SubscriptionManifest message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.SubscriptionManifest} SubscriptionManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SubscriptionManifest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.SubscriptionManifest();
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
                            message.contentCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.tierName = reader.string();
                            break;
                        }
                    case 4: {
                            if (!(message.requirements && message.requirements.length))
                                message.requirements = [];
                            message.requirements.push($root.vco.schemas.SubscriptionManifest.Requirement.decode(reader, reader.uint32()));
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
             * Decodes a SubscriptionManifest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.SubscriptionManifest} SubscriptionManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SubscriptionManifest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SubscriptionManifest message.
             * @function verify
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SubscriptionManifest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.contentCid != null && message.hasOwnProperty("contentCid"))
                    if (!(message.contentCid && typeof message.contentCid.length === "number" || $util.isString(message.contentCid)))
                        return "contentCid: buffer expected";
                if (message.tierName != null && message.hasOwnProperty("tierName"))
                    if (!$util.isString(message.tierName))
                        return "tierName: string expected";
                if (message.requirements != null && message.hasOwnProperty("requirements")) {
                    if (!Array.isArray(message.requirements))
                        return "requirements: array expected";
                    for (let i = 0; i < message.requirements.length; ++i) {
                        let error = $root.vco.schemas.SubscriptionManifest.Requirement.verify(message.requirements[i]);
                        if (error)
                            return "requirements." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a SubscriptionManifest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.SubscriptionManifest} SubscriptionManifest
             */
            SubscriptionManifest.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.SubscriptionManifest)
                    return object;
                let message = new $root.vco.schemas.SubscriptionManifest();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.contentCid != null)
                    if (typeof object.contentCid === "string")
                        $util.base64.decode(object.contentCid, message.contentCid = $util.newBuffer($util.base64.length(object.contentCid)), 0);
                    else if (object.contentCid.length >= 0)
                        message.contentCid = object.contentCid;
                if (object.tierName != null)
                    message.tierName = String(object.tierName);
                if (object.requirements) {
                    if (!Array.isArray(object.requirements))
                        throw TypeError(".vco.schemas.SubscriptionManifest.requirements: array expected");
                    message.requirements = [];
                    for (let i = 0; i < object.requirements.length; ++i) {
                        if (typeof object.requirements[i] !== "object")
                            throw TypeError(".vco.schemas.SubscriptionManifest.requirements: object expected");
                        message.requirements[i] = $root.vco.schemas.SubscriptionManifest.Requirement.fromObject(object.requirements[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a SubscriptionManifest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {vco.schemas.SubscriptionManifest} message SubscriptionManifest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SubscriptionManifest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.requirements = [];
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.contentCid = "";
                    else {
                        object.contentCid = [];
                        if (options.bytes !== Array)
                            object.contentCid = $util.newBuffer(object.contentCid);
                    }
                    object.tierName = "";
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.contentCid != null && message.hasOwnProperty("contentCid"))
                    object.contentCid = options.bytes === String ? $util.base64.encode(message.contentCid, 0, message.contentCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.contentCid) : message.contentCid;
                if (message.tierName != null && message.hasOwnProperty("tierName"))
                    object.tierName = message.tierName;
                if (message.requirements && message.requirements.length) {
                    object.requirements = [];
                    for (let j = 0; j < message.requirements.length; ++j)
                        object.requirements[j] = $root.vco.schemas.SubscriptionManifest.Requirement.toObject(message.requirements[j], options);
                }
                return object;
            };

            /**
             * Converts this SubscriptionManifest to JSON.
             * @function toJSON
             * @memberof vco.schemas.SubscriptionManifest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SubscriptionManifest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for SubscriptionManifest
             * @function getTypeUrl
             * @memberof vco.schemas.SubscriptionManifest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            SubscriptionManifest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.SubscriptionManifest";
            };

            SubscriptionManifest.Requirement = (function() {

                /**
                 * Properties of a Requirement.
                 * @memberof vco.schemas.SubscriptionManifest
                 * @interface IRequirement
                 * @property {number|null} [type] Requirement type
                 * @property {Uint8Array|null} [contractRef] Requirement contractRef
                 * @property {number|null} [zkpCircuitId] Requirement zkpCircuitId
                 */

                /**
                 * Constructs a new Requirement.
                 * @memberof vco.schemas.SubscriptionManifest
                 * @classdesc Represents a Requirement.
                 * @implements IRequirement
                 * @constructor
                 * @param {vco.schemas.SubscriptionManifest.IRequirement=} [properties] Properties to set
                 */
                function Requirement(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Requirement type.
                 * @member {number} type
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @instance
                 */
                Requirement.prototype.type = 0;

                /**
                 * Requirement contractRef.
                 * @member {Uint8Array} contractRef
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @instance
                 */
                Requirement.prototype.contractRef = $util.newBuffer([]);

                /**
                 * Requirement zkpCircuitId.
                 * @member {number} zkpCircuitId
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @instance
                 */
                Requirement.prototype.zkpCircuitId = 0;

                /**
                 * Creates a new Requirement instance using the specified properties.
                 * @function create
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {vco.schemas.SubscriptionManifest.IRequirement=} [properties] Properties to set
                 * @returns {vco.schemas.SubscriptionManifest.Requirement} Requirement instance
                 */
                Requirement.create = function create(properties) {
                    return new Requirement(properties);
                };

                /**
                 * Encodes the specified Requirement message. Does not implicitly {@link vco.schemas.SubscriptionManifest.Requirement.verify|verify} messages.
                 * @function encode
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {vco.schemas.SubscriptionManifest.IRequirement} message Requirement message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Requirement.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.type);
                    if (message.contractRef != null && Object.hasOwnProperty.call(message, "contractRef"))
                        writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.contractRef);
                    if (message.zkpCircuitId != null && Object.hasOwnProperty.call(message, "zkpCircuitId"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.zkpCircuitId);
                    return writer;
                };

                /**
                 * Encodes the specified Requirement message, length delimited. Does not implicitly {@link vco.schemas.SubscriptionManifest.Requirement.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {vco.schemas.SubscriptionManifest.IRequirement} message Requirement message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Requirement.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Requirement message from the specified reader or buffer.
                 * @function decode
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {vco.schemas.SubscriptionManifest.Requirement} Requirement
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Requirement.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.SubscriptionManifest.Requirement();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.type = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.contractRef = reader.bytes();
                                break;
                            }
                        case 3: {
                                message.zkpCircuitId = reader.uint32();
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
                 * Decodes a Requirement message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {vco.schemas.SubscriptionManifest.Requirement} Requirement
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Requirement.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Requirement message.
                 * @function verify
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Requirement.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.type != null && message.hasOwnProperty("type"))
                        if (!$util.isInteger(message.type))
                            return "type: integer expected";
                    if (message.contractRef != null && message.hasOwnProperty("contractRef"))
                        if (!(message.contractRef && typeof message.contractRef.length === "number" || $util.isString(message.contractRef)))
                            return "contractRef: buffer expected";
                    if (message.zkpCircuitId != null && message.hasOwnProperty("zkpCircuitId"))
                        if (!$util.isInteger(message.zkpCircuitId))
                            return "zkpCircuitId: integer expected";
                    return null;
                };

                /**
                 * Creates a Requirement message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {vco.schemas.SubscriptionManifest.Requirement} Requirement
                 */
                Requirement.fromObject = function fromObject(object) {
                    if (object instanceof $root.vco.schemas.SubscriptionManifest.Requirement)
                        return object;
                    let message = new $root.vco.schemas.SubscriptionManifest.Requirement();
                    if (object.type != null)
                        message.type = object.type >>> 0;
                    if (object.contractRef != null)
                        if (typeof object.contractRef === "string")
                            $util.base64.decode(object.contractRef, message.contractRef = $util.newBuffer($util.base64.length(object.contractRef)), 0);
                        else if (object.contractRef.length >= 0)
                            message.contractRef = object.contractRef;
                    if (object.zkpCircuitId != null)
                        message.zkpCircuitId = object.zkpCircuitId >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a Requirement message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {vco.schemas.SubscriptionManifest.Requirement} message Requirement
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Requirement.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.type = 0;
                        if (options.bytes === String)
                            object.contractRef = "";
                        else {
                            object.contractRef = [];
                            if (options.bytes !== Array)
                                object.contractRef = $util.newBuffer(object.contractRef);
                        }
                        object.zkpCircuitId = 0;
                    }
                    if (message.type != null && message.hasOwnProperty("type"))
                        object.type = message.type;
                    if (message.contractRef != null && message.hasOwnProperty("contractRef"))
                        object.contractRef = options.bytes === String ? $util.base64.encode(message.contractRef, 0, message.contractRef.length) : options.bytes === Array ? Array.prototype.slice.call(message.contractRef) : message.contractRef;
                    if (message.zkpCircuitId != null && message.hasOwnProperty("zkpCircuitId"))
                        object.zkpCircuitId = message.zkpCircuitId;
                    return object;
                };

                /**
                 * Converts this Requirement to JSON.
                 * @function toJSON
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Requirement.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Requirement
                 * @function getTypeUrl
                 * @memberof vco.schemas.SubscriptionManifest.Requirement
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Requirement.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/vco.schemas.SubscriptionManifest.Requirement";
                };

                return Requirement;
            })();

            return SubscriptionManifest;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const SubscriptionManifest = vco.schemas.SubscriptionManifest;
