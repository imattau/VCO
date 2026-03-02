// packages/vco-cord/src/features/channels/ChannelList.tsx
import { useState } from "react";
import { Hash, Settings } from "lucide-react";
import { useServers } from "../servers/ServerContext.js";
import { useIdentity } from "../identity/IdentityContext.js";
import { Avatar } from "../../components/ui/Avatar.js";
import { uint8ArrayToHex } from "../../lib/vco.js";
import { IdentitySettings } from "../identity/IdentitySettings.js";
import { NavItem, Card } from "@vco/vco-ui";

export function ChannelList() {
  const { activeServer, activeChannel, setActiveChannel } = useServers();
  const { identity } = useIdentity();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-56 bg-zinc-800 flex flex-col shrink-0 border-r border-zinc-700">
      {/* Server header */}
      <div className="px-4 py-3 border-b border-zinc-700 font-semibold text-white truncate italic uppercase tracking-tighter">
        {activeServer.name}
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <div className="px-2 mb-2 mt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Channels</span>
        </div>
        {activeServer.channels.map((ch) => (
          <NavItem
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            active={activeChannel.id === ch.id}
            label={ch.name}
            icon={<Hash size={16} />}
            className="py-2 rounded-xl"
          />
        ))}
      </div>

      {/* Identity footer */}
      {identity && (
        <div className="p-2 bg-zinc-900 border-t border-zinc-700 shadow-2xl">
          <Card variant="nested" className="p-2 flex items-center gap-2 rounded-xl border-none">
            <Avatar name={identity.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black text-white truncate italic uppercase">{identity.displayName}</div>
              <div className="text-[9px] text-zinc-500 truncate font-mono">
                {uint8ArrayToHex(identity.creatorId).slice(0, 10)}…
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all" 
              title="User Settings"
            >
              <Settings size={14} />
            </button>
          </Card>
        </div>
      )}
      <IdentitySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
