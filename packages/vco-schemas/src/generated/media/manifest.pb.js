/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["vco-schemas-media/manifest"] || ($protobuf.roots["vco-schemas-media/manifest"] = {});

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

        schemas.MediaManifest = (function() {

            /**
             * Properties of a MediaManifest.
             * @memberof vco.schemas
             * @interface IMediaManifest
             * @property {string|null} [schema] MediaManifest schema
             * @property {string|null} [title] MediaManifest title
             * @property {string|null} [summary] MediaManifest summary
             * @property {string|null} [showNotes] MediaManifest showNotes
             * @property {Uint8Array|null} [contentCid] MediaManifest contentCid
             * @property {Uint8Array|null} [thumbnailCid] MediaManifest thumbnailCid
             * @property {Uint8Array|null} [transcriptCid] MediaManifest transcriptCid
             * @property {number|Long|null} [durationMs] MediaManifest durationMs
             * @property {number|Long|null} [publishedAtMs] MediaManifest publishedAtMs
             * @property {Uint8Array|null} [previousItemCid] MediaManifest previousItemCid
             * @property {string|null} [contentType] MediaManifest contentType
             */

            /**
             * Constructs a new MediaManifest.
             * @memberof vco.schemas
             * @classdesc Represents a MediaManifest.
             * @implements IMediaManifest
             * @constructor
             * @param {vco.schemas.IMediaManifest=} [properties] Properties to set
             */
            function MediaManifest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * MediaManifest schema.
             * @member {string} schema
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.schema = "";

            /**
             * MediaManifest title.
             * @member {string} title
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.title = "";

            /**
             * MediaManifest summary.
             * @member {string} summary
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.summary = "";

            /**
             * MediaManifest showNotes.
             * @member {string} showNotes
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.showNotes = "";

            /**
             * MediaManifest contentCid.
             * @member {Uint8Array} contentCid
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.contentCid = $util.newBuffer([]);

            /**
             * MediaManifest thumbnailCid.
             * @member {Uint8Array} thumbnailCid
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.thumbnailCid = $util.newBuffer([]);

            /**
             * MediaManifest transcriptCid.
             * @member {Uint8Array} transcriptCid
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.transcriptCid = $util.newBuffer([]);

            /**
             * MediaManifest durationMs.
             * @member {number|Long} durationMs
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.durationMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * MediaManifest publishedAtMs.
             * @member {number|Long} publishedAtMs
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.publishedAtMs = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * MediaManifest previousItemCid.
             * @member {Uint8Array} previousItemCid
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.previousItemCid = $util.newBuffer([]);

            /**
             * MediaManifest contentType.
             * @member {string} contentType
             * @memberof vco.schemas.MediaManifest
             * @instance
             */
            MediaManifest.prototype.contentType = "";

            /**
             * Creates a new MediaManifest instance using the specified properties.
             * @function create
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {vco.schemas.IMediaManifest=} [properties] Properties to set
             * @returns {vco.schemas.MediaManifest} MediaManifest instance
             */
            MediaManifest.create = function create(properties) {
                return new MediaManifest(properties);
            };

            /**
             * Encodes the specified MediaManifest message. Does not implicitly {@link vco.schemas.MediaManifest.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {vco.schemas.IMediaManifest} message MediaManifest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MediaManifest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
                if (message.summary != null && Object.hasOwnProperty.call(message, "summary"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.summary);
                if (message.showNotes != null && Object.hasOwnProperty.call(message, "showNotes"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.showNotes);
                if (message.contentCid != null && Object.hasOwnProperty.call(message, "contentCid"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.contentCid);
                if (message.thumbnailCid != null && Object.hasOwnProperty.call(message, "thumbnailCid"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.thumbnailCid);
                if (message.transcriptCid != null && Object.hasOwnProperty.call(message, "transcriptCid"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.transcriptCid);
                if (message.durationMs != null && Object.hasOwnProperty.call(message, "durationMs"))
                    writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.durationMs);
                if (message.publishedAtMs != null && Object.hasOwnProperty.call(message, "publishedAtMs"))
                    writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.publishedAtMs);
                if (message.previousItemCid != null && Object.hasOwnProperty.call(message, "previousItemCid"))
                    writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.previousItemCid);
                if (message.contentType != null && Object.hasOwnProperty.call(message, "contentType"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.contentType);
                return writer;
            };

            /**
             * Encodes the specified MediaManifest message, length delimited. Does not implicitly {@link vco.schemas.MediaManifest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {vco.schemas.IMediaManifest} message MediaManifest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MediaManifest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MediaManifest message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.MediaManifest} MediaManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MediaManifest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.MediaManifest();
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
                            message.summary = reader.string();
                            break;
                        }
                    case 4: {
                            message.showNotes = reader.string();
                            break;
                        }
                    case 5: {
                            message.contentCid = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.thumbnailCid = reader.bytes();
                            break;
                        }
                    case 7: {
                            message.transcriptCid = reader.bytes();
                            break;
                        }
                    case 8: {
                            message.durationMs = reader.uint64();
                            break;
                        }
                    case 9: {
                            message.publishedAtMs = reader.uint64();
                            break;
                        }
                    case 10: {
                            message.previousItemCid = reader.bytes();
                            break;
                        }
                    case 11: {
                            message.contentType = reader.string();
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
             * Decodes a MediaManifest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.MediaManifest} MediaManifest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MediaManifest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a MediaManifest message.
             * @function verify
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MediaManifest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.title != null && message.hasOwnProperty("title"))
                    if (!$util.isString(message.title))
                        return "title: string expected";
                if (message.summary != null && message.hasOwnProperty("summary"))
                    if (!$util.isString(message.summary))
                        return "summary: string expected";
                if (message.showNotes != null && message.hasOwnProperty("showNotes"))
                    if (!$util.isString(message.showNotes))
                        return "showNotes: string expected";
                if (message.contentCid != null && message.hasOwnProperty("contentCid"))
                    if (!(message.contentCid && typeof message.contentCid.length === "number" || $util.isString(message.contentCid)))
                        return "contentCid: buffer expected";
                if (message.thumbnailCid != null && message.hasOwnProperty("thumbnailCid"))
                    if (!(message.thumbnailCid && typeof message.thumbnailCid.length === "number" || $util.isString(message.thumbnailCid)))
                        return "thumbnailCid: buffer expected";
                if (message.transcriptCid != null && message.hasOwnProperty("transcriptCid"))
                    if (!(message.transcriptCid && typeof message.transcriptCid.length === "number" || $util.isString(message.transcriptCid)))
                        return "transcriptCid: buffer expected";
                if (message.durationMs != null && message.hasOwnProperty("durationMs"))
                    if (!$util.isInteger(message.durationMs) && !(message.durationMs && $util.isInteger(message.durationMs.low) && $util.isInteger(message.durationMs.high)))
                        return "durationMs: integer|Long expected";
                if (message.publishedAtMs != null && message.hasOwnProperty("publishedAtMs"))
                    if (!$util.isInteger(message.publishedAtMs) && !(message.publishedAtMs && $util.isInteger(message.publishedAtMs.low) && $util.isInteger(message.publishedAtMs.high)))
                        return "publishedAtMs: integer|Long expected";
                if (message.previousItemCid != null && message.hasOwnProperty("previousItemCid"))
                    if (!(message.previousItemCid && typeof message.previousItemCid.length === "number" || $util.isString(message.previousItemCid)))
                        return "previousItemCid: buffer expected";
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    if (!$util.isString(message.contentType))
                        return "contentType: string expected";
                return null;
            };

            /**
             * Creates a MediaManifest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.MediaManifest} MediaManifest
             */
            MediaManifest.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.MediaManifest)
                    return object;
                let message = new $root.vco.schemas.MediaManifest();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.title != null)
                    message.title = String(object.title);
                if (object.summary != null)
                    message.summary = String(object.summary);
                if (object.showNotes != null)
                    message.showNotes = String(object.showNotes);
                if (object.contentCid != null)
                    if (typeof object.contentCid === "string")
                        $util.base64.decode(object.contentCid, message.contentCid = $util.newBuffer($util.base64.length(object.contentCid)), 0);
                    else if (object.contentCid.length >= 0)
                        message.contentCid = object.contentCid;
                if (object.thumbnailCid != null)
                    if (typeof object.thumbnailCid === "string")
                        $util.base64.decode(object.thumbnailCid, message.thumbnailCid = $util.newBuffer($util.base64.length(object.thumbnailCid)), 0);
                    else if (object.thumbnailCid.length >= 0)
                        message.thumbnailCid = object.thumbnailCid;
                if (object.transcriptCid != null)
                    if (typeof object.transcriptCid === "string")
                        $util.base64.decode(object.transcriptCid, message.transcriptCid = $util.newBuffer($util.base64.length(object.transcriptCid)), 0);
                    else if (object.transcriptCid.length >= 0)
                        message.transcriptCid = object.transcriptCid;
                if (object.durationMs != null)
                    if ($util.Long)
                        (message.durationMs = $util.Long.fromValue(object.durationMs)).unsigned = true;
                    else if (typeof object.durationMs === "string")
                        message.durationMs = parseInt(object.durationMs, 10);
                    else if (typeof object.durationMs === "number")
                        message.durationMs = object.durationMs;
                    else if (typeof object.durationMs === "object")
                        message.durationMs = new $util.LongBits(object.durationMs.low >>> 0, object.durationMs.high >>> 0).toNumber(true);
                if (object.publishedAtMs != null)
                    if ($util.Long)
                        (message.publishedAtMs = $util.Long.fromValue(object.publishedAtMs)).unsigned = true;
                    else if (typeof object.publishedAtMs === "string")
                        message.publishedAtMs = parseInt(object.publishedAtMs, 10);
                    else if (typeof object.publishedAtMs === "number")
                        message.publishedAtMs = object.publishedAtMs;
                    else if (typeof object.publishedAtMs === "object")
                        message.publishedAtMs = new $util.LongBits(object.publishedAtMs.low >>> 0, object.publishedAtMs.high >>> 0).toNumber(true);
                if (object.previousItemCid != null)
                    if (typeof object.previousItemCid === "string")
                        $util.base64.decode(object.previousItemCid, message.previousItemCid = $util.newBuffer($util.base64.length(object.previousItemCid)), 0);
                    else if (object.previousItemCid.length >= 0)
                        message.previousItemCid = object.previousItemCid;
                if (object.contentType != null)
                    message.contentType = String(object.contentType);
                return message;
            };

            /**
             * Creates a plain object from a MediaManifest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {vco.schemas.MediaManifest} message MediaManifest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MediaManifest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    object.title = "";
                    object.summary = "";
                    object.showNotes = "";
                    if (options.bytes === String)
                        object.contentCid = "";
                    else {
                        object.contentCid = [];
                        if (options.bytes !== Array)
                            object.contentCid = $util.newBuffer(object.contentCid);
                    }
                    if (options.bytes === String)
                        object.thumbnailCid = "";
                    else {
                        object.thumbnailCid = [];
                        if (options.bytes !== Array)
                            object.thumbnailCid = $util.newBuffer(object.thumbnailCid);
                    }
                    if (options.bytes === String)
                        object.transcriptCid = "";
                    else {
                        object.transcriptCid = [];
                        if (options.bytes !== Array)
                            object.transcriptCid = $util.newBuffer(object.transcriptCid);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.durationMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.durationMs = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.publishedAtMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.publishedAtMs = options.longs === String ? "0" : 0;
                    if (options.bytes === String)
                        object.previousItemCid = "";
                    else {
                        object.previousItemCid = [];
                        if (options.bytes !== Array)
                            object.previousItemCid = $util.newBuffer(object.previousItemCid);
                    }
                    object.contentType = "";
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.title != null && message.hasOwnProperty("title"))
                    object.title = message.title;
                if (message.summary != null && message.hasOwnProperty("summary"))
                    object.summary = message.summary;
                if (message.showNotes != null && message.hasOwnProperty("showNotes"))
                    object.showNotes = message.showNotes;
                if (message.contentCid != null && message.hasOwnProperty("contentCid"))
                    object.contentCid = options.bytes === String ? $util.base64.encode(message.contentCid, 0, message.contentCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.contentCid) : message.contentCid;
                if (message.thumbnailCid != null && message.hasOwnProperty("thumbnailCid"))
                    object.thumbnailCid = options.bytes === String ? $util.base64.encode(message.thumbnailCid, 0, message.thumbnailCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.thumbnailCid) : message.thumbnailCid;
                if (message.transcriptCid != null && message.hasOwnProperty("transcriptCid"))
                    object.transcriptCid = options.bytes === String ? $util.base64.encode(message.transcriptCid, 0, message.transcriptCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.transcriptCid) : message.transcriptCid;
                if (message.durationMs != null && message.hasOwnProperty("durationMs"))
                    if (typeof message.durationMs === "number")
                        object.durationMs = options.longs === String ? String(message.durationMs) : message.durationMs;
                    else
                        object.durationMs = options.longs === String ? $util.Long.prototype.toString.call(message.durationMs) : options.longs === Number ? new $util.LongBits(message.durationMs.low >>> 0, message.durationMs.high >>> 0).toNumber(true) : message.durationMs;
                if (message.publishedAtMs != null && message.hasOwnProperty("publishedAtMs"))
                    if (typeof message.publishedAtMs === "number")
                        object.publishedAtMs = options.longs === String ? String(message.publishedAtMs) : message.publishedAtMs;
                    else
                        object.publishedAtMs = options.longs === String ? $util.Long.prototype.toString.call(message.publishedAtMs) : options.longs === Number ? new $util.LongBits(message.publishedAtMs.low >>> 0, message.publishedAtMs.high >>> 0).toNumber(true) : message.publishedAtMs;
                if (message.previousItemCid != null && message.hasOwnProperty("previousItemCid"))
                    object.previousItemCid = options.bytes === String ? $util.base64.encode(message.previousItemCid, 0, message.previousItemCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.previousItemCid) : message.previousItemCid;
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    object.contentType = message.contentType;
                return object;
            };

            /**
             * Converts this MediaManifest to JSON.
             * @function toJSON
             * @memberof vco.schemas.MediaManifest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MediaManifest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for MediaManifest
             * @function getTypeUrl
             * @memberof vco.schemas.MediaManifest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MediaManifest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.MediaManifest";
            };

            return MediaManifest;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const MediaManifest = vco.schemas.MediaManifest;
