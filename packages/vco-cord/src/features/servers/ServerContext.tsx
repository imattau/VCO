// packages/vco-cord/src/features/servers/ServerContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Server, Channel } from "../../types/index.js";

const SEED_SERVERS: Server[] = [
  {
    id: "vco-general",
    name: "VCO Protocol",
    acronym: "VCO",
    color: "bg-indigo-600",
    channels: [
      { id: "vco-general-general", name: "general", description: "General VCO discussion", serverId: "vco-general" },
      { id: "vco-general-dev", name: "dev", description: "Protocol development", serverId: "vco-general" },
      { id: "vco-general-pow", name: "pow-showcase", description: "Proof-of-Work demos", serverId: "vco-general" },
    ],
  },
  {
    id: "crypto-guild",
    name: "Crypto Guild",
    acronym: "CG",
    color: "bg-emerald-600",
    channels: [
      { id: "crypto-guild-lobby", name: "lobby", description: "Welcome channel", serverId: "crypto-guild" },
      { id: "crypto-guild-zkp", name: "zkp-lab", description: "Zero-knowledge proofs", serverId: "crypto-guild" },
    ],
  },
];

interface ServerCtx {
  servers: Server[];
  activeServer: Server;
  activeChannel: Channel;
  setActiveServer: (id: string) => void;
  setActiveChannel: (id: string) => void;
}

const Ctx = createContext<ServerCtx | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [activeServerId, setActiveServerId] = useState(SEED_SERVERS[0]!.id);
  const [activeChannelId, setActiveChannelId] = useState(SEED_SERVERS[0]!.channels[0]!.id);

  const activeServer = SEED_SERVERS.find((s) => s.id === activeServerId) ?? SEED_SERVERS[0]!;
  const allChannels = SEED_SERVERS.flatMap((s) => s.channels);
  const activeChannel = allChannels.find((c) => c.id === activeChannelId) ?? activeServer.channels[0]!;

  const setActiveServer = (id: string) => {
    const server = SEED_SERVERS.find((s) => s.id === id);
    if (server) {
      setActiveServerId(id);
      setActiveChannelId(server.channels[0]!.id);
    }
  };

  return (
    <Ctx.Provider value={{ servers: SEED_SERVERS, activeServer, activeChannel, setActiveServer, setActiveChannel: setActiveChannelId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useServers(): ServerCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useServers requires ServerProvider");
  return ctx;
}
