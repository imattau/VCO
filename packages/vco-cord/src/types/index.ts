// packages/vco-cord/src/types/index.ts

export interface Identity {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  creatorId: Uint8Array;
  displayName: string;
}

export interface VcoMessage {
  id: string;               // headerHash hex
  channelId: string;
  authorId: string;         // creatorId hex
  authorName: string;
  content: string;
  timestamp: number;
  powScore: number;
  flags: number;
  rawEnvelope: Uint8Array;  // full encoded envelope for inspector
  verified: boolean;        // validateEnvelope passed
  tampered: boolean;        // validateEnvelope threw
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  serverId: string;
}

export interface Server {
  id: string;
  name: string;
  acronym: string;
  color: string;            // tailwind bg class e.g. "bg-indigo-600"
  channels: Channel[];
}
