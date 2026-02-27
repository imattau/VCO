/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

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

    vco.schemas = (function() {

        /**
         * Namespace schemas.
         * @memberof vco
         * @namespace
         */
        const schemas = {};

        schemas.Profile = (function() {

            /**
             * Properties of a Profile.
             * @memberof vco.schemas
             * @interface IProfile
             * @property {string|null} [schema] Profile schema
             * @property {string|null} [displayName] Profile displayName
             * @property {Uint8Array|null} [avatarCid] Profile avatarCid
             * @property {Uint8Array|null} [previousManifest] Profile previousManifest
             * @property {string|null} [bio] Profile bio
             */

            /**
             * Constructs a new Profile.
             * @memberof vco.schemas
             * @classdesc Represents a Profile.
             * @implements IProfile
             * @constructor
             * @param {vco.schemas.IProfile=} [properties] Properties to set
             */
            function Profile(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Profile schema.
             * @member {string} schema
             * @memberof vco.schemas.Profile
             * @instance
             */
            Profile.prototype.schema = "";

            /**
             * Profile displayName.
             * @member {string} displayName
             * @memberof vco.schemas.Profile
             * @instance
             */
            Profile.prototype.displayName = "";

            /**
             * Profile avatarCid.
             * @member {Uint8Array} avatarCid
             * @memberof vco.schemas.Profile
             * @instance
             */
            Profile.prototype.avatarCid = $util.newBuffer([]);

            /**
             * Profile previousManifest.
             * @member {Uint8Array} previousManifest
             * @memberof vco.schemas.Profile
             * @instance
             */
            Profile.prototype.previousManifest = $util.newBuffer([]);

            /**
             * Profile bio.
             * @member {string} bio
             * @memberof vco.schemas.Profile
             * @instance
             */
            Profile.prototype.bio = "";

            /**
             * Creates a new Profile instance using the specified properties.
             * @function create
             * @memberof vco.schemas.Profile
             * @static
             * @param {vco.schemas.IProfile=} [properties] Properties to set
             * @returns {vco.schemas.Profile} Profile instance
             */
            Profile.create = function create(properties) {
                return new Profile(properties);
            };

            /**
             * Encodes the specified Profile message. Does not implicitly {@link vco.schemas.Profile.verify|verify} messages.
             * @function encode
             * @memberof vco.schemas.Profile
             * @static
             * @param {vco.schemas.IProfile} message Profile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Profile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.schema != null && Object.hasOwnProperty.call(message, "schema"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.schema);
                if (message.displayName != null && Object.hasOwnProperty.call(message, "displayName"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.displayName);
                if (message.avatarCid != null && Object.hasOwnProperty.call(message, "avatarCid"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.avatarCid);
                if (message.previousManifest != null && Object.hasOwnProperty.call(message, "previousManifest"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.previousManifest);
                if (message.bio != null && Object.hasOwnProperty.call(message, "bio"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.bio);
                return writer;
            };

            /**
             * Encodes the specified Profile message, length delimited. Does not implicitly {@link vco.schemas.Profile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof vco.schemas.Profile
             * @static
             * @param {vco.schemas.IProfile} message Profile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Profile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Profile message from the specified reader or buffer.
             * @function decode
             * @memberof vco.schemas.Profile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {vco.schemas.Profile} Profile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Profile.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.vco.schemas.Profile();
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
                            message.displayName = reader.string();
                            break;
                        }
                    case 3: {
                            message.avatarCid = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.previousManifest = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.bio = reader.string();
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
             * Decodes a Profile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof vco.schemas.Profile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {vco.schemas.Profile} Profile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Profile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Profile message.
             * @function verify
             * @memberof vco.schemas.Profile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Profile.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.schema != null && message.hasOwnProperty("schema"))
                    if (!$util.isString(message.schema))
                        return "schema: string expected";
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    if (!$util.isString(message.displayName))
                        return "displayName: string expected";
                if (message.avatarCid != null && message.hasOwnProperty("avatarCid"))
                    if (!(message.avatarCid && typeof message.avatarCid.length === "number" || $util.isString(message.avatarCid)))
                        return "avatarCid: buffer expected";
                if (message.previousManifest != null && message.hasOwnProperty("previousManifest"))
                    if (!(message.previousManifest && typeof message.previousManifest.length === "number" || $util.isString(message.previousManifest)))
                        return "previousManifest: buffer expected";
                if (message.bio != null && message.hasOwnProperty("bio"))
                    if (!$util.isString(message.bio))
                        return "bio: string expected";
                return null;
            };

            /**
             * Creates a Profile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof vco.schemas.Profile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {vco.schemas.Profile} Profile
             */
            Profile.fromObject = function fromObject(object) {
                if (object instanceof $root.vco.schemas.Profile)
                    return object;
                let message = new $root.vco.schemas.Profile();
                if (object.schema != null)
                    message.schema = String(object.schema);
                if (object.displayName != null)
                    message.displayName = String(object.displayName);
                if (object.avatarCid != null)
                    if (typeof object.avatarCid === "string")
                        $util.base64.decode(object.avatarCid, message.avatarCid = $util.newBuffer($util.base64.length(object.avatarCid)), 0);
                    else if (object.avatarCid.length >= 0)
                        message.avatarCid = object.avatarCid;
                if (object.previousManifest != null)
                    if (typeof object.previousManifest === "string")
                        $util.base64.decode(object.previousManifest, message.previousManifest = $util.newBuffer($util.base64.length(object.previousManifest)), 0);
                    else if (object.previousManifest.length >= 0)
                        message.previousManifest = object.previousManifest;
                if (object.bio != null)
                    message.bio = String(object.bio);
                return message;
            };

            /**
             * Creates a plain object from a Profile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof vco.schemas.Profile
             * @static
             * @param {vco.schemas.Profile} message Profile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Profile.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.schema = "";
                    object.displayName = "";
                    if (options.bytes === String)
                        object.avatarCid = "";
                    else {
                        object.avatarCid = [];
                        if (options.bytes !== Array)
                            object.avatarCid = $util.newBuffer(object.avatarCid);
                    }
                    if (options.bytes === String)
                        object.previousManifest = "";
                    else {
                        object.previousManifest = [];
                        if (options.bytes !== Array)
                            object.previousManifest = $util.newBuffer(object.previousManifest);
                    }
                    object.bio = "";
                }
                if (message.schema != null && message.hasOwnProperty("schema"))
                    object.schema = message.schema;
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    object.displayName = message.displayName;
                if (message.avatarCid != null && message.hasOwnProperty("avatarCid"))
                    object.avatarCid = options.bytes === String ? $util.base64.encode(message.avatarCid, 0, message.avatarCid.length) : options.bytes === Array ? Array.prototype.slice.call(message.avatarCid) : message.avatarCid;
                if (message.previousManifest != null && message.hasOwnProperty("previousManifest"))
                    object.previousManifest = options.bytes === String ? $util.base64.encode(message.previousManifest, 0, message.previousManifest.length) : options.bytes === Array ? Array.prototype.slice.call(message.previousManifest) : message.previousManifest;
                if (message.bio != null && message.hasOwnProperty("bio"))
                    object.bio = message.bio;
                return object;
            };

            /**
             * Converts this Profile to JSON.
             * @function toJSON
             * @memberof vco.schemas.Profile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Profile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Profile
             * @function getTypeUrl
             * @memberof vco.schemas.Profile
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Profile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/vco.schemas.Profile";
            };

            return Profile;
        })();

        return schemas;
    })();

    return vco;
})();

export { $root as default };

export const Profile = vco.schemas.Profile;
