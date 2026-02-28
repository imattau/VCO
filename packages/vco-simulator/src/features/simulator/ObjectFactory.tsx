// packages/vco-simulator/src/features/simulator/ObjectFactory.tsx
import { useState } from "react";
import { useIdentity } from "../identity/IdentityContext.js";
import { buildListing, buildZkpListing } from "../../lib/vco.js";
import { globalWire, log } from "../../lib/simulator.js";
import { Badge } from "../../components/ui/Badge.js";
import { Activity, Shield, Cpu, Trash2, Users, Ghost, Repeat } from "lucide-react";

export function ObjectFactory() {
  const { identity } = useIdentity();
  const [busy, setBusy] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [lastObject, setLastObject] = useState<any>(null);

  const createDummyObject = async () => {
    if (!identity) return;
    setBusy(true);
    log("system", `Factory: Starting ${isAnonymous ? 'ZKP-Auth' : 'Signature-Auth'} creation sequence...`);
    
    try {
      const listing = isAnonymous 
        ? await buildZkpListing({ title: "Anonymous Item", description: "Identity hidden by ZKP", priceSats: 500n })
        : await buildListing({ title: "Simulated Item", description: "Created in the protocol simulator", priceSats: 1000n }, identity);
      
      setLastObject(listing);
      log("object", `New ${isAnonymous ? 'Anonymous ' : ''}Listing created: ${listing.id.slice(0, 16)}...`, listing);
      
      if (isAnonymous) {
        log("transport", "Relay: Received anonymous envelope. Verifying ZKP (Circuit: 0x01)...", null, 400);
        log("transport", "Relay: Nullifier check (Unique). ZKP Valid. Admitting object.", null, 800);
      }
      
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

  const replayZkp = () => {
    if (!lastObject?.isZkp) return;
    log("system", "REPLAY: Re-sending same ZKP envelope to simulated network...");
    log("transport", `Relay: Received envelope ${lastObject.id.slice(0, 8)}`, null, 300);
    log("transport", `Relay: Nullifier Check (${lastObject.nullifier.slice(0, 12)}...)`, null, 600);
    log("system", "REJECTED: Nullifier already seen. Replay attack blocked.", null, 1000);
  };

  const launchSpamAttack = () => {
    globalWire.simulateSpam();
  };

  const broadcastToGroup = () => {
    log("system", "Factory: Encrypting payload for Group ID: 0x77...bb");
    log("object", "New Group Message created", { type: "GroupChat" });
    globalWire.broadcast({ id: "group_msg_" + Math.random().toString(36).slice(2, 8), powScore: 4 });
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-tighter">
            <Activity size={14} className="text-emerald-500" />
            Configurator
          </div>
          <Badge variant={isAnonymous ? "warning" : "default"}>{isAnonymous ? "ZKP-Auth v1" : "Listing v1"}</Badge>
        </div>
        
        <div className="space-y-4">
           <button 
             onClick={() => setIsAnonymous(!isAnonymous)}
             className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-[10px] font-black uppercase transition-all ${isAnonymous ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}`}
           >
             <Ghost size={14} /> {isAnonymous ? "Anonymous Mode: ON" : "Anonymous Mode: OFF"}
           </button>

           <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-500 italic">
             {isAnonymous ? (
               <>// creator_id and signature will be zeroed<br/>// ZKPExtension will be attached</>
             ) : (
               <>// Metadata is automatically attached<br/>// PoW Difficulty set to 4</>
             )}
           </div>
           
           <button 
             disabled={busy || !identity}
             onClick={createDummyObject}
             className={`w-full text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${isAnonymous ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/10' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10'}`}
           >
             {busy ? "Processing Proof..." : isAnonymous ? <><Ghost size={16} /> Post Anonymously</> : <><Shield size={16} /> Sign & Broadcast</>}
           </button>

           <div className="grid grid-cols-2 gap-2 mt-2">
             <button 
               onClick={launchSpamAttack}
               className="bg-zinc-900 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all border border-zinc-800 hover:border-red-900/30 text-[10px] uppercase tracking-widest"
             >
               <Trash2 size={12} /> Spam Attack
             </button>

             <button 
               disabled={!identity}
               onClick={broadcastToGroup}
               className="bg-zinc-900 hover:bg-indigo-950/20 text-zinc-500 hover:text-indigo-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all border border-zinc-800 hover:border-indigo-900/30 text-[10px] uppercase tracking-widest"
             >
               <Users size={12} /> Group Chat
             </button>
           </div>
        </div>
      </div>

      {lastObject && (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-tighter">
              <Cpu size={14} className="text-blue-500" />
              Verifiable Structure
            </div>
            {lastObject.isZkp && <Badge variant="warning">ZKP Active</Badge>}
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
                <span className={`break-all ml-2 ${lastObject.isZkp ? 'text-zinc-700' : 'text-zinc-300'}`}>{lastObject.authorId}</span>
              </div>
              {lastObject.isZkp && (
                <div className="pt-2 mt-2 border-t border-zinc-900">
                  <div className="text-orange-400 mb-1">zkp_extension: {'{'}</div>
                  <div className="ml-4"><span className="text-zinc-500">circuit_id:</span> <span className="text-zinc-300">1 (Membership)</span></div>
                  <div className="ml-4"><span className="text-zinc-500">nullifier:</span> <span className="text-zinc-300 break-all">{lastObject.nullifier}</span></div>
                  <div className="text-orange-400">{'}'}</div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
               {lastObject.isZkp ? (
                 <button onClick={replayZkp} className="flex-1 bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all border border-orange-900/30 flex items-center justify-center gap-2">
                   <Repeat size={12} /> Replay Attack
                 </button>
               ) : (
                 <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border border-zinc-700">View Payload</button>
               )}
               <button onClick={tamperObject} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all border border-red-900/30">Tamper Bit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
