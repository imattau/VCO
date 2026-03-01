import React, { useState, useEffect } from 'react';
import { DiscoveryService } from '@/lib/discovery';
import { LayoutGrid, Globe, Zap, Maximize, Share2, Activity, Server, SignalHigh, SignalMedium, SignalLow } from 'lucide-react';

interface Node {
  id: string;
  region: string;
  latency: number;
  policy: {
    minPowDifficulty: number;
    maxEnvelopeSize: number;
    supportsBlindRouting: boolean;
  }
}

export default function BrowseNodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      const data = await DiscoveryService.getNodes();
      setNodes(data);
      setIsLoading(false);
    };
    fetchNodes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Activity className="animate-spin text-blue-500 w-12 h-12 mb-4" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Scanning Network Topology...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <LayoutGrid className="text-blue-500 w-8 h-8" />
          Browse Active Nodes
        </h3>
        <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
          Discover federated relays across the network. Nodes are listed with their unique admission policies and current network performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map((node) => (
          <div key={node.id} className="group relative bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-600/5 hover:translate-y-[-4px]">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <Server size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg text-white tracking-tight">{node.id}</h4>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                    <Globe size={12} />
                    {node.region}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800">
                {node.latency < 100 ? <SignalHigh className="text-emerald-500 w-3 h-3" /> : 
                 node.latency < 200 ? <SignalMedium className="text-amber-500 w-3 h-3" /> : 
                 <SignalLow className="text-red-500 w-3 h-3" />}
                <span className="text-[10px] font-black text-zinc-400">{node.latency}ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 space-y-1">
                 <div className="flex items-center gap-1.5 text-zinc-600">
                   <Zap size={12} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Min Difficulty</span>
                 </div>
                 <p className="text-sm font-black text-zinc-300">{node.policy.minPowDifficulty} bits</p>
              </div>
              <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 space-y-1">
                 <div className="flex items-center gap-1.5 text-zinc-600">
                   <Maximize size={12} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Max Envelope</span>
                 </div>
                 <p className="text-sm font-black text-zinc-300">{(node.policy.maxEnvelopeSize / 1024 / 1024).toFixed(1)}MB</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${node.policy.supportsBlindRouting ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                   {node.policy.supportsBlindRouting ? 'Blind Routing Active' : 'Context-Aware Only'}
                 </span>
               </div>
               <button className="bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:translate-y-0.5">
                  Peer Connect
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
