import $protobuf from "protobufjs/minimal.js";
/** Namespace vco. */
export namespace vco {

    /** Namespace v3. */
    namespace v3 {

        /** Properties of a ZKPExtension. */
        interface IZKPExtension {

            /** ZKPExtension circuitId */
            circuitId?: (number|null);

            /** ZKPExtension proofLength */
            proofLength?: (number|null);

            /** ZKPExtension proof */
            proof?: (Uint8Array|null);

            /** ZKPExtension inputsLength */
            inputsLength?: (number|null);

            /** ZKPExtension publicInputs */
            publicInputs?: (Uint8Array|null);
        }

        /** Represents a ZKPExtension. */
        class ZKPExtension implements IZKPExtension {

            /**
             * Constructs a new ZKPExtension.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IZKPExtension);

            /** ZKPExtension circuitId. */
            public circuitId: number;

            /** ZKPExtension proofLength. */
            public proofLength: number;

            /** ZKPExtension proof. */
            public proof: Uint8Array;

            /** ZKPExtension inputsLength. */
            public inputsLength: number;

            /** ZKPExtension publicInputs. */
            public publicInputs: Uint8Array;

            /**
             * Creates a new ZKPExtension instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ZKPExtension instance
             */
            public static create(properties?: vco.v3.IZKPExtension): vco.v3.ZKPExtension;

            /**
             * Encodes the specified ZKPExtension message. Does not implicitly {@link vco.v3.ZKPExtension.verify|verify} messages.
             * @param message ZKPExtension message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IZKPExtension, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ZKPExtension message, length delimited. Does not implicitly {@link vco.v3.ZKPExtension.verify|verify} messages.
             * @param message ZKPExtension message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IZKPExtension, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ZKPExtension message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ZKPExtension
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.ZKPExtension;

            /**
             * Decodes a ZKPExtension message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ZKPExtension
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.ZKPExtension;

            /**
             * Verifies a ZKPExtension message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ZKPExtension message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ZKPExtension
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.ZKPExtension;

            /**
             * Creates a plain object from a ZKPExtension message. Also converts values to other types if specified.
             * @param message ZKPExtension
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.ZKPExtension, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ZKPExtension to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ZKPExtension
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Envelope. */
        interface IEnvelope {

            /** Envelope headerHash */
            headerHash?: (Uint8Array|null);

            /** Envelope version */
            version?: (number|null);

            /** Envelope flags */
            flags?: (number|null);

            /** Envelope payloadType */
            payloadType?: (number|null);

            /** Envelope creatorId */
            creatorId?: (Uint8Array|null);

            /** Envelope payloadHash */
            payloadHash?: (Uint8Array|null);

            /** Envelope signature */
            signature?: (Uint8Array|null);

            /** Envelope payload */
            payload?: (Uint8Array|null);

            /** Envelope zkpExtension */
            zkpExtension?: (vco.v3.IZKPExtension|null);

            /** Envelope nonce */
            nonce?: (number|null);

            /** Envelope contextId */
            contextId?: (Uint8Array|null);

            /** Envelope nullifier */
            nullifier?: (Uint8Array|null);
        }

        /** Represents an Envelope. */
        class Envelope implements IEnvelope {

            /**
             * Constructs a new Envelope.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IEnvelope);

            /** Envelope headerHash. */
            public headerHash: Uint8Array;

            /** Envelope version. */
            public version: number;

            /** Envelope flags. */
            public flags: number;

            /** Envelope payloadType. */
            public payloadType: number;

            /** Envelope creatorId. */
            public creatorId: Uint8Array;

            /** Envelope payloadHash. */
            public payloadHash: Uint8Array;

            /** Envelope signature. */
            public signature: Uint8Array;

            /** Envelope payload. */
            public payload: Uint8Array;

            /** Envelope zkpExtension. */
            public zkpExtension?: (vco.v3.IZKPExtension|null);

            /** Envelope nonce. */
            public nonce: number;

            /** Envelope contextId. */
            public contextId: Uint8Array;

