import React, { useState, useEffect } from 'react';
import { DiscoveryService } from '@/lib/discovery';
import { useDiscovery } from '@/features/discovery/DiscoveryContext';
import { FileText, ShieldAlert, CheckCircle2, ChevronRight, Hash, Database, Clock, Loader2 } from 'lucide-react';

export default function SearchResults() {
  const { results, search, isSearching } = useDiscovery();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (results !== null || isSearching) {
      setHasSearched(true);
    }
  }, [results, isSearching]);

  if (!hasSearched) return (
     <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
        <div className="bg-zinc-800/30 p-10 rounded-full border-4 border-dashed border-zinc-800 mb-6 group hover:border-blue-500/50 transition-colors">
           <Database className="w-16 h-16 text-zinc-600 group-hover:text-blue-500/50 transition-colors" />
        </div>
        <p className="text-xl font-black text-zinc-500 uppercase tracking-widest italic mb-8">Idle Index Searcher</p>
        
        <div className="flex flex-col items-center gap-4">
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Quick Search Suggestions</span>
           <div className="flex gap-2">
              {['vco-protocol', 'core-spec', 'manifest-v3'].map(term => (
                <button 
                  key={term}
                  onClick={() => search(term)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 transition-all hover:bg-blue-600/5 shadow-inner"
                >
                  {term}
                </button>
              ))}
           </div>
        </div>
     </div>
  );

  if (isSearching) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-20 rounded-3xl shadow-2xl flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Accessing Distributed Index...</p>
      </div>
    );
  }

  if (!results || results.entries.length === 0) return (
    <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
       <ShieldAlert className="text-zinc-700 w-12 h-12 mx-auto" />
       <h3 className="text-xl font-black text-zinc-400 tracking-tight uppercase">No Results Found</h3>
       <p className="text-zinc-600 text-sm font-medium max-w-sm mx-auto">
          The network index for this keyword is currently empty or has not been propagated to your local relay node yet.
       </p>
       <button 
         onClick={() => setHasSearched(false)}
         className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:text-blue-400 transition-colors pt-2"
       >
         Back to suggestions
       </button>
    </div>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-8 mb-8">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
             <Hash className="text-blue-500 w-6 h-6" />
             Keyword Index for <span className="text-blue-400 font-black italic">"{results.keyword}"</span>
          </h3>
          <p className="text-zinc-500 text-sm font-medium">Results aggregated from local relay and federated caches.</p>
        </div>
        <span className="text-xs bg-blue-600/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">{results.entries.length} Nodes Found</span>
      </div>
      
      <div className="grid gap-6">
        {results.entries.map((entry, i) => (
          <div key={i} className="group relative bg-zinc-950/30 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/30 p-6 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px] overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
            
            <div className="flex items-center gap-6">
              <div className="bg-zinc-900 text-zinc-500 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-blue-600/20">
                <FileText size={32} />
              </div>
              
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-xl text-white truncate tracking-tight">CID: {DiscoveryService.formatCid(entry.cid)}</h4>
                  {entry.weight && entry.weight >= 0.9 && (
                    <span className="flex items-center gap-1.5 text-[10px] bg-emerald-600/10 text-emerald-500 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                    Weight: <span className="text-zinc-300">{entry.weight ?? '0.00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                    Indexed: <span className="text-zinc-300">{new Date(Number(entry.indexedAtMs ?? 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                  className="bg-zinc-900 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-2xl border border-zinc-800 hover:border-red-500/20 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Report content CID ${DiscoveryService.formatCid(entry.cid)}`}
                  title="Report Content"
                >
                  <ShieldAlert size={20} />
                </button>
                <div className="bg-zinc-800 w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                   <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 p-6 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
         <p className="text-sm text-blue-400 font-medium text-center italic">
            "Keyword indices are cryptographically bound to the content and the relay that indexes them."
         </p>
      </div>
    </div>
  );
}

// Activity icon for list items
function Activity({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
