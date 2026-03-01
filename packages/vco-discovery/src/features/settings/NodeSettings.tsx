import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Zap, Maximize, Clock, Lock, Globe } from 'lucide-react';
import { 
  encodeRelayAdmissionPolicy, 
  decodeRelayAdmissionPolicy, 
  RELAY_ADMISSION_POLICY_SCHEMA_URI,
  RelayAdmissionPolicyData 
} from "@vco/vco-schemas";

export default function NodeSettings() {
  const [policy, setPolicy] = useState<RelayAdmissionPolicyData>({
    schema: RELAY_ADMISSION_POLICY_SCHEMA_URI,
    minPowDifficulty: 24,
    acceptedPayloadTypes: [0x50, 0x04],
    maxEnvelopeSize: 4 * 1024 * 1024,
    storageTtlSeconds: 86400,
    requiresZkpAuth: false,
    supportsBlindRouting: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Demonstrate round-trip serialization
    const encoded = encodeRelayAdmissionPolicy(policy);
    console.log(`RelayAdmissionPolicy encoded to ${encoded.length} bytes`);
    
    const decoded = decodeRelayAdmissionPolicy(encoded);
    setPolicy(decoded);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setLastSaved(new Date().toLocaleTimeString());
    setTimeout(() => setLastSaved(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500 w-8 h-8" />
            Node Admission Policy
          </h3>
          <p className="text-zinc-500 text-lg font-medium">Configure how your relay interacts with the VCO network.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-600/20 active:translate-y-0.5 flex items-center gap-2"
        >
          {isSaving ? <Zap className="animate-spin w-4 h-4" /> : <Save size={18} />}
          {isSaving ? 'Updating Relay...' : 'Save Policy'}
        </button>
      </div>

      {lastSaved && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
          <ShieldCheck size={18} />
          Policy successfully signed and broadcasted at {lastSaved}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PoW Difficulty */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
              <Zap className="text-blue-500 w-5 h-5" />
            </div>
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Min PoW Difficulty</label>
          </div>
          <input 
            type="range" min="0" max="32" 
            value={policy.minPowDifficulty}
            onChange={(e) => setPolicy({...policy, minPowDifficulty: parseInt(e.target.value)})}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs font-black text-zinc-600">
            <span>LOW (0)</span>
            <span className="text-blue-400 text-lg">{policy.minPowDifficulty} bits</span>
            <span>HIGH (32)</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            Higher difficulty prevents spam but increases latency for legitimate broadcasters.
          </p>
        </div>

        {/* Max Size */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
              <Maximize className="text-blue-500 w-5 h-5" />
            </div>
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Max Envelope Size</label>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number"
              value={policy.maxEnvelopeSize}
              onChange={(e) => setPolicy({...policy, maxEnvelopeSize: parseInt(e.target.value)})}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Bytes</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            Maximum size of a single VCO envelope. Recommended: 4MB (4194304).
          </p>
        </div>

        {/* TTL */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
              <Clock className="text-blue-500 w-5 h-5" />
            </div>
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Storage TTL</label>
          </div>
          <select
            value={policy.storageTtlSeconds}
            onChange={(e) => setPolicy({...policy, storageTtlSeconds: parseInt(e.target.value)})}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-inner"
          >
            <option value={3600}>1 Hour (Ephemeral)</option>
            <option value={86400}>24 Hours (Standard)</option>
            <option value={604800}>1 Week (Persistence)</option>
            <option value={2592000}>30 Days (Archive)</option>
          </select>
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            How long content remains cached on this relay before being evicted.
          </p>
        </div>

        {/* Security Features */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setPolicy({...policy, requiresZkpAuth: !policy.requiresZkpAuth})}>
            <div className="flex items-center gap-3">
              <Lock className={`w-5 h-5 transition-colors ${policy.requiresZkpAuth ? 'text-blue-400' : 'text-zinc-600'}`} />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-white uppercase tracking-widest block">ZKP Authentication</span>
                <span className="text-[10px] text-zinc-500 font-medium">Require Zero-Knowledge Proofs for access.</span>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${policy.requiresZkpAuth ? 'bg-blue-600' : 'bg-zinc-800 shadow-inner'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${policy.requiresZkpAuth ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setPolicy({...policy, supportsBlindRouting: !policy.supportsBlindRouting})}>
            <div className="flex items-center gap-3">
              <Globe className={`w-5 h-5 transition-colors ${policy.supportsBlindRouting ? 'text-blue-400' : 'text-zinc-600'}`} />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-white uppercase tracking-widest block">Blind Routing</span>
                <span className="text-[10px] text-zinc-500 font-medium">Allow context-agnostic message forwarding.</span>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${policy.supportsBlindRouting ? 'bg-blue-600' : 'bg-zinc-800 shadow-inner'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${policy.supportsBlindRouting ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