            /** Envelope nullifier. */
            public nullifier: Uint8Array;

            /**
             * Creates a new Envelope instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Envelope instance
             */
            public static create(properties?: vco.v3.IEnvelope): vco.v3.Envelope;

            /**
             * Encodes the specified Envelope message. Does not implicitly {@link vco.v3.Envelope.verify|verify} messages.
             * @param message Envelope message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Envelope message, length delimited. Does not implicitly {@link vco.v3.Envelope.verify|verify} messages.
             * @param message Envelope message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Envelope message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.Envelope;

            /**
             * Decodes an Envelope message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.Envelope;

            /**
             * Verifies an Envelope message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Envelope
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.Envelope;

            /**
             * Creates a plain object from an Envelope message. Also converts values to other types if specified.
             * @param message Envelope
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.Envelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Envelope to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Envelope
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EnvelopeSigningMaterial. */
        interface IEnvelopeSigningMaterial {

            /** EnvelopeSigningMaterial version */
            version?: (number|null);

            /** EnvelopeSigningMaterial flags */
            flags?: (number|null);

            /** EnvelopeSigningMaterial payloadType */
            payloadType?: (number|null);

            /** EnvelopeSigningMaterial creatorId */
            creatorId?: (Uint8Array|null);

            /** EnvelopeSigningMaterial payloadHash */
            payloadHash?: (Uint8Array|null);

            /** EnvelopeSigningMaterial contextId */
            contextId?: (Uint8Array|null);

            /** EnvelopeSigningMaterial nullifier */
            nullifier?: (Uint8Array|null);
        }

        /** Represents an EnvelopeSigningMaterial. */
        class EnvelopeSigningMaterial implements IEnvelopeSigningMaterial {

            /**
             * Constructs a new EnvelopeSigningMaterial.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IEnvelopeSigningMaterial);

            /** EnvelopeSigningMaterial version. */
            public version: number;

            /** EnvelopeSigningMaterial flags. */
            public flags: number;

            /** EnvelopeSigningMaterial payloadType. */
            public payloadType: number;

            /** EnvelopeSigningMaterial creatorId. */
            public creatorId: Uint8Array;

            /** EnvelopeSigningMaterial payloadHash. */
            public payloadHash: Uint8Array;

            /** EnvelopeSigningMaterial contextId. */
            public contextId: Uint8Array;

            /** EnvelopeSigningMaterial nullifier. */
            public nullifier: Uint8Array;

            /**
             * Creates a new EnvelopeSigningMaterial instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnvelopeSigningMaterial instance
             */
            public static create(properties?: vco.v3.IEnvelopeSigningMaterial): vco.v3.EnvelopeSigningMaterial;

            /**
             * Encodes the specified EnvelopeSigningMaterial message. Does not implicitly {@link vco.v3.EnvelopeSigningMaterial.verify|verify} messages.
             * @param message EnvelopeSigningMaterial message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IEnvelopeSigningMaterial, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnvelopeSigningMaterial message, length delimited. Does not implicitly {@link vco.v3.EnvelopeSigningMaterial.verify|verify} messages.
             * @param message EnvelopeSigningMaterial message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IEnvelopeSigningMaterial, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnvelopeSigningMaterial message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnvelopeSigningMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.EnvelopeSigningMaterial;

            /**
             * Decodes an EnvelopeSigningMaterial message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnvelopeSigningMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.EnvelopeSigningMaterial;

            /**
             * Verifies an EnvelopeSigningMaterial message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnvelopeSigningMaterial message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnvelopeSigningMaterial
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.EnvelopeSigningMaterial;

            /**
             * Creates a plain object from an EnvelopeSigningMaterial message. Also converts values to other types if specified.
             * @param message EnvelopeSigningMaterial
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.EnvelopeSigningMaterial, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnvelopeSigningMaterial to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EnvelopeSigningMaterial
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EnvelopeHeaderHashMaterial. */
        interface IEnvelopeHeaderHashMaterial {

            /** EnvelopeHeaderHashMaterial version */
            version?: (number|null);

