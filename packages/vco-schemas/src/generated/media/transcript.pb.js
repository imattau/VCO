/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-media/transcript"] || ($protobuf.roots["vco-schemas-media/transcript"] = {});

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

        schemas.TranscriptEntry = (function() {

            /**
             * Properties of a TranscriptEntry.
             * @memberof vco.schemas
             * @interface ITranscriptEntry
             * @property {number|Long|null} [startMs] TranscriptEntry startMs
             * @property {number|Long|null} [endMs] TranscriptEntry endMs
             * @property {string|null} [text] TranscriptEntry text
             * @property {string|null} [speaker] TranscriptEntry speaker
             */

            /**
             * Constructs a new TranscriptEntry.
             * @memberof vco.schemas
             * @classdesc Represents a TranscriptEntry.
             * @implements ITranscriptEntry
             * @constructor
             * @param {vco.schemas.ITranscriptEntry=} [properties] Properties to set
             */
            function TranscriptEntry(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TranscriptEntry startMs.
             * @member {number|Long} startMs
             * @memberof vco.schemas.TranscriptEntry
             * @instance
             */
            TranscriptEntry.prototype.startMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * TranscriptEntry endMs.
             * @member {number|Long} endMs
             * @memberof vco.schemas.TranscriptEntry
             * @instance
             */
            TranscriptEntry.prototype.endMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * TranscriptEntry text.
             * @member {string} text
             * @memberof vco.schemas.TranscriptEntry
             * @instance
             */
            TranscriptEntry.prototype.text = "";

            /**
             * TranscriptEntry speaker.
             * @member {string} speaker
             * @memberof vco.schemas.TranscriptEntry
             * @instance
             */
            TranscriptEntry.prototype.speaker = "";

            /**
             * Creates a new TranscriptEntry instance using the specified properties.
             * @function create
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {vco.schemas.ITranscriptEntry=} [properties] Properties to set
             * @returns {vco.schemas.TranscriptEntry} TranscriptEntry instance
             */
            TranscriptEntry.create = function create(properties) {
                return new TranscriptEntry(properties);
            };

            /**
             * Encodes the specified TranscriptEntry message. Does not implicitly {@link vco.schemas.TranscriptEntry.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {vco.schemas.ITranscriptEntry} message TranscriptEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TranscriptEntry.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.startMs != null && Object.hasOwnProperty.call(message, "startMs"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.startMs);
                if (message.endMs != null && Object.hasOwnProperty.call(message, "endMs"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.endMs);
                if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.text);
                if (message.speaker != null && Object.hasOwnProperty.call(message, "speaker"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.speaker);
                return writer;
            };

            /**
             * Encodes the specified TranscriptEntry message, length delimited. Does not implicitly {@link vco.schemas.TranscriptEntry.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {vco.schemas.ITranscriptEntry} message TranscriptEntry message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TranscriptEntry.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TranscriptEntry message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.TranscriptEntry} TranscriptEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TranscriptEntry.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.TranscriptEntry();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.startMs = reader.uint64();
                            break;
                        }
                    case 2: {
                            message.endMs = reader.uint64();
                            break;
                        }
                    case 3: {
                            message.text = reader.string();
                            break;
                        }
                    case 4: {
                            message.speaker = reader.string();
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
             * Decodes a TranscriptEntry message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.TranscriptEntry} TranscriptEntry
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TranscriptEntry.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TranscriptEntry message.
             * @function verify
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TranscriptEntry.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.startMs != null && message.hasOwnProperty("startMs"))
                    if (!$util.isInteger(message.startMs) && !(message.startMs && $util.isInteger(message.startMs.low) && $util.isInteger(message.startMs.high)))
                        return "startMs: integer|Long expected";
                if (message.endMs != null && message.hasOwnProperty("endMs"))
                    if (!$util.isInteger(message.endMs) && !(message.endMs && $util.isInteger(message.endMs.low) && $util.isInteger(message.endMs.high)))
                        return "endMs: integer|Long expected";
                if (message.text != null && message.hasOwnProperty("text"))
                    if (!$util.isString(message.text))
                        return "text: string expected";
                if (message.speaker != null && message.hasOwnProperty("speaker"))
                    if (!$util.isString(message.speaker))
                        return "speaker: string expected";
                return null;
            };

            /**
             * Creates a TranscriptEntry message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.TranscriptEntry} TranscriptEntry
             */
            TranscriptEntry.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.TranscriptEntry)
                    return object;
                let message = new $root.vco.schemas.TranscriptEntry();
                if (object.startMs != null)
                    if ($util.Long)
                        (message.startMs = $util.Long.fromValue(object.startMs)).unsigned = true;
                    else if (typeof object.startMs === "string")
                        message.startMs = parseInt(object.startMs, 10);
                    else if (typeof object.startMs === "number")
                        message.startMs = object.startMs;
                    else if (typeof object.startMs === "object")
                        message.startMs = new $util.LongBits(object.startMs.low >>> 0, object.startMs.high >>> 0).toNumber(true);
                if (object.endMs != null)
                    if ($util.Long)
                        (message.endMs = $util.Long.fromValue(object.endMs)).unsigned = true;
                    else if (typeof object.endMs === "string")
                        message.endMs = parseInt(object.endMs, 10);
                    else if (typeof object.endMs === "number")
                        message.endMs = object.endMs;
                    else if (typeof object.endMs === "object")
                        message.endMs = new $util.LongBits(object.endMs.low >>> 0, object.endMs.high >>> 0).toNumber(true);
                if (object.text != null)
                    message.text = String(object.text);
                if (object.speaker != null)
                    message.speaker = String(object.speaker);
                return message;
            };

            /**
             * Creates a plain object from a TranscriptEntry message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {vco.schemas.TranscriptEntry} message TranscriptEntry
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TranscriptEntry.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.startMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.startMs = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.endMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.endMs = options.longs === String ? "0" : 0;
                    object.text = "";
                    object.speaker = "";
                }
                if (message.startMs != null && message.hasOwnProperty("startMs"))
                    if (typeof message.startMs === "number")
                        object.startMs = options.longs === String ? String(message.startMs) : message.startMs;
                    else
                        object.startMs = options.longs === String ? $util.Long.prototype.toString.call(message.startMs) : options.longs === Number ? new $util.LongBits(message.startMs.low >>> 0, message.startMs.high >>> 0).toNumber(true) : message.startMs;
                if (message.endMs != null && message.hasOwnProperty("endMs"))
                    if (typeof message.endMs === "number")
                        object.endMs = options.longs === String ? String(message.endMs) : message.endMs;
                    else
                        object.endMs = options.longs === String ? $util.Long.prototype.toString.call(message.endMs) : options.longs === Number ? new $util.LongBits(message.endMs.low >>> 0, message.endMs.high >>> 0).toNumber(true) : message.endMs;
                if (message.text != null && message.hasOwnProperty("text"))
                    object.text = message.text;
                if (message.speaker != null && message.hasOwnProperty("speaker"))
                    object.speaker = message.speaker;
                return object;
            };

            /**
             * Converts this TranscriptEntry to JSON.
             * @function toJSON
             * @memberof vco.schemas.TranscriptEntry
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TranscriptEntry.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TranscriptEntry
             * @function getTypeUrl
             * @memberof vco.schemas.TranscriptEntry
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TranscriptEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.TranscriptEntry";
            };

            return TranscriptEntry;
        })();

        schemas.Transcript = (function() {

            /**
             * Properties of a Transcript.
             * @memberof vco.schemas
             * @interface ITranscript
             * @property {string|null} [schema] Transcript schema
             * @property {Uint8Array|null} [mediaManifestCid] Transcript mediaManifestCid
             * @property {Array.<vco.schemas.ITranscriptEntry>|null} [entries] Transcript entries
             * @property {string|null} [language] Transcript language
             */

            /**
             * Constructs a new Transcript.
             * @memberof vco.schemas
             * @classdesc Represents a Transcript.
             * @implements ITranscript
             * @constructor
             * @param {vco.schemas.ITranscript=} [properties] Properties to set
             */
            function Transcript(properties) {
                this.entries = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Transcript schema.
             * @member {string} schema
             * @memberof vco.schemas.Transcript
             * @instance
             */
            Transcript.prototype.schema = "";

            /**
             * Transcript mediaManifestCid.
             * @member {Uint8Array} mediaManifestCid
             * @memberof vco.schemas.Transcript
             * @instance
             */
            Transcript.prototype.mediaManifestCid = $util.newBuffer([]);

            /**
             * Transcript entries.
             * @member {Array.<vco.schemas.ITranscriptEntry>} entries
             * @memberof vco.schemas.Transcript
             * @instance
             */
            Transcript.prototype.entries = $util.emptyArray;

            /**
             * Transcript language.
             * @member {string} language
             * @memberof vco.schemas.Transcript
             * @instance
             */
            Transcript.prototype.language = "";

            /**
             * Creates a new Transcript instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Transcript
             * @static
             * @param {vco.schemas.ITranscript=} [properties] Properties to set
             * @returns {vco.schemas.Transcript} Transcript instance
             */
            Transcript.create = function create(properties) {
                return new Transcript(properties);
            };

            /**
             * Encodes the specified Transcript message. Does not implicitly {@link vco.schemas.Transcript.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Transcript
             * @static
             * @param {vco.schemas.ITranscript} message Transcript message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Transcript.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.mediaManifestCid != null && Object.hasOwnProperty.call(message, "mediaManifestCid"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.mediaManifestCid);
                if (message.entries != null && message.entries.length)
                    for (let i = 0; i < message.entries.length; ++i)
                        $root.vco.schemas.TranscriptEntry.encode(message.entries[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.language);
                return writer;
            };

            /**
             * Encodes the specified Transcript message, length delimited. Does not implicitly {@link vco.schemas.Transcript.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Transcript
             * @static
             * @param {vco.schemas.ITranscript} message Transcript message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Transcript.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Transcript message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Transcript
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Transcript} Transcript
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Transcript.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Transcript();
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
                            message.mediaManifestCid = reader.bytes();
                            break;
                        }
                    case 3: {
                            if (!(message.entries && message.entries.length))
                                message.entries = [];
                            message.entries.push($root.vco.schemas.TranscriptEntry.decode(reader, reader.uint32()));
                            break;
                        }
                    case 4: {
                            message.language = reader.string();
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
             * Decodes a Transcript message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Transcript
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Transcript} Transcript
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Transcript.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Transcript message.
             * @function verify
             * @memberof vco.schemas.Transcript
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Transcript.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.mediaManifestCid != null && message.hasOwnProperty("mediaManifestCid"))
                    if (!(message.mediaManifestCid && typeof message.mediaManifestCid.length === "number" || $util.isString(message.mediaManifestCid)))
                        return "mediaManifestCid: buffer expected";
                if (message.entries != null && message.hasOwnProperty("entries")) {
                    if (!Array.isArray(message.entries))
                        return "entries: array expected";
                    for (let i = 0; i < message.entries.length; ++i) {
                        let error = $root.vco.schemas.TranscriptEntry.verify(message.entries[i]);
                        if (error)
                            return "entries." + error;
                    }
                }
                if (message.language != null && message.hasOwnProperty("language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                return null;
            };

            /**
             * Creates a Transcript message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Transcript
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Transcript} Transcript
             */
            Transcript.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Transcript)
                    return object;
                let message = new $root.vco.schemas.Transcript();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.mediaManifestCid != null)
                    if (typeof object.mediaManifestCid === "string")
                        $util.base64.decode(object.mediaManifestCid, message.mediaManifestCid = $util.newBuffer($util.base64.length(object.mediaManifestCid)), 0);
                    else if (object.mediaManifestCid.length >= 0)
                        message.mediaManifestCid = object.mediaManifestCid;
                if (object.entries) {
                    if (!Array.isArray(object.entries))
                        throw TypeError(".vco.schemas.Transcript.entries: array expected");
                    message.entries = [];
                    for (let i = 0; i < object.entries.length; ++i) {
                        if (typeof object.entries[i] !== "object")
                            throw TypeError(".vco.schemas.Transcript.entries: object expected");
                        message.entries[i] = $root.vco.schemas.TranscriptEntry.fromObject(object.entries[i]);
                    }
                }
                if (object.language != null)
                    message.language = String(object.language);
                return message;
            };

            /**
             * Creates a plain object from a Transcript message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Transcript
             * @static
             * @param {vco.schemas.Transcript} message Transcript
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Transcript.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.entries = [];
                if (options.defaults) {
                    object.schema = "";
                    if (options.bytes === String)
                        object.mediaManifestCid = "";
                    else {
                        object.mediaManifestCid = [];
                        if (options.bytes !== Array)
                            object.mediaManifestCid = $util.newBuffer(object.mediaManifestCid);
                    }
                    object.language = "";
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.mediaManifestCid != null && message.hasOwnProperty("mediaManifestCid"))
                    object.mediaManifestCid = options.bytes === String ? $util.base64.encode(message.mediaManifestCid, 0, message.mediaManifestCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.mediaManifestCid) : message.mediaManifestCid;
                if (message.entries && message.entries.length) {
                    object.entries = [];
                    for (let j = 0; j < message.entries.length; ++j)
                        object.entries[j] = $root.vco.schemas.TranscriptEntry.toObject(message.entries[j], options);
                }
                if (message.language != null && message.hasOwnProperty("language"))
                    object.language = message.language;
                return object;
            };

            /**
             * Converts this Transcript to JSON.
             * @function toJSON
             * @memberof vco.schemas.Transcript
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Transcript.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Transcript
             * @function getTypeUrl
             * @memberof vco.schemas.Transcript
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Transcript.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Transcript";
            };

            return Transcript;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const TranscriptEntry = vco.schemas.TranscriptEntry;
export const Transcript = vco.schemas.Transcript;
