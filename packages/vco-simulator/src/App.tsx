// packages/vco-simulator/src/App.tsx
import { useState } from "react";
import { IdentityProvider, useIdentity } from "./features/identity/IdentityContext.js";
import { Badge } from "./components/ui/Badge.js";
import { Avatar } from "./components/ui/Avatar.js";
import { uint8ArrayToHex } from "./lib/vco.js";

import { ObjectFactory } from "./features/simulator/ObjectFactory.js";
import { NetworkMonitor } from "./features/simulator/NetworkMonitor.js";
import { log, globalWire } from "./lib/simulator.js";

function Layout() {
  const { identity } = useIdentity();
  const [isTOL, setIsTOL] = useState(false);

  const resetNodes = () => {
    log("system", "Node Reset initiated. Clearing in-memory stores...");
    setTimeout(() => log("system", "Network topology restored. Peers: 2"), 500);
  };

  const toggleTOL = () => {
    const newState = !isTOL;
    setIsTOL(newState);
    globalWire.setObfuscation(newState);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">S</div>
          <h1 className="text-xl font-bold tracking-tight">VCO Protocol Simulator</h1>
          <Badge variant="success">Protocol v3</Badge>
        </div>
        
        {identity && (
          <div className="flex items-center gap-3 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-zinc-100 leading-none">{identity.displayName}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{uint8ArrayToHex(identity.creatorId).slice(0, 8)}</span>
            </div>
            <Avatar name={identity.displayName} size="sm" />
          </div>
        )}
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Object Factory */}
        <section className="flex-1 flex flex-col border-r border-zinc-800 bg-zinc-900/10">
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Object Factory</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
             <ObjectFactory />
          </div>
        </section>

        {/* Right Pane: Network Activity */}
        <section className="flex-1 flex flex-col bg-black/20">
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Network Activity</h2>
            <div className="flex gap-2 items-center">
               <button 
                 onClick={toggleTOL}
                 className={`px-3 py-1 rounded-full text-[10px] font-black transition-all border ${isTOL ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
               >
                 {isTOL ? "TOL: ON (Observer View)" : "TOL: OFF (Debug View)"}
               </button>
               <Badge variant="default">Nodes: 2</Badge>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
             <NetworkMonitor />
          </div>
        </section>
      </main>

      <footer className="px-6 py-2 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Simulator Status: <span className="text-emerald-500">Active</span></span>
        </div>
        <div className="flex gap-4">
          <button className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase font-bold transition-colors">Clear Logs</button>
          <button onClick={resetNodes} className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase font-bold transition-colors">Reset Nodes</button>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <IdentityProvider>
      <Layout />
    </IdentityProvider>
  );
}