            /** EnvelopeHeaderHashMaterial flags */
            flags?: (number|null);

            /** EnvelopeHeaderHashMaterial payloadType */
            payloadType?: (number|null);

            /** EnvelopeHeaderHashMaterial creatorId */
            creatorId?: (Uint8Array|null);

            /** EnvelopeHeaderHashMaterial payloadHash */
            payloadHash?: (Uint8Array|null);

            /** EnvelopeHeaderHashMaterial signature */
            signature?: (Uint8Array|null);

            /** EnvelopeHeaderHashMaterial nonce */
            nonce?: (number|null);

            /** EnvelopeHeaderHashMaterial contextId */
            contextId?: (Uint8Array|null);

            /** EnvelopeHeaderHashMaterial nullifier */
            nullifier?: (Uint8Array|null);
        }

        /** Represents an EnvelopeHeaderHashMaterial. */
        class EnvelopeHeaderHashMaterial implements IEnvelopeHeaderHashMaterial {

            /**
             * Constructs a new EnvelopeHeaderHashMaterial.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IEnvelopeHeaderHashMaterial);

            /** EnvelopeHeaderHashMaterial version. */
            public version: number;

            /** EnvelopeHeaderHashMaterial flags. */
            public flags: number;

            /** EnvelopeHeaderHashMaterial payloadType. */
            public payloadType: number;

            /** EnvelopeHeaderHashMaterial creatorId. */
            public creatorId: Uint8Array;

            /** EnvelopeHeaderHashMaterial payloadHash. */
            public payloadHash: Uint8Array;

            /** EnvelopeHeaderHashMaterial signature. */
            public signature: Uint8Array;

            /** EnvelopeHeaderHashMaterial nonce. */
            public nonce: number;

            /** EnvelopeHeaderHashMaterial contextId. */
            public contextId: Uint8Array;

            /** EnvelopeHeaderHashMaterial nullifier. */
            public nullifier: Uint8Array;

            /**
             * Creates a new EnvelopeHeaderHashMaterial instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnvelopeHeaderHashMaterial instance
             */
            public static create(properties?: vco.v3.IEnvelopeHeaderHashMaterial): vco.v3.EnvelopeHeaderHashMaterial;

            /**
             * Encodes the specified EnvelopeHeaderHashMaterial message. Does not implicitly {@link vco.v3.EnvelopeHeaderHashMaterial.verify|verify} messages.
             * @param message EnvelopeHeaderHashMaterial message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IEnvelopeHeaderHashMaterial, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnvelopeHeaderHashMaterial message, length delimited. Does not implicitly {@link vco.v3.EnvelopeHeaderHashMaterial.verify|verify} messages.
             * @param message EnvelopeHeaderHashMaterial message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IEnvelopeHeaderHashMaterial, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnvelopeHeaderHashMaterial message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnvelopeHeaderHashMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.EnvelopeHeaderHashMaterial;

            /**
             * Decodes an EnvelopeHeaderHashMaterial message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnvelopeHeaderHashMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.EnvelopeHeaderHashMaterial;

            /**
             * Verifies an EnvelopeHeaderHashMaterial message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnvelopeHeaderHashMaterial message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnvelopeHeaderHashMaterial
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.EnvelopeHeaderHashMaterial;

            /**
             * Creates a plain object from an EnvelopeHeaderHashMaterial message. Also converts values to other types if specified.
             * @param message EnvelopeHeaderHashMaterial
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.EnvelopeHeaderHashMaterial, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnvelopeHeaderHashMaterial to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EnvelopeHeaderHashMaterial
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PayloadFragment. */
        interface IPayloadFragment {

            /** PayloadFragment parentHeaderHash */
            parentHeaderHash?: (Uint8Array|null);

            /** PayloadFragment fragmentIndex */
            fragmentIndex?: (number|null);

            /** PayloadFragment fragmentCount */
            fragmentCount?: (number|null);

            /** PayloadFragment totalPayloadSize */
            totalPayloadSize?: (number|null);

