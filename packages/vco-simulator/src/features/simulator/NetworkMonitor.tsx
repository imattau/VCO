// packages/vco-simulator/src/features/simulator/NetworkMonitor.tsx
import { useState, useEffect, useRef } from "react";
import { globalWire, NetworkEvent } from "../../lib/simulator.js";
import { Wifi, Radio, Box, Zap } from "lucide-react";

export function NetworkMonitor() {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: NetworkEvent) => {
      setEvents((prev) => [...prev, event].slice(-50)); // Keep last 50
    };

    globalWire.addListener(listener);
    return () => globalWire.removeListener(listener);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const getIcon = (type: NetworkEvent["type"]) => {
    switch (type) {
      case "system": return <Radio size={12} className="text-zinc-500" />;
      case "transport": return <Wifi size={12} className="text-blue-400" />;
      case "object": return <Box size={12} className="text-emerald-400" />;
      case "sync": return <Zap size={12} className="text-yellow-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px]">
        {events.map((e) => (
          <div key={e.id} className="flex gap-3 group animate-in fade-in slide-in-from-right-2">
            <span className="text-zinc-700 shrink-0">{new Date(e.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <div className="flex items-center gap-2">
              {getIcon(e.type)}
              <span className={`
                ${e.type === 'system' ? 'text-zinc-500' : ''}
                ${e.type === 'transport' ? 'text-blue-400/80' : ''}
                ${e.type === 'object' ? 'text-emerald-500/80 font-bold' : ''}
                ${e.type === 'sync' ? 'text-yellow-500/80' : ''}
              `}>
                {e.message}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 shrink-0">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Channels</span>
            <span className="text-[10px] font-bold text-zinc-600 font-mono">ID: 12D3K...</span>
         </div>
         <div className="flex gap-2">
            <div className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-[10px] text-zinc-400 font-bold">/vco/sync/v3</div>
            <div className="px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-[10px] text-zinc-400 font-bold">/vco/relay/bootstrap</div>
         </div>
      </div>
    </div>
  );
}
