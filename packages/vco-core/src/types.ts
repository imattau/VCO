export interface VcoHeader {
  version: number;
  flags: number;
  payloadType: number;
  creatorId: Uint8Array;
  payloadHash: Uint8Array;
  signature: Uint8Array;
  nonce: number;
}

export interface VcoZkpExtension {
  circuitId: number;
  proofLength: number;
  proof: Uint8Array;
  inputsLength: number;
  publicInputs: Uint8Array;
  nullifier: Uint8Array;
}

export interface VcoEnvelope {
  headerHash: Uint8Array;
  header: VcoHeader;
  payload: Uint8Array;
  zkpExtension?: VcoZkpExtension;
}
