import { useState, useEffect, createContext, useContext } from "react";
import { 
  Activity, Shield, Zap, Database, Search, Plus, Key, Copy, 
  RefreshCw, CheckCircle2, X, Send, Server, Globe, Trash2, 
  ArrowDownUp, Layers, Check
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

// --- Components ---

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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto text-blue-400">
          <Key size={24} />
        </div>
        <div>
          <h3 className="text-lg font-medium">No Identity Found</h3>
          <p className="text-sm text-zinc-500 mt-1">
            You need a cryptographic identity to sign and verify objects on the VCO network.
          </p>
        </div>
        <button 
          onClick={generateIdentity}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
        >
          Generate New Identity
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-900/20 rounded-lg flex items-center justify-center text-green-400 border border-green-900/30">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Active Identity</h3>
            <p className="text-xs text-zinc-500">Ed25519 Multikey</p>
          </div>
        </div>
        <button 
          onClick={generateIdentity}
          className="text-zinc-500 hover:text-zinc-300 p-2 transition-colors"
          title="Regenerate Identity"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 flex items-center justify-between gap-3 group">
        <div className="truncate font-mono text-xs text-zinc-400 select-all">
          {identity.creatorIdHex}
        </div>
        <button 
          onClick={copyId}
          className="text-zinc-500 hover:text-blue-400 transition-colors shrink-0"
        >
          {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>

      <div className="flex gap-2 text-[10px] text-zinc-500">
        <span className="bg-zinc-800 px-1.5 py-0.5 rounded">PUBLIC</span>
        <span className="bg-zinc-800 px-1.5 py-0.5 rounded">VERIFIED</span>
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
    try {
      const crypto = createNobleCryptoProvider();
      const envelope = createEnvelope({
        payload: new TextEncoder().encode(payload),
        payloadType: 0x01, // Plain text
        creatorId: identity.creatorId,
        privateKey: identity.privateKey,
        powDifficulty: 2, // Small PoW for UI feedback
      }, crypto);

      const stored: StoredObject = {
        headerHash: uint8ArrayToHex(envelope.headerHash),
        creatorId: identity.creatorIdHex,
        payloadType: 0x01,
        payload: payload,
        timestamp: Date.now(),
      };

      onCreated(stored);
      onClose();
    } catch (err) {
      console.error("Failed to create envelope", err);
      alert("Error creating object: " + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-lg">Create Verifiable Object</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Content</label>
            <textarea 
              autoFocus
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="What would you like to verify today?"
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <Shield size={14} />
              <span>Protocol Metadata</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-600">AUTH MODE:</span>
                <span className="text-zinc-400 ml-2">ED25519_SIG</span>
              </div>
              <div>
                <span className="text-zinc-600">POW:</span>
                <span className="text-zinc-400 ml-2">D2 (SOLVE ON SUBMIT)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isCreating || !payload || !identity}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Solving PoW...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Publish Object</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RelaySection({ relays, onAdd, onDelete }: { 
  relays: Relay[], 
  onAdd: (name: string, addr: string) => void,
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState("");
  const [addr, setAddr] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Server size={18} className="text-blue-400" />
            Configured Relays
          </h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors"
          >
            {isAdding ? "Cancel" : "Add Relay"}
          </button>
        </div>

        {isAdding && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <input 
              placeholder="Relay Name (e.g. Bootstrap-1)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <input 
              placeholder="Multiaddr (e.g. /ip4/1.2.3.4/udp/4001/quic-v1)"
              value={addr}
              onChange={e => setAddr(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={() => {
                if (name && addr) {
                  onAdd(name, addr);
                  setName("");
                  setAddr("");
                  setIsAdding(false);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Save Relay
            </button>
          </div>
        )}

        <div className="space-y-2">
          {relays.length === 0 ? (
            <p className="text-center py-8 text-zinc-500 text-sm">No relays configured. Add one to start syncing.</p>
          ) : (
            relays.map(relay => (
              <div key={relay.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${relay.status === "Online" ? "bg-green-500" : "bg-zinc-600"}`} />
                  <div>
                    <div className="text-sm font-medium">{relay.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[240px]">{relay.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{relay.status}</span>
                  <button 
                    onClick={() => onDelete(relay.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-blue-900/30 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-blue-500 rounded-full transition-all duration-500" 
            style={{ clipPath: `inset(0 0 0 0)`, transform: `rotate(${progress * 3.6}deg)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowDownUp size={32} className="text-blue-400 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Syncing with Relay</h2>
          <p className="text-sm text-zinc-500 font-mono uppercase tracking-[0.2em]">Protocol Phase: {phase}</p>
        </div>

        <div className="space-y-4">
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold">
            <span className={phase === "INIT" ? "text-blue-400" : ""}>INIT</span>
            <span className={phase === "COMPARE" ? "text-blue-400" : ""}>COMPARE</span>
            <span className={phase === "BISECT" ? "text-blue-400" : ""}>BISECT</span>
            <span className={phase === "EXCHANGE" ? "text-blue-400" : ""}>EXCHANGE</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left font-mono text-[10px] text-zinc-500 overflow-hidden">
          <div className="animate-pulse flex items-center gap-2">
            <Check size={10} className="text-green-500" />
            <span>OPEN_CHANNEL /vco/sync/3.2.0</span>
          </div>
          {progress > 30 && (
            <div className="animate-pulse flex items-center gap-2">
              <Check size={10} className="text-green-500" />
              <span>RANGE_PROOF_RECEIVED [0x00...0xFF]</span>
            </div>
          )}
          {progress > 70 && (
            <div className="animate-pulse flex items-center gap-2">
              <Check size={10} className="text-green-500" />
              <span>MERKLE_MISMATCH_FOUND @ 0x8A...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [status, setStatus] = useState("Online");
  const [peers, setPeers] = useState(0);
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
      setPeers(JSON.parse(savedRelays).length);
    } else {
      // Add a default bootstrap relay
      const bootstrap = [{
        id: "bootstrap-1",
        name: "Official Bootstrap",
        address: "/ip4/45.79.143.12/udp/4001/quic-v1",
        status: "Online" as const
      }];
      setRelays(bootstrap);
      setPeers(1);
    }

    const timer = setTimeout(() => {
      setStatus("Online");
    }, 1500);
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
    setPeers(newRelays.length);
    localStorage.setItem("vco_relays", JSON.stringify(newRelays));
  };

  const deleteRelay = (id: string) => {
    const newRelays = relays.filter(r => r.id !== id);
    setRelays(newRelays);
    setPeers(newRelays.length);
    localStorage.setItem("vco_relays", JSON.stringify(newRelays));
  };

  const triggerSync = () => {
    if (relays.length === 0) {
      alert("Please add a relay first.");
      return;
    }
    setIsSyncing(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">VCO Pulse</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={triggerSync}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 transition-colors group"
          >
            <div className={`w-2 h-2 rounded-full ${status === "Online" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-500"}`} />
            <span className="text-sm font-medium">{status}</span>
            <ArrowDownUp size={14} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
          </button>
          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <Search size={20} className="text-zinc-400" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={18} />
            <span>New Object</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 p-4 hidden md:flex flex-col gap-6 bg-zinc-900/20">
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">Monitor</h2>
            <nav className="space-y-1">
              <button 
                onClick={() => setView("feed")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${view === "feed" ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                <Activity size={18} className={view === "feed" ? "text-blue-400" : "group-hover:text-blue-400"} />
                <span>Activity Feed</span>
              </button>
              <button 
                onClick={() => setView("network")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${view === "network" ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                <Globe size={18} className={view === "network" ? "text-cyan-400" : "group-hover:text-cyan-400"} />
                <span>Sync Network</span>
              </button>
              <button 
                onClick={() => setView("identity")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${view === "identity" ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                <Shield size={18} className={view === "identity" ? "text-green-400" : "group-hover:text-green-400"} />
                <span>Identity</span>
              </button>
              <button 
                onClick={() => setView("vault")}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${view === "vault" ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}
              >
                <Database size={18} className={view === "vault" ? "text-purple-400" : "group-hover:text-purple-400"} />
                <span>Local Vault</span>
              </button>
            </nav>
          </section>

          <section className="mt-auto bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Layers size={14} className="text-blue-400" />
              Live Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Connected Peers</span>
                <span>{peers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Known Objects</span>
                <span>{objects.length}</span>
              </div>
            </div>
            <button 
              onClick={triggerSync}
              className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} />
              FORCE SYNC
            </button>
          </section>
        </aside>

        {/* Feed Content */}
        <section className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <div className="max-w-3xl mx-auto space-y-6">
            {view === "feed" && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Activity Feed</h2>
                  <select className="bg-zinc-900 border border-zinc-800 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Objects</option>
                    <option>Verified Only</option>
                    <option>My Objects</option>
                  </select>
                </div>

                {objects.length === 0 ? (
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                      <Activity size={32} className="text-zinc-600" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h3 className="text-lg font-medium">No activity yet</h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Connect to a bootstrap relay or create your first Verifiable Content Object to get started.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Create your first object
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {objects.map((obj) => (
                      <div key={obj.headerHash} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900 transition-colors animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-blue-400 border border-zinc-700">
                              <Shield size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold truncate max-w-[200px]">{obj.creatorId.substring(0, 16)}...</div>
                              <div className="text-[10px] text-zinc-500 font-mono">HEADER: {obj.headerHash.substring(0, 12)}...</div>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded-full border border-zinc-700 font-medium">
                            {new Date(obj.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{obj.payload}</p>
                        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-4 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1 text-green-500/80">
                            <CheckCircle2 size={12} /> VERIFIED
                          </span>
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded">TEXT/UTF-8</span>
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded">BLAKE3_HASH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {view === "network" && (
              <>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold">Sync Network</h2>
                  <p className="text-sm text-zinc-500 mt-1">Configure your bootstrap relays and sync endpoints.</p>
                </div>
                <RelaySection relays={relays} onAdd={addRelay} onDelete={deleteRelay} />
              </>
            )}

            {view === "identity" && (
              <>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold">Identity Manager</h2>
                  <p className="text-sm text-zinc-500 mt-1">Manage your cryptographic keys and protocol identifiers.</p>
                </div>
                <IdentitySection />
              </>
            )}

            {view === "vault" && (
              <>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold">Local Vault</h2>
                  <p className="text-sm text-zinc-500 mt-1">Total of {objects.length} stored envelopes on this device.</p>
                </div>
                {objects.length === 0 ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                    <p className="text-zinc-500">Your vault is currently empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {objects.map(obj => (
                      <div key={obj.headerHash} className="bg-zinc-900/30 border border-zinc-800 p-3 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Database size={16} className="text-purple-400 shrink-0" />
                          <div className="truncate font-mono text-xs text-zinc-500">{obj.headerHash}</div>
                        </div>
                        <div className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {obj.payload.length} BYTES
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Modals & Overlays */}
      {isModalOpen && <NewObjectModal onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />}
      {isSyncing && <SyncVisualizer onComplete={() => setIsSyncing(false)} />}

      {/* Footer / Status Bar */}
      <footer className="border-t border-zinc-800 p-2 bg-zinc-900/80 backdrop-blur-sm flex justify-between items-center text-[10px] text-zinc-500 px-4 uppercase tracking-widest font-bold">
        <div className="flex gap-4">
          <span>TOL v3.2.0</span>
          <span>QUIC ACTIVE</span>
        </div>
        <div className="flex gap-4">
          <span>NOISE_XX_25519</span>
          <span>DEV BUILD</span>
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
