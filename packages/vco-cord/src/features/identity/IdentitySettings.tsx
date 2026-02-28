// packages/vco-cord/src/features/identity/IdentitySettings.tsx
import { useState } from "react";
import { useIdentity } from "./IdentityContext.js";
import { Modal } from "../../components/ui/Modal.js";
import { uint8ArrayToHex } from "../../lib/vco.js";
import { Copy, Eye, EyeOff, RefreshCw, Key, Shield } from "lucide-react";

export function IdentitySettings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { identity, regenerate, updateName } = useIdentity();
  const [showPriv, setShowPriv] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!identity) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Settings">
      <div className="space-y-6 pb-2">
        {/* Profile Section */}
        <section>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Display Name</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={identity.displayName}
              onChange={(e) => updateName(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </section>

        {/* Public Identity Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-zinc-400" />
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Public Identity</label>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded p-3 space-y-3">
             <div>
               <label className="text-[10px] text-zinc-500 block uppercase mb-1">Creator ID (Multikey)</label>
               <div className="flex items-center gap-2">
                 <code className="text-xs text-zinc-300 break-all bg-zinc-950 p-1 rounded flex-1">
                   {uint8ArrayToHex(identity.creatorId)}
                 </code>
                 <button onClick={() => copy(uint8ArrayToHex(identity.creatorId), 'cid')} className="text-zinc-500 hover:text-zinc-300">
                   <Copy size={14} />
                 </button>
               </div>
             </div>
             <div>
               <label className="text-[10px] text-zinc-500 block uppercase mb-1">Public Key (ED25519)</label>
               <div className="flex items-center gap-2">
                 <code className="text-xs text-zinc-300 break-all bg-zinc-950 p-1 rounded flex-1">
                   {uint8ArrayToHex(identity.publicKey)}
                 </code>
                 <button onClick={() => copy(uint8ArrayToHex(identity.publicKey), 'pub')} className="text-zinc-500 hover:text-zinc-300">
                   <Copy size={14} />
                 </button>
               </div>
             </div>
          </div>
        </section>

        {/* Private Keys Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Key size={14} className="text-red-400/70" />
            <label className="text-xs font-bold text-red-400/70 uppercase tracking-wider">Secret Key</label>
          </div>
          <div className="bg-zinc-900 border border-red-900/20 rounded p-3">
            <div className="flex items-center justify-between mb-1">
               <label className="text-[10px] text-zinc-500 uppercase">Master Private Key</label>
               <button onClick={() => setShowPriv(!showPriv)} className="text-[10px] text-indigo-400 hover:text-indigo-300 uppercase flex items-center gap-1">
                 {showPriv ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
               </button>
            </div>
            <div className="flex items-center gap-2">
               <code className={`text-xs p-1 rounded flex-1 break-all ${showPriv ? 'bg-zinc-950 text-red-400/90' : 'bg-zinc-950 text-zinc-800 select-none'}`}>
                 {showPriv ? uint8ArrayToHex(identity.privateKey) : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
               </code>
               {showPriv && (
                 <button onClick={() => copy(uint8ArrayToHex(identity.privateKey), 'priv')} className="text-zinc-500 hover:text-red-400 transition-colors">
                   <Copy size={14} />
                 </button>
               )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 italic">Keep this secret. Anyone with this key can impersonate you.</p>
          </div>
        </section>

        {/* Actions Section */}
        <section className="pt-2 border-t border-zinc-700">
          <button 
            onClick={() => { if(confirm("This will permanently delete your current identity and generate a new one. Continue?")) regenerate(); }}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/20 border border-zinc-700 hover:border-red-900/30 rounded transition-all"
          >
            <RefreshCw size={14} />
            Rotate Identity
          </button>
        </section>
      </div>
      {copied && (
        <div className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 text-xs text-white px-3 py-2 rounded shadow-xl animate-in fade-in slide-in-from-bottom-2">
          Copied {copied === 'cid' ? 'Creator ID' : copied === 'pub' ? 'Public Key' : 'Private Key'} to clipboard!
        </div>
      )}
    </Modal>
  );
}
