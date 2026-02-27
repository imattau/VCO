// packages/vco-cord/src/features/servers/ServerList.tsx
import { useServers } from "./ServerContext.js";
import { clsx } from "clsx";
import { Tooltip } from "../../components/ui/Tooltip.js";

export function ServerList() {
  const { servers, activeServer, setActiveServer } = useServers();
  return (
    <div className="w-16 bg-zinc-950 flex flex-col items-center py-3 gap-2 shrink-0">
      {servers.map((s) => (
        <Tooltip key={s.id} text={s.name}>
          <button
            onClick={() => setActiveServer(s.id)}
            className={clsx(
              "w-12 h-12 rounded-2xl font-bold text-white text-sm transition-all",
              s.color,
              activeServer.id === s.id ? "rounded-xl" : "hover:rounded-xl opacity-80 hover:opacity-100",
            )}
          >
            {s.acronym}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
