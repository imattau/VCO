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
  ArrowRightLeft,
  Plus,
  Unplug,
  Activity
} from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { twMerge } from 'tailwind-merge';
import { NetworkService, NetworkStats } from '../../lib/NetworkService';
import { NodeClient } from '../../lib/NodeClient';
import { KeyringService } from '../../lib/KeyringService';
import { vcoStore } from '../../lib/VcoStore';
import { SwarmPulse } from '../../components/SwarmPulse';

export function SettingsView() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [dialAddr, setDialAddr] = useState('');
  const [stats, setStats] = useState<NetworkStats>({
    peerId: null,
    multiaddrs: [],
    peers: [],
    connections: [],
    isReady: false
  });

  useEffect(() => {
    NetworkService.startPolling(setStats);
    
    const cleanup = NodeClient.getInstance().onEvent((event) => {
      if (event.type === 'dial_success') {
        toast(`Successfully connected to: ${event.addr}`, "success");
      } else if (event.type === 'error' && event.message.includes('dial')) {
        toast(`Failed to dial: ${event.message}`, "error");
      }
    });

    return () => {
      NetworkService.stopPolling();
      cleanup();
    };
  }, [toast]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialAddr.trim()) return;
    NodeClient.getInstance().dial(dialAddr.trim());
    toast(`Dialing swarm address...`, "info");
    setDialAddr('');
  };

  const handleExportIdentity = async () => {
    const pkg = await KeyringService.exportEncryptedPackage();
    if (pkg) {
      navigator.clipboard.writeText(pkg);
      toast("Encrypted identity package copied to clipboard", "success");
    }
  };

  const handleWipe = async () => {
    if (confirm("CRITICAL: This will permanently delete your identity and all local data from this device. Are you sure?")) {
      KeyringService.revokeIdentity();
      await vcoStore.clearAll();
      window.location.reload();
    }
  };

  // Improved status calculation
  const hasSwarmConn = stats.peers.length > 0;
  const networkStatus = !stats.isReady ? "OFFLINE" : (hasSwarmConn ? "ACTIVE" : "CONNECTING");
  const reachability = hasSwarmConn ? "PUBLIC_SWARM" : "LOCAL_ONLY";

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000 pb-24 md:pb-20 px-2 md:px-0">
      <div className="space-y-2 mb-6 md:mb-10">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase">Node Settings</h2>
        <p className="text-zinc-500 text-base md:text-xl font-medium">Control your decentralized bridge to the VCO swarm.</p>
      </div>

      {/* Swarm Pulse - Visible on mobile only here */}
      <div className="md:hidden bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
         <SwarmPulse />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
         {/* Network Identity */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4">
               <div className="bg-blue-600/10 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-blue-500/20 shrink-0">
                  <Shield className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
               </div>
               <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest italic">Swarm Identity</h3>
            </div>

            <div className="space-y-4 md:space-y-6">
               <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Local Peer ID</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-inner overflow-hidden">
                     <code className="text-[10px] md:text-xs text-zinc-400 font-mono truncate mr-2">{stats.peerId || "Node not responding..."}</code>
                     <button onClick={() => copyToClipboard(stats.peerId || "")} className="text-zinc-600 hover:text-blue-500 transition-colors shrink-0">
                        {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                     </button>
                  </div>
               </div>

               <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Observed Multiaddress</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-inner overflow-hidden">
                     <code className="text-[10px] md:text-xs text-zinc-400 font-mono truncate mr-2">{stats.multiaddrs[0] || "Identifying interfaces..."}</code>
                     <button onClick={() => copyToClipboard(stats.multiaddrs[0] || "")} className="text-zinc-600 hover:text-blue-500 transition-colors shrink-0">
                        {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                     </button>
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <button className="w-full bg-zinc-800 hover:bg-zinc-750 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border border-zinc-700 shadow-xl flex items-center justify-center gap-2 md:gap-3">
                  <RefreshCw size={12} />
                  Reset Transport Protocol
               </button>
            </div>
         </div>

         {/* Sync Health - Verification Fixes applied here */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="bg-emerald-600/10 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-emerald-500/20 shrink-0">
                  <Wifi className="text-emerald-500 w-5 h-5 md:w-6 md:h-6" />
               </div>
               <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest italic">Sync Health</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 md:p-6 shadow-inner space-y-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol</span>
                  <div className="text-base md:text-xl font-black text-emerald-500 italic">Hybrid-v3</div>
               </div>
               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 md:p-6 shadow-inner space-y-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">DHT Peers</span>
                  <div className="text-base md:text-xl font-black text-white italic">{stats.peers.length}</div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between text-[10px] md:text-xs font-bold px-2">
                  <span className="text-zinc-500 uppercase tracking-widest">Network Status</span>
                  <span className={twMerge(
                    networkStatus === "ACTIVE" ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {networkStatus}
                  </span>
               </div>
               <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div className={twMerge(
                    "h-full transition-all duration-1000", 
                    networkStatus === "ACTIVE" ? "bg-emerald-500 w-full" : 
                    networkStatus === "CONNECTING" ? "bg-amber-500 w-1/3 animate-pulse" : "bg-zinc-800 w-0"
                  )} />
               </div>
               
               <div className="flex items-center justify-between text-[10px] md:text-xs font-bold px-2 pt-2">
                  <span className="text-zinc-500 uppercase tracking-widest">Swarm Reachability</span>
                  <span className={hasSwarmConn ? "text-blue-500" : "text-zinc-600"}>{reachability}</span>
               </div>
               <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div className={twMerge(
                    "h-full transition-all duration-1000 bg-blue-500", 
                    hasSwarmConn ? "w-[80%]" : "w-[10%] bg-zinc-800"
                  )} />
               </div>
            </div>
         </div>

         {/* Active Connections */}
         <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="bg-amber-600/10 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-amber-500/20 shrink-0">
                     <Globe className="text-amber-500 w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest italic">Swarm Mesh</h3>
               </div>
               
               <form onSubmit={handleDial} className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={dialAddr}
                    onChange={e => setDialAddr(e.target.value)}
                    placeholder="Enter Multiaddress..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-mono text-zinc-300 w-full sm:w-64 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
                     Dial Peer
                  </button>
               </form>
            </div>

            <div className="space-y-2 md:space-y-3">
               {stats.connections.length > 0 ? stats.connections.map((conn, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 md:p-5 bg-zinc-950 border border-zinc-800 rounded-2xl md:rounded-[2rem] group hover:border-zinc-700 transition-all shadow-inner overflow-hidden">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                       <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                          <Server size={16} />
                       </div>
                       <div className="min-w-0">
                          <div className="font-bold text-white text-xs md:text-sm truncate">Peer: {conn.remotePeer}</div>
                          <div className="text-[9px] md:text-[10px] text-zinc-600 font-mono truncate">{conn.remoteAddr}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                       {conn.tags.includes("connected") && (
                         <div className="hidden sm:block px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                            Active
                         </div>
                       )}
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                 </div>
               )) : (
                 <div className="py-8 md:py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl md:rounded-[2rem] space-y-3 md:space-y-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700">
                       <Unplug size={20} />
                    </div>
                    <div className="text-center px-4">
                       <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] md:text-xs">No active connections</p>
                       <p className="text-zinc-700 text-[9px] md:text-[10px] italic mt-1">Dial a bootstrap relay or wait for incoming peer syncs.</p>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Recovery & Security */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-8 md:space-y-10 shadow-2xl overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-zinc-800 to-red-500" />
         
         <div className="flex items-center gap-4">
            <div className="bg-red-600/10 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-red-500/20 shrink-0">
               <Zap className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest italic">Recovery & Security</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 md:space-y-4">
               <h4 className="text-base md:text-lg font-bold text-white">Export Identity</h4>
               <p className="text-zinc-500 text-xs md:text-sm">Copy your encrypted identity package. You can use this string to recover your account on another device if you have your password.</p>
               <button 
                 onClick={handleExportIdentity}
                 className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border border-zinc-700 shadow-lg"
               >
                  <Copy size={12} />
                  Copy Encrypted Package
               </button>
            </div>

            <div className="space-y-3 md:space-y-4">
               <h4 className="text-base md:text-lg font-bold text-red-500">Wipe All Data</h4>
               <p className="text-zinc-500 text-xs md:text-sm">Revoke your identity and wipe all synced objects, messages, and profiles from this device.</p>
               <button 
                 onClick={handleWipe}
                 className="flex items-center gap-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border border-red-500/20 shadow-lg"
               >
                  <Unplug size={12} />
                  Revoke & Wipe Device
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
