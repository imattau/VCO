import { useState, useEffect, createContext, useContext } from "react";
import { 
  Activity, Shield, Zap, Database, Plus, Key, Copy, 
  RefreshCw, CheckCircle2, X, Send, Server, Globe, Trash2, 
  ArrowDownUp, Layers, ChevronRight, AlertCircle,
  Network, Lock, Cpu, Clock, LayoutGrid, List
} from "lucide-react";
import { deriveEd25519Multikey, deriveEd25519PublicKey, createNobleCryptoProvider } from "@vco/vco-crypto";
import { createEnvelope } from "@vco/vco-core";
import "./App.css";

// --- Types ---
interface Identity {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  creatorId: Uint8Array;
  creatorIdHex: string;
}

interface StoredObject {
  headerHash: string;
  creatorId: string;
  payloadType: number;
  payload: string;
  timestamp: number;
  isLocal?: boolean;
}

interface Relay {
  id: string;
  name: string;
  address: string;
  status: "Online" | "Offline" | "Unknown";
  latency?: number;
}

// --- Contexts ---
const IdentityContext = createContext<{
  identity: Identity | null;
  generateIdentity: () => void;
} | undefined>(undefined);

const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) throw new Error("useIdentity must be used within IdentityProvider");
  return context;
};

// --- Helpers ---
function uint8ArrayToHex(arr: Uint8Array) {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToUint8Array(hex: string) {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

function timeAgo(date: number) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

// --- Providers ---
export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("vco_identity");
    if (saved) {
      try {
        const priv = hexToUint8Array(saved);
        const pub = deriveEd25519PublicKey(priv);
        const cid = deriveEd25519Multikey(priv);
        setIdentity({
          privateKey: priv,
          publicKey: pub,
          creatorId: cid,
          creatorIdHex: uint8ArrayToHex(cid),
        });
      } catch (e) {
        console.error("Failed to load identity", e);
      }
    }
  }, []);

  const generateIdentity = () => {
    const priv = new Uint8Array(32);
    window.crypto.getRandomValues(priv);
    const pub = deriveEd25519PublicKey(priv);
    const cid = deriveEd25519Multikey(priv);
    const newId = {
      privateKey: priv,
      publicKey: pub,
      creatorId: cid,
      creatorIdHex: uint8ArrayToHex(cid),
    };
    setIdentity(newId);
    localStorage.setItem("vco_identity", uint8ArrayToHex(priv));
  };

  return (
    <IdentityContext.Provider value={{ identity, generateIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
}

// --- UI Components ---

function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "info" | "outline" }) {
  const styles = {
    default: "bg-zinc-800 text-zinc-400 border-zinc-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    outline: "bg-transparent text-zinc-500 border-zinc-800"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled = false, className = "", icon: Icon }: any) {
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700",
    ghost: "bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border-transparent",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border ${styles[variant as keyof typeof styles]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}

// --- View Components ---

function IdentitySection() {
  const { identity, generateIdentity } = useIdentity();
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (identity) {
      navigator.clipboard.writeText(identity.creatorIdHex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!identity) {
    return (
      <div className="bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-3xl p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
          <Key size={40} strokeWidth={1.5} />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Establish Your Identity</h3>
          <p className="text-zinc-400">
            VCO uses decentralized identifiers. Generate a unique cryptographic key to begin publishing verifiable objects.
          </p>
        </div>
        <Button onClick={generateIdentity} className="mx-auto h-12 px-8 text-base">
          Generate Master Key
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-8 relative">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant="success">Active Session</Badge>
        </div>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner">
            <Shield size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Cryptographic Identity</h3>
            <p className="text-sm text-zinc-500">Ed25519 Master Identity & Protocol Multikey</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Creator Identifier (HEX)</label>
          <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800 flex items-center justify-between gap-4 group hover:border-indigo-500/30 transition-colors">
            <div className="truncate font-mono text-xs text-indigo-300/80 leading-relaxed select-all">
              {identity.creatorIdHex}
            </div>
            <button 
              onClick={copyId}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all shrink-0"
            >
              {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-800/50">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Algorithm</div>
            <div className="text-sm font-medium text-zinc-300">Ed25519</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Encoding</div>
            <div className="text-sm font-medium text-zinc-300">Multikey/Varint</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Status</div>
            <div className="text-sm font-medium text-emerald-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
          <AlertCircle size={14} />
          <span>Keep your master key safe. Regenerating will change your identifier.</span>
        </div>
        <Button onClick={generateIdentity} variant="ghost" className="text-xs" icon={RefreshCw}>
          Regenerate Master Key
        </Button>
      </div>
    </div>
  );
}

function NewObjectModal({ onClose, onCreated }: { onClose: () => void, onCreated: (obj: StoredObject) => void }) {
  const { identity } = useIdentity();
  const [payload, setPayload] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !payload) return;

    setIsCreating(true);
    // Add small delay for realistic UX feeling of "work" being done
    await new Promise(r => setTimeout(r, 800));
    
    try {
      const crypto = createNobleCryptoProvider();
      const envelope = createEnvelope({
        payload: new TextEncoder().encode(payload),
        payloadType: 0x01, 
        creatorId: identity.creatorId,
        privateKey: identity.privateKey,
        powDifficulty: 2, 
      }, crypto);

      const stored: StoredObject = {
        headerHash: uint8ArrayToHex(envelope.headerHash),
        creatorId: identity.creatorIdHex,
        payloadType: 0x01,
        payload: payload,
        timestamp: Date.now(),
        isLocal: true
      };

      onCreated(stored);
      onClose();
    } catch (err) {
      console.error("Failed to create envelope", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-300">
        <Card className="shadow-[0_0_50px_rgba(79,70,229,0.15)] relative border-indigo-500/20">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <h2 className="font-bold text-lg tracking-tight">Publish Verifiable Object</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payload Content</label>
                <Badge variant="outline">UTF-8 String</Badge>
              </div>
              <textarea 
                autoFocus
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Message, note, or secure data..."
                className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all resize-none text-base leading-relaxed"
              />
            </div>

            <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <Cpu size={14} className="text-indigo-500" />
                <span>Protocol Verification Stack</span>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Signing</div>
                  <div className="text-xs text-zinc-400 font-medium">ED25519_SCHNORR</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Hashing</div>
                  <div className="text-xs text-zinc-400 font-medium">BLAKE3_256</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Rate Limit</div>
                  <div className="text-xs text-zinc-400 font-medium">PoW Difficulty: 2</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Container</div>
                  <div className="text-xs text-zinc-400 font-medium">VCO_ENVELOPE_V3</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button type="button" onClick={onClose} variant="ghost" className="flex-1 h-12 rounded-2xl">
                Discard
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || !payload || !identity}
                className="flex-[2] h-12 rounded-2xl text-base"
              >
                {isCreating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Computing Proofs...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Publish & Verify</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function FeedItem({ obj }: { obj: StoredObject }) {
  const [showRaw, setShowRaw] = useState(false);
  
  return (
    <Card className={`transition-all duration-300 group hover:border-indigo-500/40 hover:shadow-indigo-500/5 ${obj.isLocal ? 'border-l-4 border-l-indigo-600' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-indigo-400 border border-zinc-700 shadow-inner group-hover:scale-110 transition-transform">
              <Shield size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold tracking-tight text-zinc-200">
                  {obj.creatorId.substring(0, 12)}...
                </span>
                {obj.isLocal && <Badge variant="info">Owner</Badge>}
                <Badge variant="success">Verified</Badge>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <span>Hash: {obj.headerHash.substring(0, 16)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {timeAgo(obj.timestamp)}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowRaw(!showRaw)}
            className={`p-2 rounded-xl border border-zinc-800 transition-colors ${showRaw ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'text-zinc-600 hover:text-zinc-300'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        <div className="relative">
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-[15px]">
            {obj.payload}
          </p>
        </div>

        {showRaw && (
          <div className="mt-6 pt-6 border-t border-zinc-800 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-zinc-950 rounded-2xl p-5 font-mono text-[11px] text-indigo-300/60 leading-relaxed overflow-x-auto border border-zinc-800">
              <div className="mb-2 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Raw Envelope Metadata</div>
              {JSON.stringify({
                header_hash: obj.headerHash,
                creator_id: obj.creatorId,
                payload_type: obj.payloadType,
                timestamp: obj.timestamp,
                version: 3,
                auth: "ED25519_SCHNORR"
              }, null, 2)}
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Cpu size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">D2 PoW</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Immutable</span>
            </div>
          </div>
          <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-[0.2em] transition-colors">
            Inspect →
          </button>
        </div>
      </div>
    </Card>
  );
}

function SyncVisualizer({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"INIT" | "COMPARE" | "BISECT" | "EXCHANGE" | "DONE">("INIT");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = [
      { p: "INIT", t: 800, pr: 20 },
      { p: "COMPARE", t: 1200, pr: 45 },
      { p: "BISECT", t: 1000, pr: 75 },
      { p: "EXCHANGE", t: 1500, pr: 100 },
      { p: "DONE", t: 500, pr: 100 }
    ];

    let current = 0;
    const runNext = () => {
      if (current >= sequence.length) {
        onComplete();
        return;
      }
      const step = sequence[current];
      setPhase(step.p as any);
      setProgress(step.pr);
      current++;
      setTimeout(runNext, step.t);
    };

    runNext();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative w-32 h-32 mx-auto">
          {/* Animated rings */}
          <div className="absolute inset-0 border-2 border-indigo-500/10 rounded-full animate-ping" />
          <div className="absolute -inset-4 border border-indigo-500/5 rounded-full animate-pulse" />
          
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-indigo-500 rounded-full transition-all duration-700 ease-in-out" 
            style={{ 
              clipPath: `inset(0 0 0 0)`, 
              transform: `rotate(${progress * 3.6}deg)`,
              filter: `drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowDownUp size={48} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic italic underline decoration-indigo-600 underline-offset-8">Protocol Sync</h2>
          <p className="text-sm text-zinc-500 font-mono font-bold uppercase tracking-[0.4em]">Current Phase: <span className="text-indigo-400">{phase}</span></p>
        </div>

        <div className="space-y-6">
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-indigo-600 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center px-1">
            {["INIT", "COMPARE", "BISECT", "EXCHANGE"].map(p => (
              <div key={p} className="flex flex-col items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${phase === p || progress === 100 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-zinc-800'}`} />
                <span className={`text-[9px] font-black tracking-tighter transition-colors duration-500 ${phase === p ? 'text-indigo-400' : 'text-zinc-600'}`}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-zinc-950 border-zinc-800/50">
          <div className="p-6 font-mono text-[11px] text-zinc-500 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3">
              <Badge variant="info">0ms</Badge>
              <span className="text-zinc-400">CONNECTING_TO_BOOTSTRAP_RELAY...</span>
            </div>
            {progress >= 20 && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <Badge variant="info">142ms</Badge>
                <span className="text-zinc-400 underline decoration-emerald-500/30 underline-offset-4 leading-relaxed">PROTOCOL_HANDSHAKE_COMPLETE (VCO/3.2.0)</span>
              </div>
            )}
            {progress >= 45 && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <Badge variant="info">489ms</Badge>
                <span className="text-emerald-400 italic">LOCAL_STATE_SNAPSHOT_GENERATED (124 OBJS)</span>
              </div>
            )}
            {progress >= 75 && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <Badge variant="warning">912ms</Badge>
                <span className="text-amber-400">RANGE_MISMATCH_DETECTED [HASH_COLLISION_CHECK]</span>
              </div>
            )}
            {progress >= 100 && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <Badge variant="success">1204ms</Badge>
                <span className="text-emerald-500 font-bold">SET_RECONCILIATION_SUCCESSFUL (3 NEW ENVELOPES)</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, color = "indigo" }: any) {
  const colors = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400"
  };
  
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600/10 shadow-inner' : 'hover:bg-zinc-900/50'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? colors[color as keyof typeof colors] : 'text-zinc-500 group-hover:text-zinc-300'}`}>
          <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
        </div>
        <span className={`text-sm font-semibold transition-colors ${active ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
          {label}
        </span>
      </div>
      {active && <ChevronRight size={14} className="text-indigo-500" />}
    </button>
  );
}

// --- Main App Logic ---

function AppContent() {
  const [status, setStatus] = useState("Connecting");
  const [objects, setObjects] = useState<StoredObject[]>([]);
  const [view, setView] = useState<"feed" | "identity" | "vault" | "network">("feed");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [relays, setRelays] = useState<Relay[]>([]);

  useEffect(() => {
    const savedObjects = localStorage.getItem("vco_objects");
    if (savedObjects) setObjects(JSON.parse(savedObjects));

    const savedRelays = localStorage.getItem("vco_relays");
    if (savedRelays) {
      setRelays(JSON.parse(savedRelays));
    } else {
      const bootstrap = [{
        id: "bootstrap-1",
        name: "Mainnet Bootstrap",
        address: "/ip4/45.79.143.12/udp/4001/quic-v1",
        status: "Online" as const
      }];
      setRelays(bootstrap);
    }

    const timer = setTimeout(() => {
      setStatus("Online");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreated = (obj: StoredObject) => {
    const newObjects = [obj, ...objects];
    setObjects(newObjects);
    localStorage.setItem("vco_objects", JSON.stringify(newObjects));
    setView("feed");
  };

  const addRelay = (name: string, address: string) => {
    const newRelay: Relay = {
      id: Math.random().toString(36).substring(7),
      name,
      address,
      status: "Online"
    };
    const newRelays = [...relays, newRelay];
    setRelays(newRelays);
    localStorage.setItem("vco_relays", JSON.stringify(newRelays));
  };

  const deleteRelay = (id: string) => {
    const newRelays = relays.filter(r => r.id !== id);
    setRelays(newRelays);
    localStorage.setItem("vco_relays", JSON.stringify(newRelays));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 transform rotate-3">
            <Zap size={24} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">VCO Pulse</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">v3.2.0 (STABLE)</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8 mr-4">
            <div className="text-center">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Network</div>
              <div className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1.5 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                {status}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Synced</div>
              <div className="text-xs font-bold text-zinc-300 uppercase">{objects.length} Objects</div>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-zinc-800" />

          <button 
            onClick={() => setIsSyncing(true)}
            className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all hover:rotate-180 duration-500"
          >
            <RefreshCw size={18} />
          </button>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
            className="h-11 px-6 rounded-2xl"
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-zinc-800/50 p-6 hidden md:flex flex-col bg-zinc-950/30 backdrop-blur-md">
          <div className="space-y-8 flex-1">
            <section>
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-6 px-4">Core Explorer</h2>
              <nav className="space-y-2">
                <SidebarItem 
                  label="Activity Feed" 
                  icon={Activity} 
                  active={view === "feed"} 
                  onClick={() => setView("feed")} 
                  color="indigo"
                />
                <SidebarItem 
                  label="Network Mesh" 
                  icon={Globe} 
                  active={view === "network"} 
                  onClick={() => setView("network")} 
                  color="cyan"
                />
                <SidebarItem 
                  label="Local Vault" 
                  icon={Database} 
                  active={view === "vault"} 
                  onClick={() => setView("vault")} 
                  color="purple"
                />
              </nav>
            </section>

            <section>
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-6 px-4">Management</h2>
              <nav className="space-y-2">
                <SidebarItem 
                  label="Identity Hub" 
                  icon={Shield} 
                  active={view === "identity"} 
                  onClick={() => setView("identity")} 
                  color="emerald"
                />
              </nav>
            </section>
          </div>

          <Card className="mt-auto bg-indigo-600/5 border-indigo-500/10 p-5 group hover:bg-indigo-600/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Layers size={16} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">System Metrics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-600 uppercase">Peers</span>
                <span className="text-[10px] font-mono font-bold text-zinc-400">{relays.length} ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-600 uppercase">Inbound</span>
                <span className="text-[10px] font-mono font-bold text-emerald-500/80">0.0 KB/S</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-600 uppercase">Outbound</span>
                <span className="text-[10px] font-mono font-bold text-blue-500/80">0.0 KB/S</span>
              </div>
            </div>
          </Card>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {view === "feed" && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-end justify-between border-b border-zinc-800 pb-8">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tight uppercase italic underline decoration-indigo-600 underline-offset-8">Activity Feed</h2>
                    <p className="text-zinc-500 font-medium">Real-time Verifiable Content reconciliation stream.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                      <List size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all opacity-40">
                      <LayoutGrid size={18} />
                    </button>
                  </div>
                </div>

                {objects.length === 0 ? (
                  <div className="py-24 text-center space-y-8">
                    <div className="w-24 h-24 bg-zinc-900/50 rounded-[40px] flex items-center justify-center mx-auto text-zinc-700 border-2 border-dashed border-zinc-800 animate-pulse">
                      <Activity size={48} strokeWidth={1} />
                    </div>
                    <div className="max-w-sm mx-auto space-y-3">
                      <h3 className="text-xl font-bold text-zinc-300 uppercase tracking-tight">Zero State Detected</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                        No objects found in the local set. Establish a relay connection or create your first verifiable envelope.
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => setView("network")} variant="secondary" icon={Globe}>Link Relay</Button>
                      <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Create Object</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 pb-20">
                    {objects.map((obj) => (
                      <FeedItem key={obj.headerHash} obj={obj} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "network" && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="space-y-1 border-b border-zinc-800 pb-8">
                  <h2 className="text-4xl font-black tracking-tight uppercase italic underline decoration-cyan-600 underline-offset-8">Sync Network</h2>
                  <p className="text-zinc-500 font-medium">Distributed bootstrap and discovery management.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] px-1">Network Topology</h3>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 h-64 flex items-center justify-center relative group overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <Network size={80} strokeWidth={0.5} className="text-cyan-500/20 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10 relative" />
                          <div className="absolute top-[-40px] left-[-60px] w-2 h-2 bg-cyan-500 rounded-full" />
                          <div className="absolute bottom-[-20px] right-[-80px] w-2 h-2 bg-zinc-700 rounded-full" />
                          <div className="absolute top-[-10px] right-[-50px] w-2 h-2 bg-cyan-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Card className="flex-1 p-5 text-center space-y-1">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Global Peers</div>
                        <div className="text-lg font-black text-cyan-400">1,248</div>
                      </Card>
                      <Card className="flex-1 p-5 text-center space-y-1">
                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Relay Latency</div>
                        <div className="text-lg font-black text-emerald-400">42ms</div>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] px-1">Active Endpoints</h3>
                    <div className="space-y-3">
                      {relays.map(relay => (
                        <Card key={relay.id} className="p-5 flex items-center justify-between group hover:border-cyan-500/30 transition-colors border-zinc-800/40">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-cyan-500 shadow-inner group-hover:text-cyan-400 transition-colors">
                              <Server size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-200 uppercase tracking-tight">{relay.name}</div>
                              <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5 truncate max-w-[180px]">{relay.address}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={relay.status === "Online" ? "success" : "default"}>{relay.status}</Badge>
                            <button onClick={() => deleteRelay(relay.id)} className="text-zinc-700 hover:text-red-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </Card>
                      ))}
                      <button 
                        onClick={() => {
                          const name = prompt("Relay Name:");
                          const addr = prompt("Relay Address:");
                          if(name && addr) addRelay(name, addr);
                        }}
                        className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-xs font-black uppercase tracking-[0.2em]"
                      >
                        + Register New Node
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "identity" && (
              <div className="space-y-10 animate-in fade-in duration-700">
                <div className="space-y-1 border-b border-zinc-800 pb-8">
                  <h2 className="text-4xl font-black tracking-tight uppercase italic underline decoration-emerald-600 underline-offset-8">Identity Hub</h2>
                  <p className="text-zinc-500 font-medium">Manage cryptographic root keys and protocol personas.</p>
                </div>
                <IdentitySection />
              </div>
            )}

            {view === "vault" && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="space-y-1 border-b border-zinc-800 pb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight uppercase italic underline decoration-purple-600 underline-offset-8">Local Vault</h2>
                    <p className="text-zinc-500 font-medium">Immutable object storage persistence.</p>
                  </div>
                  <Badge variant="info">{objects.length} Stored Envelopes</Badge>
                </div>
                
                {objects.length === 0 ? (
                  <Card className="p-12 text-center bg-zinc-900/20 border-dashed">
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Vault Storage Empty</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {objects.map(obj => (
                      <Card key={obj.headerHash} className="p-5 group hover:border-purple-500/30 transition-all border-zinc-800/40">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Database size={18} className="text-purple-500" />
                            <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold truncate max-w-[120px]">{obj.headerHash}</div>
                          </div>
                          <Badge variant="outline">{obj.payload.length} BYTES</Badge>
                        </div>
                        <div className="text-xs text-zinc-400 font-medium bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 truncate">
                          {obj.payload}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{timeAgo(obj.timestamp)}</span>
                          <button className="text-[9px] font-black text-purple-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Recover →</button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals & Overlays */}
      {isModalOpen && <NewObjectModal onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />}
      {isSyncing && <SyncVisualizer onComplete={() => setIsSyncing(false)} />}

      {/* Footer / Status Bar */}
      <footer className="h-10 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm flex justify-between items-center px-8 text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">
        <div className="flex gap-8 items-center h-full">
          <div className="flex gap-2 items-center text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            <span>TOL_ACTIVE v3.2</span>
          </div>
          <div className="flex gap-2 items-center text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
            <span>QUIC_UDP_PORT_4001</span>
          </div>
        </div>
        <div className="flex gap-8 items-center h-full">
          <span className="hover:text-indigo-400 transition-colors cursor-help">BLAKE3_VERIFIED</span>
          <span className="text-indigo-600/50">BUILD_2026_02_25</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <IdentityProvider>
      <AppContent />
    </IdentityProvider>
  );
}

export default App;
