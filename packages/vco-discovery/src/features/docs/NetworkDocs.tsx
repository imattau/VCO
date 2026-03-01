import React from 'react';
import { BookOpen, Hash, ShieldAlert, Code, CheckCircle2, FileText, Share2, Layers } from 'lucide-react';

export default function NetworkDocs() {
  const sections = [
    {
      title: "Decentralized Indexing",
      icon: <Hash className="text-blue-500" />,
      content: "VCO uses KeywordIndex schemas to map human-readable search terms to Content Identifiers (CIDs). These indices are cryptographically signed and stored in distributed DHT-like caches across the relay network.",
      example: "vco://schemas/index/keyword/v1"
    },
    {
      title: "Verifiable Reporting",
      icon: <ShieldAlert className="text-red-500" />,
      content: "Content moderation is handled through signed Report schemas. Reports include proof-of-harm, severity hints, and the reporter's cryptographic signature, enabling decentralized trust scores and relay-level filtering.",
      example: "vco://schemas/social/report/v1"
    },
    {
      title: "Admission Policies",
      icon: <CheckCircle2 className="text-emerald-500" />,
      content: "Relays broadcast their capabilities using RelayAdmissionPolicy schemas. This allows clients to find nodes matching their required Proof-of-Work difficulty, size limits, and security requirements.",
      example: "vco://schemas/network/policy/v1"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-4">
        <div className="inline-flex bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20 mb-2">
          <BookOpen className="text-blue-500 w-10 h-10" />
        </div>
        <h3 className="text-5xl font-black text-white tracking-tighter">Network Protocol Docs</h3>
        <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
          Deep dive into the schemas and protocols powering decentralized discovery and moderation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, i) => (
          <div key={i} className="group relative bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl space-y-6 hover:border-zinc-700 transition-all duration-300 hover:translate-y-[-8px]">
             <div className="bg-zinc-950 p-4 rounded-3xl shadow-inner border border-zinc-800 group-hover:bg-zinc-900 group-hover:border-blue-500/20 transition-all">
                {section.icon}
             </div>
             <h4 className="text-xl font-black text-white tracking-tight uppercase tracking-widest">{section.title}</h4>
             <p className="text-zinc-500 text-sm leading-relaxed font-medium">{section.content}</p>
             <div className="pt-4 border-t border-zinc-800 space-y-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Schema URI</span>
                <code className="text-[10px] font-mono text-blue-400 bg-blue-400/5 px-2 py-1 rounded-md block border border-blue-400/10">
                   {section.example}
                </code>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 overflow-hidden relative shadow-2xl">
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 blur-3xl -z-10 rounded-full"></div>
         
         <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="space-y-6 flex-1">
               <div className="inline-flex bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Architecture Overview
               </div>
               <h4 className="text-4xl font-black text-white tracking-tight">The Federated Discovery Layer</h4>
               <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                  Discovery doesn't rely on a single central server. Instead, relays cooperate by re-broadcasting 
                  keyword indices and reports according to their individual admission policies. 
               </p>
               <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                     <Share2 className="text-zinc-700 w-5 h-5" />
                     <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Federated</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Layers className="text-zinc-700 w-5 h-5" />
                     <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Layered</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <ShieldAlert className="text-zinc-700 w-5 h-5" />
                     <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Signed</span>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 w-full bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-800 shadow-inner group">
               <div className="flex items-center justify-between mb-8">
                  <Code className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                  <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                  </div>
               </div>
               <div className="font-mono text-[11px] space-y-1.5">
                  <p className="text-zinc-500">// Discovery Protocol Interface</p>
                  <p className="text-blue-400">interface <span className="text-white">RelayAdmissionPolicy</span> &#123;</p>
                  <p className="pl-4 text-zinc-300">minPowDifficulty: <span className="text-amber-400">number</span>;</p>
                  <p className="pl-4 text-zinc-300">acceptedTypes: <span className="text-amber-400">number[]</span>;</p>
                  <p className="pl-4 text-zinc-300">maxSize: <span className="text-amber-400">bigint</span>;</p>
                  <p className="pl-4 text-zinc-300">supportsBlindRouting: <span className="text-emerald-400">boolean</span>;</p>
                  <p className="text-blue-400">&#125;</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