            /** PayloadFragment payloadChunk */
            payloadChunk?: (Uint8Array|null);

            /** PayloadFragment payloadHash */
            payloadHash?: (Uint8Array|null);
        }

        /** Represents a PayloadFragment. */
        class PayloadFragment implements IPayloadFragment {

            /**
             * Constructs a new PayloadFragment.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IPayloadFragment);

            /** PayloadFragment parentHeaderHash. */
            public parentHeaderHash: Uint8Array;

            /** PayloadFragment fragmentIndex. */
            public fragmentIndex: number;

            /** PayloadFragment fragmentCount. */
            public fragmentCount: number;

            /** PayloadFragment totalPayloadSize. */
            public totalPayloadSize: number;

            /** PayloadFragment payloadChunk. */
            public payloadChunk: Uint8Array;

            /** PayloadFragment payloadHash. */
            public payloadHash: Uint8Array;

            /**
             * Creates a new PayloadFragment instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PayloadFragment instance
             */
            public static create(properties?: vco.v3.IPayloadFragment): vco.v3.PayloadFragment;

            /**
             * Encodes the specified PayloadFragment message. Does not implicitly {@link vco.v3.PayloadFragment.verify|verify} messages.
             * @param message PayloadFragment message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IPayloadFragment, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PayloadFragment message, length delimited. Does not implicitly {@link vco.v3.PayloadFragment.verify|verify} messages.
             * @param message PayloadFragment message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IPayloadFragment, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PayloadFragment message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PayloadFragment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.PayloadFragment;

            /**
             * Decodes a PayloadFragment message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PayloadFragment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.PayloadFragment;

            /**
             * Verifies a PayloadFragment message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PayloadFragment message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PayloadFragment
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.PayloadFragment;

            /**
             * Creates a plain object from a PayloadFragment message. Also converts values to other types if specified.
             * @param message PayloadFragment
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.PayloadFragment, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PayloadFragment to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PayloadFragment
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PayloadFragmentSet. */
        interface IPayloadFragmentSet {

            /** PayloadFragmentSet fragments */
            fragments?: (vco.v3.IPayloadFragment[]|null);
        }

        /** Represents a PayloadFragmentSet. */
        class PayloadFragmentSet implements IPayloadFragmentSet {

            /**
             * Constructs a new PayloadFragmentSet.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IPayloadFragmentSet);

            /** PayloadFragmentSet fragments. */
            public fragments: vco.v3.IPayloadFragment[];

            /**
             * Creates a new PayloadFragmentSet instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PayloadFragmentSet instance
             */
            public static create(properties?: vco.v3.IPayloadFragmentSet): vco.v3.PayloadFragmentSet;

            /**
             * Encodes the specified PayloadFragmentSet message. Does not implicitly {@link vco.v3.PayloadFragmentSet.verify|verify} messages.
             * @param message PayloadFragmentSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IPayloadFragmentSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PayloadFragmentSet message, length delimited. Does not implicitly {@link vco.v3.PayloadFragmentSet.verify|verify} messages.
             * @param message PayloadFragmentSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IPayloadFragmentSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PayloadFragmentSet message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PayloadFragmentSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.PayloadFragmentSet;

            /**
             * Decodes a PayloadFragmentSet message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PayloadFragmentSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.PayloadFragmentSet;

            /**
             * Verifies a PayloadFragmentSet message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PayloadFragmentSet message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PayloadFragmentSet
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.PayloadFragmentSet;

            /**
             * Creates a plain object from a PayloadFragmentSet message. Also converts values to other types if specified.
             * @param message PayloadFragmentSet
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.PayloadFragmentSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PayloadFragmentSet to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PayloadFragmentSet
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** PriorityLevel enum. */
        enum PriorityLevel {
            PRIORITY_LOW = 0,
            PRIORITY_NORMAL = 1,
            PRIORITY_HIGH = 2,
            PRIORITY_CRITICAL = 3
        }

        /** Properties of an InterestVector. */
        interface IInterestVector {

            /** InterestVector targetCids */
            targetCids?: (Uint8Array[]|null);

