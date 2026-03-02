import React, { useState, useEffect } from 'react';
import { useSocial } from '../SocialContext';
import { 
  Server, 
  Wifi, 
  Shield, 
  Globe, 
  Zap, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Settings as SettingsIcon,
  Database,
  ArrowRightLeft
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { twMerge } from 'tailwind-merge';
import { NetworkService, NetworkStats } from '../../lib/NetworkService';

export function SettingsView() {
  const { profile } = useSocial();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<NetworkStats>({
    peerId: null,
    multiaddrs: [],
    peers: [],
    isReady: false
  });

  useEffect(() => {
    NetworkService.startPolling(setStats);
    return () => NetworkService.stopPolling();
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="space-y-2 mb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Node Settings</h2>
        <p className="text-zinc-500 text-xl font-medium">Control your decentralized bridge to the VCO swarm.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Network Identity */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20">
                  <Shield className="text-blue-500 w-6 h-6" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Swarm Identity</h3>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Local Peer ID</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-inner">
                     <code className="text-xs text-zinc-400 font-mono truncate">{stats.peerId || "Node not responding..."}</code>
                     <button onClick={() => copyToClipboard(stats.peerId || "")} className="text-zinc-600 hover:text-blue-500 transition-colors">
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                     </button>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Observed Multiaddress</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-inner">
                     <code className="text-xs text-zinc-400 font-mono truncate">{stats.multiaddrs[0] || "Identifying interfaces..."}</code>
                     <button onClick={() => copyToClipboard(stats.multiaddrs[0] || "")} className="text-zinc-600 hover:text-blue-500 transition-colors">
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                     </button>
                  </div>
               </div>
            </div>

            <div className="pt-4">
               <button className="w-full bg-zinc-800 hover:bg-zinc-750 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-700 shadow-xl flex items-center justify-center gap-3">
                  <RefreshCw size={14} />
                  Reset Transport Protocol
               </button>
            </div>
         </div>

         {/* Connection Health */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="bg-emerald-600/10 p-4 rounded-3xl border border-emerald-500/20">
                  <Wifi className="text-emerald-500 w-6 h-6" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Sync Health</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-inner space-y-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol</span>
                  <div className="text-xl font-black text-emerald-500 italic">QUIC-v1</div>
               </div>
               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-inner space-y-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">DHT Peers</span>
                  <div className="text-xl font-black text-white italic">{stats.peers.length}</div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between text-xs font-bold px-2">
                  <span className="text-zinc-500 uppercase tracking-widest">Network Status</span>
                  <span className={stats.isReady ? "text-emerald-500" : "text-amber-500"}>
                    {stats.isReady ? "READY" : "CONNECTING"}
                  </span>
               </div>
               <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div className={twMerge("h-full transition-all duration-1000", stats.isReady ? "bg-emerald-500 w-full" : "bg-amber-500 w-1/3 animate-pulse")} />
               </div>
               
               <div className="flex items-center justify-between text-xs font-bold px-2 pt-2">
                  <span className="text-zinc-500 uppercase tracking-widest">DHT Reachability</span>
                  <span className="text-blue-500">{stats.peers.length > 0 ? "PUBLIC" : "LOCAL_ONLY"}</span>
               </div>
               <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div className={twMerge("h-full transition-all duration-1000 bg-blue-500", stats.peers.length > 0 ? "w-[80%]" : "w-[10%]")} />
               </div>
            </div>
         </div>

         {/* Bootstrap Relays */}
         <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="bg-amber-600/10 p-4 rounded-3xl border border-amber-500/20">
                     <Globe className="text-amber-500 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Bootstrap Relays</h3>
               </div>
               <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                  Add Relay
               </button>
            </div>

            <div className="space-y-3">
               {[
                 { name: "VCO Mainnet A", addr: "/dns4/relay-a.vco.network/tcp/443/wss/p2p/12D3...", status: "Connected" },
                 { name: "VCO Devnet Sydney", addr: "/ip4/45.79.143.12/udp/4001/quic-v1/p2p/Qm...", status: "Roaming" }
               ].map(relay => (
                 <div key={relay.name} className="flex items-center justify-between p-5 bg-zinc-950 border border-zinc-800 rounded-[2rem] group hover:border-zinc-700 transition-all shadow-inner">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                          <Server size={18} />
                       </div>
                       <div>
                          <div className="font-bold text-white text-sm">{relay.name}</div>
                          <div className="text-[10px] text-zinc-600 font-mono truncate max-w-xs md:max-w-md">{relay.addr}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${relay.status === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${relay.status === 'Connected' ? 'text-emerald-500' : 'text-amber-500'}`}>{relay.status}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
