/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-index"] || ($protobuf.roots["vco-schemas-index"] = {});

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

        schemas.KeywordIndex = (function() {

            /**
             * Properties of a KeywordIndex.
             * @memberof vco.schemas
             * @interface IKeywordIndex
             * @property {string|null} [schema] KeywordIndex schema
             * @property {string|null} [keyword] KeywordIndex keyword
             * @property {Array.<vco.schemas.KeywordIndex.IEntry>|null} [entries] KeywordIndex entries
             * @property {Uint8Array|null} [nextPageCid] KeywordIndex nextPageCid
             */

            /**
             * Constructs a new KeywordIndex.
             * @memberof vco.schemas
             * @classdesc Represents a KeywordIndex.
             * @implements IKeywordIndex
             * @constructor
             * @param {vco.schemas.IKeywordIndex=} [properties] Properties to set
             */
            function KeywordIndex(properties) {
                this.entries = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KeywordIndex schema.
             * @member {string} schema
             * @memberof vco.schemas.KeywordIndex
             * @instance
             */
            KeywordIndex.prototype.schema = "";

            /**
             * KeywordIndex keyword.
             * @member {string} keyword
             * @memberof vco.schemas.KeywordIndex
             * @instance
             */
            KeywordIndex.prototype.keyword = "";

            /**
             * KeywordIndex entries.
             * @member {Array.<vco.schemas.KeywordIndex.IEntry>} entries
             * @memberof vco.schemas.KeywordIndex
             * @instance
             */
            KeywordIndex.prototype.entries = $util.emptyArray;

            /**
             * KeywordIndex nextPageCid.
             * @member {Uint8Array} nextPageCid
             * @memberof vco.schemas.KeywordIndex
             * @instance
             */
            KeywordIndex.prototype.nextPageCid = $util.newBuffer([]);

            /**
             * Creates a new KeywordIndex instance using the specified properties.
             * @function create
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {vco.schemas.IKeywordIndex=} [properties] Properties to set
             * @returns {vco.schemas.KeywordIndex} KeywordIndex instance
             */
            KeywordIndex.create = function create(properties) {
                return new KeywordIndex(properties);
            };

            /**
             * Encodes the specified KeywordIndex message. Does not implicitly {@link vco.schemas.KeywordIndex.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {vco.schemas.IKeywordIndex} message KeywordIndex message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeywordIndex.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.keyword != null && Object.hasOwnProperty.call(message, "keyword"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.keyword);
                if (message.entries != null && message.entries.length)
                    for (let i = 0; i < message.entries.length; ++i)
                        $root.vco.schemas.KeywordIndex.Entry.encode(message.entries[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.nextPageCid != null && Object.hasOwnProperty.call(message, "nextPageCid"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.nextPageCid);
                return writer;
            };

            /**
             * Encodes the specified KeywordIndex message, length delimited. Does not implicitly {@link vco.schemas.KeywordIndex.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {vco.schemas.IKeywordIndex} message KeywordIndex message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeywordIndex.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KeywordIndex message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.KeywordIndex} KeywordIndex
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeywordIndex.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.KeywordIndex();
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
                            message.keyword = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.entries && message.entries.length))
                                message.entries = [];
                            message.entries.push($root.vco.schemas.KeywordIndex.Entry.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            message.nextPageCid = reader.bytes();
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
             * Decodes a KeywordIndex message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.KeywordIndex} KeywordIndex
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeywordIndex.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KeywordIndex message.
             * @function verify
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KeywordIndex.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.keyword != null && message.hasOwnProperty("keyword"))
                    if (!$util.isString(message.keyword))
                        return "keyword: string expected";
                if (message.entries != null && message.hasOwnProperty("entries")) {
                    if (!Array.isArray(message.entries))
                        return "entries: array expected";
                    for (let i = 0; i < message.entries.length; ++i) {
                        let error = $root.vco.schemas.KeywordIndex.Entry.verify(message.entries[i]);
                        if (error)
                            return "entries." + error;
                    }
                }
                if (message.nextPageCid != null && message.hasOwnProperty("nextPageCid"))
                    if (!(message.nextPageCid && typeof message.nextPageCid.length === "number" || $util.isString(message.nextPageCid)))
                        return "nextPageCid: buffer expected";
                return null;
            };

            /**
             * Creates a KeywordIndex message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.KeywordIndex} KeywordIndex
             */
            KeywordIndex.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.KeywordIndex)
                    return object;
                let message = new $root.vco.schemas.KeywordIndex();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.keyword != null)
                    message.keyword = String(object.keyword);
                if (object.entries) {
                    if (!Array.isArray(object.entries))
                        throw TypeError(".vco.schemas.KeywordIndex.entries: array expected");
                    message.entries = [];
                    for (let i = 0; i < object.entries.length; ++i) {
                        if (typeof object.entries[i] !== "object")
                            throw TypeError(".vco.schemas.KeywordIndex.entries: object expected");
                        message.entries[i] = $root.vco.schemas.KeywordIndex.Entry.fromObject(object.entries[i]);
                    }
                }
                if (object.nextPageCid != null)
                    if (typeof object.nextPageCid === "string")
                        $util.base64.decode(object.nextPageCid, message.nextPageCid = $util.newBuffer($util.base64.length(object.nextPageCid)), 0);
                    else if (object.nextPageCid.length >= 0)
                        message.nextPageCid = object.nextPageCid;
                return message;
            };

            /**
             * Creates a plain object from a KeywordIndex message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {vco.schemas.KeywordIndex} message KeywordIndex
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KeywordIndex.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.entries = [];
                if (options.defaults) {
                    object.schema = "";
                    object.keyword = "";
                    if (options.bytes === String)
                        object.nextPageCid = "";
                    else {
                        object.nextPageCid = [];
                        if (options.bytes !== Array)
                            object.nextPageCid = $util.newBuffer(object.nextPageCid);
                    }
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.keyword != null && message.hasOwnProperty("keyword"))
                    object.keyword = message.keyword;
                if (message.entries && message.entries.length) {
                    object.entries = [];
                    for (let j = 0; j < message.entries.length; ++j)
                        object.entries[j] = $root.vco.schemas.KeywordIndex.Entry.toObject(message.entries[j], options);
                }
                if (message.nextPageCid != null && message.hasOwnProperty("nextPageCid"))
                    object.nextPageCid = options.bytes === String ? $util.base64.encode(message.nextPageCid, 0, message.nextPageCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.nextPageCid) : message.nextPageCid;
                return object;
            };

            /**
             * Converts this KeywordIndex to JSON.
             * @function toJSON
             * @memberof vco.schemas.KeywordIndex
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KeywordIndex.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KeywordIndex
             * @function getTypeUrl
             * @memberof vco.schemas.KeywordIndex
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KeywordIndex.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.KeywordIndex";
            };

            KeywordIndex.Entry = (function() {

                /**
                 * Properties of an Entry.
                 * @memberof vco.schemas.KeywordIndex
                 * @interface IEntry
                 * @property {Uint8Array|null} [cid] Entry cid
                 * @property {number|null} [weight] Entry weight
                 * @property {number|Long|null} [indexedAtMs] Entry indexedAtMs
                 */

                /**
                 * Constructs a new Entry.
                 * @memberof vco.schemas.KeywordIndex
                 * @classdesc Represents an Entry.
                 * @implements IEntry
                 * @constructor
                 * @param {vco.schemas.KeywordIndex.IEntry=} [properties] Properties to set
                 */
                function Entry(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Entry cid.
                 * @member {Uint8Array} cid
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @instance
                 */
                Entry.prototype.cid = $util.newBuffer([]);

                /**
                 * Entry weight.
                 * @member {number} weight
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @instance
                 */
                Entry.prototype.weight = 0;

                /**
                 * Entry indexedAtMs.
                 * @member {number|Long} indexedAtMs
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @instance
                 */
                Entry.prototype.indexedAtMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Creates a new Entry instance using the specified properties.
                 * @function create
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {vco.schemas.KeywordIndex.IEntry=} [properties] Properties to set
                 * @returns {vco.schemas.KeywordIndex.Entry} Entry instance
                 */
                Entry.create = function create(properties) {
                    return new Entry(properties);
                };

                /**
                 * Encodes the specified Entry message. Does not implicitly {@link vco.schemas.KeywordIndex.Entry.verify|verify} messages.
                 * @function encode
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {vco.schemas.KeywordIndex.IEntry} message Entry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Entry.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.cid != null && Object.hasOwnProperty.call(message, "cid"))
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.cid);
                    if (message.weight != null && Object.hasOwnProperty.call(message, "weight"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.weight);
                    if (message.indexedAtMs != null && Object.hasOwnProperty.call(message, "indexedAtMs"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int64(message.indexedAtMs);
                    return writer;
                };

                /**
                 * Encodes the specified Entry message, length delimited. Does not implicitly {@link vco.schemas.KeywordIndex.Entry.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {vco.schemas.KeywordIndex.IEntry} message Entry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Entry.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Entry message from the specified reader or buffer.
                 * @function decode
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {vco.schemas.KeywordIndex.Entry} Entry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Entry.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.KeywordIndex.Entry();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.cid = reader.bytes();
                                break;
                            }
                        case 2: {
                                message.weight = reader.uint32();
                                break;
                            }
                        case 3: {
                                message.indexedAtMs = reader.int64();
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
                 * Decodes an Entry message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {vco.schemas.KeywordIndex.Entry} Entry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Entry.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Entry message.
                 * @function verify
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Entry.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.cid != null && message.hasOwnProperty("cid"))
                        if (!(message.cid && typeof message.cid.length === "number" || $util.isString(message.cid)))
                            return "cid: buffer expected";
                    if (message.weight != null && message.hasOwnProperty("weight"))
                        if (!$util.isInteger(message.weight))
                            return "weight: integer expected";
                    if (message.indexedAtMs != null && message.hasOwnProperty("indexedAtMs"))
                        if (!$util.isInteger(message.indexedAtMs) && !(message.indexedAtMs && $util.isInteger(message.indexedAtMs.low) && $util.isInteger(message.indexedAtMs.high)))
                            return "indexedAtMs: integer|Long expected";
                    return null;
                };

                /**
                 * Creates an Entry message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {vco.schemas.KeywordIndex.Entry} Entry
                 */
                Entry.fromObject = function fromObject(object) {
                    if (object instanceof $root.vco.schemas.KeywordIndex.Entry)
                        return object;
                    let message = new $root.vco.schemas.KeywordIndex.Entry();
                    if (object.cid != null)
                        if (typeof object.cid === "string")
                            $util.base64.decode(object.cid, message.cid = $util.newBuffer($util.base64.length(object.cid)), 0);
                        else if (object.cid.length >= 0)
                            message.cid = object.cid;
                    if (object.weight != null)
                        message.weight = object.weight >>> 0;
                    if (object.indexedAtMs != null)
                        if ($util.Long)
                            (message.indexedAtMs = $util.Long.fromValue(object.indexedAtMs)).unsigned = false;
                        else if (typeof object.indexedAtMs === "string")
                            message.indexedAtMs = parseInt(object.indexedAtMs, 10);
                        else if (typeof object.indexedAtMs === "number")
                            message.indexedAtMs = object.indexedAtMs;
                        else if (typeof object.indexedAtMs === "object")
                            message.indexedAtMs = new $util.LongBits(object.indexedAtMs.low >>> 0, object.indexedAtMs.high >>> 0).toNumber();
                    return message;
                };

                /**
                 * Creates a plain object from an Entry message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {vco.schemas.KeywordIndex.Entry} message Entry
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Entry.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        if (options.bytes === String)
                            object.cid = "";
                        else {
                            object.cid = [];
                            if (options.bytes !== Array)
                                object.cid = $util.newBuffer(object.cid);
                        }
                        object.weight = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.indexedAtMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.indexedAtMs = options.longs === String ? "0" : 0;
                    }
                    if (message.cid != null && message.hasOwnProperty("cid"))
                        object.cid = options.bytes === String ? $util.base64.encode(message.cid, 0, message.cid.length) : options.bytes === Array ? Array.prototype.slice.call(message.cid) : message.cid;
                    if (message.weight != null && message.hasOwnProperty("weight"))
                        object.weight = message.weight;
                    if (message.indexedAtMs != null && message.hasOwnProperty("indexedAtMs"))
                        if (typeof message.indexedAtMs === "number")
                            object.indexedAtMs = options.longs === String ? String(message.indexedAtMs) : message.indexedAtMs;
                        else
                            object.indexedAtMs = options.longs === String ? $util.Long.prototype.toString.call(message.indexedAtMs) : options.longs === Number ? new $util.LongBits(message.indexedAtMs.low >>> 0, message.indexedAtMs.high >>> 0).toNumber() : message.indexedAtMs;
                    return object;
                };

                /**
                 * Converts this Entry to JSON.
                 * @function toJSON
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Entry.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Entry
                 * @function getTypeUrl
                 * @memberof vco.schemas.KeywordIndex.Entry
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Entry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/vco.schemas.KeywordIndex.Entry";
                };

                return Entry;
            })();

            return KeywordIndex;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const KeywordIndex = vco.schemas.KeywordIndex;
