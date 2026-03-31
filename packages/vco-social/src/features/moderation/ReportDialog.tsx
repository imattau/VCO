import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, MessageCircle, Bug, UserX } from 'lucide-react';
import { ReportReason } from '@vco/vco-schemas';
import { twMerge } from 'tailwind-merge';
import { useToast } from '../../components/ToastProvider';

interface ReportDialogProps {
  targetCid: Uint8Array;
  onClose: () => void;
  onReportPublished: (reason: number) => void;
}

export function ReportDialog({ targetCid, onClose, onReportPublished }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<number>(1); // Default to SPAM (1)
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const reasons = [
    { value: 1, label: 'Spam or Bot Activity', icon: <Bug size={18} /> },
    { value: 4, label: 'Malicious / Malware', icon: <AlertTriangle size={18} /> },
    { value: 3, label: 'Harassment', icon: <UserX size={18} /> },
    { value: 2, label: 'Violence', icon: <ShieldAlert size={18} /> },
    { value: 0, label: 'Other Concern', icon: <MessageCircle size={18} /> },
  ];

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate signing and publishing manifest
    await new Promise(r => setTimeout(r, 800));
    onReportPublished(selectedReason);
    setIsPublishing(false);
    toast("Verifiable report published to moderation nodes", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
           <div className="flex items-center gap-4">
              <div className="bg-red-600/10 p-3 rounded-2xl border border-red-600/20">
                 <ShieldAlert className="text-red-500 w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-black text-white tracking-tighter italic uppercase leading-none">Report Object</h2>
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Verifiable Moderation Manifest</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 text-zinc-500 hover:text-white transition-colors"
             aria-label="Close dialog"
           >
              <X size={20} />
           </button>
        </header>

        <div className="p-8 space-y-6">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Reason for reporting</label>
              <div className="grid grid-cols-1 gap-2">
                 {reasons.map((r) => (
                   <button
                     key={r.value}
                     onClick={() => setSelectedReason(r.value)}
                     className={twMerge(
                       "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                       selectedReason === r.value 
                         ? "bg-blue-600/10 border-blue-500/50 text-white shadow-lg shadow-blue-500/5" 
                         : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                     )}
                   >
                      <div className={twMerge(
                        "p-2 rounded-xl border transition-all",
                        selectedReason === r.value ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}>
                         {r.icon}
                      </div>
                      <span className="font-bold text-sm">{r.label}</span>
                      {selectedReason === r.value && (
                        <div className="ml-auto">
                           <CheckCircle2 size={18} className="text-blue-500" />
                        </div>
                      )}
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-inner">
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol Metadata</div>
              <div className="text-[10px] font-mono text-zinc-500 break-all leading-relaxed">
                 TARGET_CID: {Array.from(targetCid).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)}...
              </div>
           </div>
        </div>

        <footer className="p-8 bg-zinc-900/50 border-t border-zinc-800 flex gap-4">
           <button 
             onClick={onClose}
             className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
           >
              Cancel
           </button>
           <button 
             onClick={handlePublish}
             disabled={isPublishing}
             className="flex-[2] bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/10 active:translate-y-0.5 flex items-center justify-center gap-2"
           >
              {isPublishing ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Publishing Manifest...
                </>
              ) : (
                <>
                  <ShieldAlert size={16} />
                  Submit Verifiable Report
                </>
              )}
           </button>
        </footer>
      </div>
    </div>
  );
}

import { RefreshCw } from 'lucide-react';
