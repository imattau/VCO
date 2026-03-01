import React, { useState } from 'react';
import { ShieldAlert, Info, CheckCircle2, AlertCircle, Loader2, Target, MessageCircle, MoreVertical } from 'lucide-react';
import { useDiscovery } from '@/features/discovery/DiscoveryContext';
import { DiscoveryService } from '@/lib/discovery';
import { ReportReason } from '@vco/vco-schemas';

export default function ReportForm() {
  const [targetCid, setTargetCid] = useState('');
  const [reason, setReason] = useState<number>(ReportReason.SPAM);
  const [severity, setSeverity] = useState<'critical' | 'high' | 'standard'>('standard');
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { submitReport } = useDiscovery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!DiscoveryService.isValidCid(targetCid)) {
      setError('Invalid Content Identifier format.');
      return;
    }
    
    setStatus('submitting');
    
    try {
      // Simulate cryptographic signing delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Create a simulated CID from input
      const bytes = new TextEncoder().encode(targetCid.padEnd(32, '0')).slice(0, 32);
      
      await submitReport({
        targetCid: bytes,
        reason,
        detail,
      });
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
      setTargetCid('');
      setDetail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-3">
        <label htmlFor="target-cid" className="text-xs font-black text-zinc-500 flex items-center gap-2 uppercase tracking-widest cursor-pointer">
          <Target size={14} className="text-blue-500" />
          Target Content Identifier (CID)
          <Info size={12} className="text-zinc-700 ml-auto" />
        </label>
        <div className="relative group">
          <input
            id="target-cid"
            type="text"
            value={targetCid}
            onChange={(e) => setTargetCid(e.target.value)}
            placeholder="e.g. vco-core-spec-v3"
            className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-lg text-white font-mono placeholder-zinc-700 group-hover:border-zinc-700 shadow-inner"
            required
          />
        </div>
        {error && (
          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <label htmlFor="report-reason" className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
            <ShieldAlert size={14} className="text-red-500" />
            Report Reason
          </label>
          <div className="relative group">
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(Number(e.target.value))}
              className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none cursor-pointer text-sm font-black text-white group-hover:border-zinc-700 shadow-inner"
            >
              <option value={ReportReason.SPAM}>SPAM / FLAMING</option>
              <option value={ReportReason.VIOLENCE}>VIOLENT CONTENT</option>
              <option value={ReportReason.HARASSMENT}>PERSONAL HARASSMENT</option>
              <option value={ReportReason.MALWARE}>MALWARE / PHISHING</option>
              <option value={ReportReason.MISINFORMATION}>MISINFORMATION</option>
            </select>
            <MoreVertical size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-300 pointer-events-none transition-colors" aria-hidden="true" />
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Report Priority</label>
          <div className="flex gap-2 h-[58px]">
             {(['critical', 'high', 'standard'] as const).map((p) => (
               <button
                key={p}
                type="button"
                onClick={() => setSeverity(p)}
                className={`flex-1 border p-2.5 rounded-2xl flex items-center justify-center text-center transition-all ${
                  severity === p 
                    ? p === 'critical' ? 'bg-red-600/20 border-red-500 ring-1 ring-red-500 shadow-lg shadow-red-600/20' : 
                      p === 'high' ? 'bg-amber-600/20 border-amber-500 ring-1 ring-amber-500 shadow-lg shadow-amber-600/20' :
                      'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500 shadow-lg shadow-blue-600/20'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:bg-zinc-900 hover:border-zinc-700 shadow-inner'
                }`}
               >
                 <span className={`font-black text-[9px] uppercase tracking-widest ${
                   severity === p 
                    ? p === 'critical' ? 'text-red-400' : p === 'high' ? 'text-amber-400' : 'text-blue-400'
                    : 'text-zinc-600'
                 }`}>
                   {p}
                 </span>
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="report-detail" className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
           <MessageCircle size={14} className="text-zinc-600" />
           Evidence & Detail
        </label>
        <textarea
          id="report-detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Describe the violation in detail for the network moderator..."
          rows={5}
          className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-white placeholder-zinc-700 group-hover:border-zinc-700 shadow-inner"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-2xl active:translate-y-1 ${
          status === 'submitting' 
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
            : status === 'success'
              ? 'bg-emerald-600 shadow-emerald-600/20'
              : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          {status === 'submitting' ? (
             <Loader2 className="animate-spin" size={18} />
          ) : status === 'success' ? (
             <CheckCircle2 size={18} />
          ) : status === 'error' ? (
             <AlertCircle size={18} />
          ) : (
             <ShieldAlert size={18} />
          )}
          {status === 'submitting' ? 'Cryptographic Signing...' : 
           status === 'success' ? 'Report Broadcasted' :
           status === 'error' ? 'Submission Failed' :
           'Submit Signed Report'}
        </div>
      </button>
      
      {status === 'success' && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-2xl flex items-start gap-4 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
             <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-1">
             <p className="font-black text-emerald-400 uppercase tracking-widest text-xs">Cryptographic Success</p>
             <p className="opacity-80 leading-relaxed">The report has been hashed, signed by your local node, and successfully broadcasted to the discovery relay pool.</p>
          </div>
        </div>
      )}
    </form>
  );
}
