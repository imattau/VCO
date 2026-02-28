// packages/vco-simulator/src/features/simulator/ObjectFactory.tsx
import { useState } from "react";
import { useIdentity } from "../identity/IdentityContext.js";
import { buildListing } from "../../lib/vco.js";
import { globalWire, log } from "../../lib/simulator.js";
import { Badge } from "../../components/ui/Badge.js";
import { Activity, Shield, Cpu } from "lucide-react";

export function ObjectFactory() {
  const { identity } = useIdentity();
  const [busy, setBusy] = useState(false);
  const [lastObject, setLastObject] = useState<any>(null);

  const createDummyObject = async () => {
    if (!identity) return;
    setBusy(true);
    log("system", "Factory: Starting object creation sequence...");
    
    try {
      const listing = await buildListing({
        title: "Simulated Item",
        description: "Created in the protocol simulator",
        priceSats: 1000n
      }, identity);
      
      setLastObject(listing);
      log("object", `New Listing created: ${listing.id.slice(0, 16)}...`, listing);
      globalWire.broadcast(listing);
    } finally {
      setBusy(false);
    }
  };

  const tamperObject = () => {
    if (!lastObject) return;
    log("system", "TAMPER: Flipping 4th bit of the header_hash...");
    const tamperedId = lastObject.id.slice(0, 3) + 'f' + lastObject.id.slice(4);
    setLastObject({ ...lastObject, id: tamperedId });
    
    log("transport", `Relay: Received envelope ${tamperedId.slice(0, 8)}`, null, 300);
    log("transport", `CRITICAL: Hash mismatch detected. Expected Blake3(header) == ${tamperedId.slice(0, 8)}`, null, 600);
    log("system", `REJECTED: Object ${tamperedId.slice(0, 8)} dropped by relay due to integrity failure.`, null, 900);
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-tighter">
            <Activity size={14} className="text-emerald-500" />
            Configurator
          </div>
          <Badge variant="default">Listing v1</Badge>
        </div>
        
        <div className="space-y-4">
           <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-500 italic">
             // Metadata is automatically attached<br/>
             // PoW Difficulty set to 4
           </div>
           
           <button 
             disabled={busy || !identity}
             onClick={createDummyObject}
             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
           >
             {busy ? "Hashing & Signing..." : <><Shield size={16} /> Sign & Broadcast</>}
           </button>
        </div>
      </div>

      {lastObject && (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-tighter">
            <Cpu size={14} className="text-blue-500" />
            Verifiable Structure
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-black rounded-lg border border-zinc-800 font-mono text-[10px] space-y-2">
              <div>
                <span className="text-emerald-500">header_hash:</span>
                <span className="text-zinc-300 break-all ml-2">{lastObject.id}</span>
              </div>
              <div>
                <span className="text-blue-400">pow_score:</span>
                <span className="text-zinc-300 ml-2">{lastObject.powScore} bits</span>
              </div>
              <div>
                <span className="text-purple-400">creator_id:</span>
                <span className="text-zinc-300 break-all ml-2">{lastObject.authorId}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
               <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border border-zinc-700">View Payload</button>
               <button onClick={tamperObject} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all border border-red-900/30">Tamper Bit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
