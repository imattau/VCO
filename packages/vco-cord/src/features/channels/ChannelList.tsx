// packages/vco-cord/src/features/channels/ChannelList.tsx
import { useState } from "react";
import { Hash, Settings } from "lucide-react";
import { useServers } from "../servers/ServerContext.js";
import { useIdentity } from "../identity/IdentityContext.js";
import { clsx } from "clsx";
import { Avatar } from "../../components/ui/Avatar.js";
import { uint8ArrayToHex } from "../../lib/vco.js";
import { IdentitySettings } from "../identity/IdentitySettings.js";

export function ChannelList() {
  const { activeServer, activeChannel, setActiveChannel } = useServers();
  const { identity } = useIdentity();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-56 bg-zinc-800 flex flex-col shrink-0">
      {/* Server header */}
      <div className="px-4 py-3 border-b border-zinc-700 font-semibold text-white truncate">
        {activeServer.name}
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-2">Channels</span>
        </div>
        {activeServer.channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={clsx(
              "w-full flex items-center gap-1.5 px-3 py-1.5 rounded mx-1 text-sm transition-colors",
              activeChannel.id === ch.id
                ? "bg-zinc-600 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700",
            )}
          >
            <Hash size={14} className="shrink-0" />
            {ch.name}
          </button>
        ))}
      </div>

      {/* Identity footer */}
      {identity && (
        <div className="p-2 bg-zinc-900 flex items-center gap-2">
          <Avatar name={identity.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{identity.displayName}</div>
            <div className="text-xs text-zinc-500 truncate font-mono">
              {uint8ArrayToHex(identity.creatorId).slice(0, 10)}…
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)} 
            className="text-zinc-500 hover:text-zinc-300 transition-colors" 
            title="User Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      )}
      <IdentitySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
