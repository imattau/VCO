/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-social/thread"] || ($protobuf.roots["vco-schemas-social/thread"] = {});

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

        schemas.ThreadEntry = (function() {

            /**
             * Properties of a ThreadEntry.
             * @memberof vco.schemas
             * @interface IThreadEntry
             * @property {Uint8Array|null} [cid] ThreadEntry cid
             * @property {string|null} [schemaUri] ThreadEntry schemaUri
             */

            /**
             * Constructs a new ThreadEntry.
             * @memberof vco.schemas
             * @classdesc Represents a ThreadEntry.
             * @implements IThreadEntry
             * @constructor
             * @param {vco.schemas.IThreadEntry=} [properties] Properties to set
             */
            function ThreadEntry(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ThreadEntry cid.
             * @member {Uint8Array} cid
             * @memberof vco.schemas.ThreadEntry
             * @instance
             */
            ThreadEntry.prototype.cid = $util.newBuffer([]);

            /**
             * ThreadEntry schemaUri.
             * @member {string} schemaUri
             * @memberof vco.schemas.ThreadEntry
             * @instance
             */
            ThreadEntry.prototype.schemaUri = "";

            /**
             * Creates a new ThreadEntry instance using the specified properties.
             * @function create
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {vco.schemas.IThreadEntry=} [properties] Properties to set
             * @returns {vco.schemas.ThreadEntry} ThreadEntry instance
             */
            ThreadEntry.create = function create(properties) {
                return new ThreadEntry(properties);
            };

            /**
             * Encodes the specified ThreadEntry message. Does not implicitly {@link vco.schemas.ThreadEntry.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {vco.schemas.IThreadEntry} message ThreadEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ThreadEntry.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.cid != null && Object.hasOwnProperty.call(message, "cid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.cid);
                if (message.schemaUri != null && Object.hasOwnProperty.call(message, "schemaUri"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.schemaUri);
                return writer;
            };

            /**
             * Encodes the specified ThreadEntry message, length delimited. Does not implicitly {@link vco.schemas.ThreadEntry.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {vco.schemas.IThreadEntry} message ThreadEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ThreadEntry.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ThreadEntry message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.ThreadEntry} ThreadEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ThreadEntry.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.ThreadEntry();
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
                            message.schemaUri = reader.string();
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
             * Decodes a ThreadEntry message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.ThreadEntry} ThreadEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ThreadEntry.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ThreadEntry message.
             * @function verify
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ThreadEntry.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.cid != null && message.hasOwnProperty("cid"))
                    if (!(message.cid && typeof message.cid.length === "number" || $util.isString(message.cid)))
                        return "cid: buffer expected";
                if (message.schemaUri != null && message.hasOwnProperty("schemaUri"))
                    if (!$util.isString(message.schemaUri))
                        return "schemaUri: string expected";
                return null;
            };

            /**
             * Creates a ThreadEntry message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.ThreadEntry} ThreadEntry
             */
            ThreadEntry.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.ThreadEntry)
                    return object;
                let message = new $root.vco.schemas.ThreadEntry();
                if (object.cid != null)
                    if (typeof object.cid === "string")
                        $util.base64.decode(object.cid, message.cid = $util.newBuffer($util.base64.length(object.cid)), 0);
                    else if (object.cid.length >= 0)
                        message.cid = object.cid;
                if (object.schemaUri != null)
                    message.schemaUri = String(object.schemaUri);
                return message;
            };

            /**
             * Creates a plain object from a ThreadEntry message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {vco.schemas.ThreadEntry} message ThreadEntry
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ThreadEntry.toObject = function toObject(message, options) {
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
                    object.schemaUri = "";
                }
                if (message.cid != null && message.hasOwnProperty("cid"))
                    object.cid = options.bytes === String ? $util.base64.encode(message.cid, 0, message.cid.length) : options.bytes === Array ? Array.prototype.slice.call(message.cid) : message.cid;
                if (message.schemaUri != null && message.hasOwnProperty("schemaUri"))
                    object.schemaUri = message.schemaUri;
                return object;
            };

            /**
             * Converts this ThreadEntry to JSON.
             * @function toJSON
             * @memberof vco.schemas.ThreadEntry
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ThreadEntry.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ThreadEntry
             * @function getTypeUrl
             * @memberof vco.schemas.ThreadEntry
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ThreadEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.ThreadEntry";
            };

            return ThreadEntry;
        })();

        schemas.Thread = (function() {

            /**
             * Properties of a Thread.
             * @memberof vco.schemas
             * @interface IThread
             * @property {string|null} [schema] Thread schema
             * @property {string|null} [title] Thread title
             * @property {Array.<vco.schemas.IThreadEntry>|null} [entries] Thread entries
             * @property {number|Long|null} [timestampMs] Thread timestampMs
             */

            /**
             * Constructs a new Thread.
             * @memberof vco.schemas
             * @classdesc Represents a Thread.
             * @implements IThread
             * @constructor
             * @param {vco.schemas.IThread=} [properties] Properties to set
             */
            function Thread(properties) {
                this.entries = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Thread schema.
             * @member {string} schema
             * @memberof vco.schemas.Thread
             * @instance
             */
            Thread.prototype.schema = "";

            /**
             * Thread title.
             * @member {string} title
             * @memberof vco.schemas.Thread
             * @instance
             */
            Thread.prototype.title = "";

            /**
             * Thread entries.
             * @member {Array.<vco.schemas.IThreadEntry>} entries
             * @memberof vco.schemas.Thread
             * @instance
             */
            Thread.prototype.entries = $util.emptyArray;

            /**
             * Thread timestampMs.
             * @member {number|Long} timestampMs
             * @memberof vco.schemas.Thread
             * @instance
             */
            Thread.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Thread instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Thread
             * @static
             * @param {vco.schemas.IThread=} [properties] Properties to set
             * @returns {vco.schemas.Thread} Thread instance
             */
            Thread.create = function create(properties) {
                return new Thread(properties);
            };

            /**
             * Encodes the specified Thread message. Does not implicitly {@link vco.schemas.Thread.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Thread
             * @static
             * @param {vco.schemas.IThread} message Thread message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Thread.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.entries != null && message.entries.length)
                    for (let i = 0; i < message.entries.length; ++i)
                        $root.vco.schemas.ThreadEntry.encode(message.entries[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.timestampMs);
                return writer;
            };

            /**
             * Encodes the specified Thread message, length delimited. Does not implicitly {@link vco.schemas.Thread.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Thread
             * @static
             * @param {vco.schemas.IThread} message Thread message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Thread.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Thread message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Thread
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Thread} Thread
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Thread.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Thread();
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
                            message.title = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.entries && message.entries.length))
                                message.entries = [];
                            message.entries.push($root.vco.schemas.ThreadEntry.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            message.timestampMs = reader.int64();
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
             * Decodes a Thread message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Thread
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Thread} Thread
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Thread.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Thread message.
             * @function verify
             * @memberof vco.schemas.Thread
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Thread.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.entries != null && message.hasOwnProperty("entries")) {
                    if (!Array.isArray(message.entries))
                        return "entries: array expected";
                    for (let i = 0; i < message.entries.length; ++i) {
                        let error = $root.vco.schemas.ThreadEntry.verify(message.entries[i]);
                        if (error)
                            return "entries." + error;
                    }
                }
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };

            /**
             * Creates a Thread message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Thread
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Thread} Thread
             */
            Thread.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Thread)
                    return object;
                let message = new $root.vco.schemas.Thread();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.entries) {
                    if (!Array.isArray(object.entries))
                        throw TypeError(".vco.schemas.Thread.entries: array expected");
                    message.entries = [];
                    for (let i = 0; i < object.entries.length; ++i) {
                        if (typeof object.entries[i] !== "object")
                            throw TypeError(".vco.schemas.Thread.entries: object expected");
                        message.entries[i] = $root.vco.schemas.ThreadEntry.fromObject(object.entries[i]);
                    }
                }
                if (object.timestampMs != null)
                    if ($util.Long)
                        (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = false;
                    else if (typeof object.timestampMs === "string")
                        message.timestampMs = parseInt(object.timestampMs, 10);
                    else if (typeof object.timestampMs === "number")
                        message.timestampMs = object.timestampMs;
                    else if (typeof object.timestampMs === "object")
                        message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Thread message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Thread
             * @static
             * @param {vco.schemas.Thread} message Thread
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Thread.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.entries = [];
                if (options.defaults) {
                    object.schema = "";
                    object.title = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.entries && message.entries.length) {
                    object.entries = [];
                    for (let j = 0; j < message.entries.length; ++j)
                        object.entries[j] = $root.vco.schemas.ThreadEntry.toObject(message.entries[j], options);
                }
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };

            /**
             * Converts this Thread to JSON.
             * @function toJSON
             * @memberof vco.schemas.Thread
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Thread.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Thread
             * @function getTypeUrl
             * @memberof vco.schemas.Thread
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Thread.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Thread";
            };

            return Thread;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const ThreadEntry = vco.schemas.ThreadEntry;
export const Thread = vco.schemas.Thread;
