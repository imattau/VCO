import React, { useState, useEffect } from 'react';
import { DiscoveryService } from '@/lib/discovery';
import { ReportData, ReportReason } from '@vco/vco-schemas';
import { Bell, ShieldAlert, Activity, AlertTriangle, CheckCircle, BarChart3, Fingerprint } from 'lucide-react';

export default function AlertsDashboard() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [reputation, setReputation] = useState(82); // Mock starting reputation
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await DiscoveryService.getReports();
      setReports(data.reverse()); // Newest first
      
      // Dynamic reputation calculation based on reports
      const impact = data.length * 2.5;
      setReputation(Math.max(0, 82 - impact));
      
      setIsLoading(false);
    };
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Activity className="animate-spin text-red-500 w-12 h-12 mb-4" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Aggregating Global Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Bell className="text-red-500 w-8 h-8" />
            Alerts & Reputation
          </h3>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
            Monitor content violations across the relay pool and track the cryptographic reputation score of local and remote nodes.
          </p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center gap-6 shadow-2xl">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block text-right">Node Reputation</span>
              <div className="flex items-center gap-3">
                 <span className={`text-4xl font-black italic tracking-tighter ${reputation > 70 ? 'text-emerald-500' : reputation > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                   {reputation.toFixed(1)}%
                 </span>
                 <BarChart3 className="text-zinc-700" size={24} />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-red-500" />
                 Recent Network Reports
              </h4>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{reports.length} Signals Captured</span>
           </div>

           <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 border-dashed p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-50 grayscale">
                   <CheckCircle className="text-emerald-500 w-12 h-12 mb-4" />
                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No active violations reported</p>
                </div>
              ) : (
                reports.map((report, i) => (
                  <div key={i} className="group bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] shadow-xl hover:border-red-500/20 transition-all animate-in slide-in-from-left-4 duration-300">
                     <div className="flex items-start gap-5">
                        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-red-500 shadow-inner group-hover:bg-red-600 group-hover:text-white transition-all">
                           <ShieldAlert size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-2">
                              <h5 className="font-black text-sm text-white tracking-wide uppercase">Reason: {ReportReason[report.reason]}</h5>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{new Date(Number(report.timestampMs)).toLocaleString()}</span>
                           </div>
                           <p className="text-zinc-500 text-xs font-mono truncate mb-3">Target CID: {DiscoveryService.formatCid(report.targetCid)}</p>
                           <p className="text-zinc-400 text-sm font-medium leading-relaxed italic border-l-2 border-zinc-800 pl-4 py-1">
                              "{report.detail || 'No additional context provided.'}"
                           </p>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <Fingerprint size={14} className="text-blue-500" />
              Reputation Mechanics
           </h4>
           <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -z-10 rounded-full"></div>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Signer Veracity</span>
                    <span className="text-xs font-black text-emerald-500">98%</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                    <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Relay Uptime</span>
                    <span className="text-xs font-black text-blue-500">72.4h</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                    <div className="h-full bg-blue-500 w-[85%] shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Spam Ratio</span>
                    <span className="text-xs font-black text-red-500">2.1%</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                    <div className="h-full bg-red-500 w-[12%] shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                 </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                 <div className="bg-blue-600/5 border border-blue-600/10 p-4 rounded-2xl">
                    <p className="text-[10px] text-blue-400 font-medium leading-relaxed flex items-start gap-2 italic">
                       <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                       "Reputation is recalculated every epoch (2048 blocks) based on report accuracy and node behavior."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