            /** InterestVector priority */
            priority?: (vco.v3.PriorityLevel|null);
        }

        /** Represents an InterestVector. */
        class InterestVector implements IInterestVector {

            /**
             * Constructs a new InterestVector.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IInterestVector);

            /** InterestVector targetCids. */
            public targetCids: Uint8Array[];

            /** InterestVector priority. */
            public priority: vco.v3.PriorityLevel;

            /**
             * Creates a new InterestVector instance using the specified properties.
             * @param [properties] Properties to set
             * @returns InterestVector instance
             */
            public static create(properties?: vco.v3.IInterestVector): vco.v3.InterestVector;

            /**
             * Encodes the specified InterestVector message. Does not implicitly {@link vco.v3.InterestVector.verify|verify} messages.
             * @param message InterestVector message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IInterestVector, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified InterestVector message, length delimited. Does not implicitly {@link vco.v3.InterestVector.verify|verify} messages.
             * @param message InterestVector message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IInterestVector, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an InterestVector message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns InterestVector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.InterestVector;

            /**
             * Decodes an InterestVector message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns InterestVector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.InterestVector;

            /**
             * Verifies an InterestVector message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an InterestVector message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns InterestVector
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.InterestVector;

            /**
             * Creates a plain object from an InterestVector message. Also converts values to other types if specified.
             * @param message InterestVector
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.InterestVector, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this InterestVector to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for InterestVector
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PowChallenge. */
        interface IPowChallenge {

            /** PowChallenge minDifficulty */
            minDifficulty?: (number|null);

            /** PowChallenge ttlSeconds */
            ttlSeconds?: (number|null);

            /** PowChallenge reason */
            reason?: (string|null);
        }

        /** Represents a PowChallenge. */
        class PowChallenge implements IPowChallenge {

            /**
             * Constructs a new PowChallenge.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.IPowChallenge);

            /** PowChallenge minDifficulty. */
            public minDifficulty: number;

            /** PowChallenge ttlSeconds. */
            public ttlSeconds: number;

            /** PowChallenge reason. */
            public reason: string;

            /**
             * Creates a new PowChallenge instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PowChallenge instance
             */
            public static create(properties?: vco.v3.IPowChallenge): vco.v3.PowChallenge;

            /**
             * Encodes the specified PowChallenge message. Does not implicitly {@link vco.v3.PowChallenge.verify|verify} messages.
             * @param message PowChallenge message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.IPowChallenge, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PowChallenge message, length delimited. Does not implicitly {@link vco.v3.PowChallenge.verify|verify} messages.
             * @param message PowChallenge message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.IPowChallenge, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PowChallenge message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PowChallenge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.PowChallenge;

            /**
             * Decodes a PowChallenge message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PowChallenge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.PowChallenge;

            /**
             * Verifies a PowChallenge message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PowChallenge message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PowChallenge
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.PowChallenge;

            /**
             * Creates a plain object from a PowChallenge message. Also converts values to other types if specified.
             * @param message PowChallenge
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.PowChallenge, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PowChallenge to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PowChallenge
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SyncControl. */
        interface ISyncControl {

            /** SyncControl syncMessage */
            syncMessage?: (vco.v3.ISyncMessage|null);

            /** SyncControl powChallenge */
            powChallenge?: (vco.v3.IPowChallenge|null);

            /** SyncControl interestVector */
            interestVector?: (vco.v3.IInterestVector|null);
        }

        /** Represents a SyncControl. */
        class SyncControl implements ISyncControl {

            /**
             * Constructs a new SyncControl.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.ISyncControl);

            /** SyncControl syncMessage. */
            public syncMessage?: (vco.v3.ISyncMessage|null);

            /** SyncControl powChallenge. */
            public powChallenge?: (vco.v3.IPowChallenge|null);

            /** SyncControl interestVector. */
            public interestVector?: (vco.v3.IInterestVector|null);

            /** SyncControl message. */
            public message?: ("syncMessage"|"powChallenge"|"interestVector");

            /**
             * Creates a new SyncControl instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SyncControl instance
             */
            public static create(properties?: vco.v3.ISyncControl): vco.v3.SyncControl;

            /**
             * Encodes the specified SyncControl message. Does not implicitly {@link vco.v3.SyncControl.verify|verify} messages.
             * @param message SyncControl message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.ISyncControl, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SyncControl message, length delimited. Does not implicitly {@link vco.v3.SyncControl.verify|verify} messages.
             * @param message SyncControl message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.ISyncControl, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SyncControl message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SyncControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.SyncControl;

            /**
             * Decodes a SyncControl message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SyncControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.SyncControl;

            /**
             * Verifies a SyncControl message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SyncControl message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SyncControl
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.SyncControl;

            /**
             * Creates a plain object from a SyncControl message. Also converts values to other types if specified.
             * @param message SyncControl
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.SyncControl, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SyncControl to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SyncControl
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SyncMessage. */
        interface ISyncMessage {

            /** SyncMessage ranges */
            ranges?: (vco.v3.SyncMessage.IRange[]|null);
        }

        /** Represents a SyncMessage. */
        class SyncMessage implements ISyncMessage {

            /**
             * Constructs a new SyncMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: vco.v3.ISyncMessage);

            /** SyncMessage ranges. */
            public ranges: vco.v3.SyncMessage.IRange[];

            /**
             * Creates a new SyncMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SyncMessage instance
             */
            public static create(properties?: vco.v3.ISyncMessage): vco.v3.SyncMessage;

            /**
             * Encodes the specified SyncMessage message. Does not implicitly {@link vco.v3.SyncMessage.verify|verify} messages.
             * @param message SyncMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: vco.v3.ISyncMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SyncMessage message, length delimited. Does not implicitly {@link vco.v3.SyncMessage.verify|verify} messages.
             * @param message SyncMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: vco.v3.ISyncMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SyncMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SyncMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.SyncMessage;

            /**
             * Decodes a SyncMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SyncMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.SyncMessage;

            /**
             * Verifies a SyncMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SyncMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SyncMessage
             */
            public static fromObject(object: { [k: string]: any }): vco.v3.SyncMessage;

            /**
             * Creates a plain object from a SyncMessage message. Also converts values to other types if specified.
             * @param message SyncMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: vco.v3.SyncMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SyncMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SyncMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace SyncMessage {

            /** Properties of a Range. */
            interface IRange {

                /** Range startHash */
                startHash?: (Uint8Array|null);

                /** Range endHash */
                endHash?: (Uint8Array|null);

                /** Range fingerprint */
                fingerprint?: (Uint8Array|null);
            }

            /** Represents a Range. */
            class Range implements IRange {

                /**
                 * Constructs a new Range.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: vco.v3.SyncMessage.IRange);

                /** Range startHash. */
                public startHash: Uint8Array;

                /** Range endHash. */
                public endHash: Uint8Array;

                /** Range fingerprint. */
                public fingerprint: Uint8Array;

                /**
                 * Creates a new Range instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Range instance
                 */
                public static create(properties?: vco.v3.SyncMessage.IRange): vco.v3.SyncMessage.Range;

                /**
                 * Encodes the specified Range message. Does not implicitly {@link vco.v3.SyncMessage.Range.verify|verify} messages.
                 * @param message Range message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: vco.v3.SyncMessage.IRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Range message, length delimited. Does not implicitly {@link vco.v3.SyncMessage.Range.verify|verify} messages.
                 * @param message Range message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: vco.v3.SyncMessage.IRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Range message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Range
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vco.v3.SyncMessage.Range;

                /**
                 * Decodes a Range message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Range
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vco.v3.SyncMessage.Range;

                /**
                 * Verifies a Range message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Range message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Range
                 */
                public static fromObject(object: { [k: string]: any }): vco.v3.SyncMessage.Range;

                /**
                 * Creates a plain object from a Range message. Also converts values to other types if specified.
                 * @param message Range
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: vco.v3.SyncMessage.Range, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Range to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Range
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}
