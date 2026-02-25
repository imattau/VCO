import { useState, useEffect, createContext, useContext } from "react";
import {
  Activity, Shield, Zap, Database, Plus, Key, Copy,
  RefreshCw, CheckCircle2, X, Send, Server, Globe, Trash2,
  ArrowDownUp, Layers, ChevronRight, AlertCircle,
  Network, Lock, Clock, LayoutGrid, List
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
    default: "bg-slate-800 text-slate-200 border-slate-700",
    success: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    outline: "bg-transparent text-slate-300 border-slate-700"
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-widest border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled = false, className = "", icon: Icon, type = "button" }: any) {
  const styles = {
    primary: "bg-orange-500 hover:bg-orange-400 text-white border-orange-500",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-200 hover:text-slate-100 border-transparent",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${styles[variant as keyof typeof styles]} ${className}`}
    >
      {Icon && <Icon size={16} />}
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
      <div className="border border-dashed border-slate-700 rounded-lg p-16 text-center space-y-8">
        <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center mx-auto text-teal-400">
          <Key size={32} strokeWidth={1.5} />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-display text-3xl font-bold tracking-tight text-slate-100 uppercase">Establish Your Identity</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            VCO uses decentralized identifiers. Generate a unique cryptographic key to begin publishing verifiable objects.
          </p>
        </div>
        <Button onClick={generateIdentity} className="mx-auto">
          Generate Master Key
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <Card className="p-8 relative">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant="success">Active Session</Badge>
        </div>
        <div className="flex items-center gap-5 mb-8">
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">
            <Shield size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-slate-100 uppercase">Cryptographic Identity</h3>
            <p className="text-sm text-slate-300 uppercase tracking-widest mt-0.5">Ed25519 Master Identity & Protocol Multikey</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Creator Identifier (HEX)</label>
          <div className="bg-slate-950 rounded border border-slate-700/60 p-4 flex items-center justify-between gap-4 group hover:border-teal-500/30 transition-colors">
            <div className="truncate font-mono text-sm text-teal-300/70 leading-relaxed select-all">
              {identity.creatorIdHex}
            </div>
            <button
              onClick={copyId}
              className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-all shrink-0"
            >
              {copied ? <CheckCircle2 size={14} className="text-teal-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Algorithm</div>
            <div className="text-xs text-slate-100">Ed25519</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Encoding</div>
            <div className="text-xs text-slate-100">Multikey/Varint</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</div>
            <div className="text-xs text-teal-400 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Verified
            </div>
          </div>
        </div>
      </Card>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <AlertCircle size={12} />
          <span>Keep your master key safe. Regenerating will change your identifier.</span>
        </div>
        <Button onClick={generateIdentity} variant="ghost" className="text-xs" icon={RefreshCw}>
          Regenerate
        </Button>
      </div>
    </div>
  );
}

// --- Constants ---
const VCO_TYPE_TEXT = 0x01;
const VCO_TYPE_MEDIA = 0x02;
const VCO_TYPE_MANIFEST = 0x03;

function NewPostModal({ onClose, onCreated }: { onClose: () => void, onCreated: (objs: StoredObject[]) => void }) {
  const { identity } = useIdentity();
  const [payload, setPayload] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [media, setMedia] = useState<{name: string, type: string, data: string}[]>([]);

  const addSimulatedMedia = () => {
    const types = ["image/jpeg", "image/png", "video/mp4"];
    const type = types[Math.floor(Math.random() * types.length)];
    const newMedia = {
      name: `attachment_${media.length + 1}.${type.split("/")[1]}`,
      type: type,
      data: `[SIMULATED_BINARY_DATA_FOR_${type.toUpperCase()}]`
    };
    setMedia([...media, newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !payload) return;

    setIsCreating(true);
    await new Promise(r => setTimeout(r, 1500));

    try {
      const crypto = createNobleCryptoProvider();
      const createdObjects: StoredObject[] = [];

      // 1. Create MEDIA VCOs (The "Attachments")
      const mediaHashes: string[] = [];
      for (const item of media) {
        const mediaEnvelope = createEnvelope({
          payload: new TextEncoder().encode(item.data),
          payloadType: VCO_TYPE_MEDIA,
          creatorId: identity.creatorId,
          privateKey: identity.privateKey,
          powDifficulty: 1,
        }, crypto);
        
        const hash = uint8ArrayToHex(mediaEnvelope.headerHash);
        mediaHashes.push(hash);
        createdObjects.push({
          headerHash: hash,
          creatorId: identity.creatorIdHex,
          payloadType: VCO_TYPE_MEDIA,
          payload: `${item.type}:${item.data}`,
          timestamp: Date.now(),
          isLocal: true
        });
      }

      // 2. Create the CONTENT VCO (The "Body")
      const contentEnvelope = createEnvelope({
        payload: new TextEncoder().encode(payload),
        payloadType: VCO_TYPE_TEXT,
        creatorId: identity.creatorId,
        privateKey: identity.privateKey,
        powDifficulty: 1,
      }, crypto);

      const contentHash = uint8ArrayToHex(contentEnvelope.headerHash);
      createdObjects.push({
        headerHash: contentHash,
        creatorId: identity.creatorIdHex,
        payloadType: VCO_TYPE_TEXT,
        payload: payload,
        timestamp: Date.now(),
        isLocal: true
      });

      // 3. Create the MANIFEST VCO (The "Soul")
      const manifestData = {
        v: "3.2",
        type: "post",
        content: contentHash,
        media: mediaHashes,
        meta: {
          timestamp: Date.now(),
          client: "VCO Pulse Desktop"
        }
      };

      const manifestPayload = JSON.stringify(manifestData);
      const manifestEnvelope = createEnvelope({
        payload: new TextEncoder().encode(manifestPayload),
        payloadType: VCO_TYPE_MANIFEST,
        creatorId: identity.creatorId,
        privateKey: identity.privateKey,
        powDifficulty: 2,
      }, crypto);

      createdObjects.push({
        headerHash: uint8ArrayToHex(manifestEnvelope.headerHash),
        creatorId: identity.creatorIdHex,
        payloadType: VCO_TYPE_MANIFEST,
        payload: manifestPayload,
        timestamp: Date.now(),
        isLocal: true
      });

      onCreated(createdObjects);
      onClose();
    } catch (err) {
      console.error("Failed to create post tree", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-slide-up">
        <Card className="shadow-2xl border-slate-600">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight uppercase text-slate-100">Draft New Post</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded transition-colors text-slate-300">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Post Content (Markdown)</label>
                <Badge variant="outline">Distributed v3.2</Badge>
              </div>
              <textarea
                autoFocus
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="What's on the distributed web?"
                className="w-full h-36 bg-slate-950 border border-slate-700 rounded p-4 text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-all resize-none text-xs leading-relaxed font-mono"
              />
            </div>

            {/* Media Attachments UI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Attachments</label>
                <button 
                  type="button"
                  onClick={addSimulatedMedia}
                  className="text-[10px] font-bold text-teal-500 hover:text-teal-400 uppercase tracking-wider transition-colors flex items-center gap-1"
                >
                  <Plus size={10} /> Add Media
                </button>
              </div>
              
              {media.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {media.map((item, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center justify-between group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                          {item.type.startsWith("image") ? <LayoutGrid size={12} /> : <Zap size={12} />}
                        </div>
                        <span className="text-[10px] text-slate-300 truncate uppercase font-bold">{item.name}</span>
                      </div>
                      <button onClick={() => removeMedia(i)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-12 border border-dashed border-slate-800 rounded flex items-center justify-center">
                  <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No Media Attached</span>
                </div>
              )}
            </div>

            <div className="bg-slate-950 rounded border border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Layers size={12} className="text-teal-500" />
                <span>Tree Assembly Plan</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                  <span>1. Content Leaf</span>
                  <span className="text-teal-500">Pending Compute</span>
                </div>
                {media.length > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                    <span>2. Media Leaves ({media.length})</span>
                    <span className="text-teal-500">Ready to Chunk</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                  <span>{media.length > 0 ? "3" : "2"}. Manifest Root</span>
                  <span className="text-teal-500">Linking...</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="button" onClick={onClose} variant="ghost" className="flex-1 h-10">Discard</Button>
              <Button type="submit" disabled={isCreating || !payload || !identity} className="flex-[2] h-10">
                {isCreating ? (
                  <><RefreshCw size={14} className="animate-spin" /><span>Assembling Tree...</span></>
                ) : (
                  <><Send size={14} /><span>Publish Post</span></>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function FeedItem({ obj, allObjects }: { obj: StoredObject, allObjects: StoredObject[] }) {
  const [showRaw, setShowRaw] = useState(false);
  const [showInspect, setShowInspect] = useState(false);

  // --- Assembly Logic ---
  const isManifest = obj.payloadType === VCO_TYPE_MANIFEST;
  let manifestData: any = null;
  let assembledContent = obj.payload;
  let isAssembled = false;

  if (isManifest) {
    try {
      manifestData = JSON.parse(obj.payload);
      const contentObj = allObjects.find(o => o.headerHash === manifestData.content);
      if (contentObj) {
        assembledContent = contentObj.payload;
        isAssembled = true;
      } else {
        assembledContent = "[Content pending synchronization...]";
      }
    } catch (e) {
      console.error("Failed to parse manifest", e);
    }
  }

  const mediaObjects = isManifest && manifestData?.media 
    ? manifestData.media.map((hash: string) => allObjects.find(o => o.headerHash === hash)).filter(Boolean)
    : [];

  return (
    <Card className={`transition-all duration-200 group hover:border-teal-500/30 ${obj.isLocal ? 'border-l-2 border-l-teal-500' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 border border-slate-700 rounded flex items-center justify-center transition-colors ${isManifest ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-slate-800 text-teal-400 group-hover:border-teal-500/30'}`}>
              {isManifest ? <Layers size={18} strokeWidth={1.5} /> : <Shield size={18} strokeWidth={1.5} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-slate-100">{obj.creatorId.substring(0, 12)}...</span>
                {obj.isLocal && <Badge variant="info">Owner</Badge>}
                {isManifest && <Badge variant="warning">Post Root</Badge>}
                <Badge variant="success">Verified</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase">
                <span>Hash: {obj.headerHash.substring(0, 16)}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={9} />{timeAgo(obj.timestamp)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className={`p-1.5 rounded border transition-colors ${showRaw ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'border-slate-800 text-slate-500 hover:text-slate-100 hover:border-slate-700'}`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-100 leading-relaxed text-xs whitespace-pre-wrap">{assembledContent}</p>
          
          {mediaObjects.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mediaObjects.map((m: any, i: number) => {
                const [type] = m.payload.split(":");
                const isImage = type.startsWith("image");
                return (
                  <div key={i} className="aspect-video bg-slate-950 rounded border border-slate-800 flex flex-col items-center justify-center gap-2 group/media relative overflow-hidden">
                    {isImage ? (
                      <div className="absolute inset-0 bg-teal-500/5 flex items-center justify-center">
                        <LayoutGrid size={24} className="text-teal-500/20" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-sky-500/5 flex items-center justify-center">
                        <Zap size={24} className="text-sky-500/20" />
                      </div>
                    )}
                    <div className="z-10 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type.split("/")[1]}</span>
                      <span className="text-[8px] font-mono text-slate-600 uppercase">{m.headerHash.substring(0, 8)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isManifest && !isAssembled && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500 animate-pulse">
              <RefreshCw size={10} className="animate-spin" />
              <span>Seeking CID {manifestData?.content.substring(0, 8)} in swarm...</span>
            </div>
          )}
        </div>

        {showRaw && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-slide-up">
            <div className="bg-slate-950 rounded p-4 font-mono text-sm text-teal-300/50 leading-relaxed overflow-x-auto border border-slate-800">
              <div className="mb-2 text-slate-400 font-bold uppercase tracking-widest text-xs">Raw Metadata</div>
              {JSON.stringify({header_hash:obj.headerHash,creator_id:obj.creatorId,payload_type:obj.payloadType,assembled:isAssembled},null,2)}
            </div>
          </div>
        )}
        {showInspect && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-slide-up space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Post Dependency Tree</div>
            <div className="space-y-2">
              {[
                ["Manifest Hash", obj.headerHash],
                ["Content Link", manifestData?.content || "None"],
                ["Media Links", manifestData?.media?.length || "0"],
                ["Assembly", isAssembled ? "COMPLETE" : "PENDING"],
                ["Protocol", "VCO/3.2 Distributed"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 bg-slate-950 rounded border border-slate-800 p-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-28 shrink-0">{k}</span>
                  <span className="text-sm font-mono text-slate-200 break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400">
              <Layers size={11} className={isManifest ? "text-orange-400" : ""} /><span className="text-xs font-bold uppercase tracking-widest">Distributed</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Lock size={11} /><span className="text-xs font-bold uppercase tracking-widest">Verifiable</span>
            </div>
          </div>
          <button
            onClick={() => setShowInspect(!showInspect)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${showInspect ? 'text-teal-300' : 'text-teal-500 hover:text-teal-300'}`}
          >
            {showInspect ? 'Inspect Tree ↑' : 'Inspect Tree →'}
          </button>
        </div>
      </div>
    </Card>
  );
}

function SyncVisualizer({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"INIT" | "COMPARE" | "BISECT" | "EXCHANGE" | "DONE">("INIT");
  const [progress, setProgress] = useState(0);
  const [syncComplete, setSyncComplete] = useState(false);

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
        setSyncComplete(true);
        setTimeout(() => onComplete(), 1000);
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
    <div className="fixed inset-0 bg-slate-950/95 z-[200] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-10 animate-slide-up">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border border-teal-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 border-2 border-slate-800 rounded-full" />
          <div
            className="absolute inset-0 border-2 border-teal-400 rounded-full transition-all duration-700 ease-in-out"
            style={{ transform: `rotate(${progress * 3.6}deg)`, filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {syncComplete ? <CheckCircle2 size={36} className="text-teal-400" /> : <ArrowDownUp size={36} className="text-teal-400" />}
          </div>
        </div>
        <div className="text-center space-y-2">
          {syncComplete ? (
            <h2 className="font-display text-4xl font-black tracking-tight text-teal-400 uppercase animate-slide-up">Sync Complete</h2>
          ) : (
            <h2 className="font-display text-4xl font-black tracking-tight text-white uppercase">Protocol Sync</h2>
          )}
          <p className="text-sm text-slate-400 font-mono uppercase tracking-[0.4em]">Phase: <span className="text-teal-400">{phase}</span></p>
        </div>
        <div className="space-y-4">
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-teal-500 transition-all duration-700 ease-out" style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(20,184,166,0.4)' }} />
          </div>
          <div className="flex justify-between items-center">
            {["INIT","COMPARE","BISECT","EXCHANGE"].map(p => (
              <div key={p} className="flex flex-col items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${phase === p || progress === 100 ? 'bg-teal-400' : 'bg-slate-800'}`} />
                <span className={`text-xs font-bold tracking-tight transition-colors duration-300 ${phase === p ? 'text-teal-400' : 'text-slate-500'}`}>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <Card className="bg-slate-950 border-slate-800">
          <div className="p-5 font-mono text-sm text-slate-400 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2"><Badge variant="info">0ms</Badge><span className="text-slate-300">CONNECTING_TO_BOOTSTRAP_RELAY...</span></div>
            {progress >= 20 && <div className="flex items-center gap-2 animate-slide-up"><Badge variant="info">142ms</Badge><span className="text-slate-200">PROTOCOL_HANDSHAKE_COMPLETE (VCO/3.2.0)</span></div>}
            {progress >= 45 && <div className="flex items-center gap-2 animate-slide-up"><Badge variant="info">489ms</Badge><span className="text-teal-400">LOCAL_STATE_SNAPSHOT_GENERATED (124 OBJS)</span></div>}
            {progress >= 75 && <div className="flex items-center gap-2 animate-slide-up"><Badge variant="warning">912ms</Badge><span className="text-amber-400">RANGE_MISMATCH_DETECTED [HASH_COLLISION_CHECK]</span></div>}
            {progress >= 100 && <div className="flex items-center gap-2 animate-slide-up"><Badge variant="success">1204ms</Badge><span className="text-teal-400 font-bold">SET_RECONCILIATION_SUCCESSFUL (3 NEW ENVELOPES)</span></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${active ? 'bg-teal-500/10 border border-teal-500/15' : 'border border-transparent hover:bg-slate-800/50'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`transition-colors ${active ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
          <Icon size={16} strokeWidth={active ? 2 : 1.5} />
        </div>
        <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${active ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-100'}`}>{label}</span>
      </div>
      {active && <ChevronRight size={12} className="text-teal-500" />}
    </button>
  );
}

// --- Main App Logic ---

function AppContent() {
  const { identity } = useIdentity();
  const [status, setStatus] = useState("Connecting");
  const [objects, setObjects] = useState<StoredObject[]>([]);
  const [view, setView] = useState<"feed" | "identity" | "vault" | "network">("feed");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [feedLayout, setFeedLayout] = useState<"list" | "grid">("list");
  const [showAddRelay, setShowAddRelay] = useState(false);
  const [newRelayName, setNewRelayName] = useState("");
  const [newRelayAddr, setNewRelayAddr] = useState("");
  const [copiedVault, setCopiedVault] = useState<Record<string, boolean>>({});
  const [networkStats, setNetworkStats] = useState({
    peers: 1248,
    latency: 42,
    inbound: 0.0,
    outbound: 0.0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        peers: prev.peers + (Math.random() > 0.5 ? 1 : -1),
        latency: Math.max(20, Math.min(150, prev.latency + (Math.random() * 10 - 5))),
        inbound: Math.random() * 15.5,
        outbound: Math.random() * 8.2
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCreated = (newObjs: StoredObject[]) => {
    const updatedObjects = [...newObjs, ...objects];
    setObjects(updatedObjects);
    localStorage.setItem("vco_objects", JSON.stringify(updatedObjects));
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#020617', color: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ height: '64px', minHeight: '64px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '32px', height: '32px', backgroundColor: '#f97316', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black tracking-tight uppercase text-slate-100 leading-none">VCO Pulse</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">v3.2.0</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-6 mr-2">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Network</div>
              <div className={`text-sm font-bold uppercase flex items-center gap-1.5 justify-center ${status === "Online" ? "text-teal-400" : "text-amber-400"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status === "Online" ? "bg-teal-400" : "bg-amber-400 animate-pulse"}`} />
                {status}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Synced</div>
              <div className="text-sm font-bold text-slate-200 uppercase">{objects.length} Objects</div>
            </div>
          </div>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#1e293b' }} />
          <button
            onClick={() => setIsSyncing(true)}
            className="w-8 h-8 rounded border border-slate-800 flex items-center justify-center text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-all hover:rotate-180 duration-500"
          >
            <RefreshCw size={15} />
          </button>
          <Button onClick={() => { if (!identity) { setView("identity"); } else { setIsModalOpen(true); } }} icon={Plus} className="h-9 px-5">
            Publish
          </Button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '256px', minWidth: '256px', borderRight: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', backgroundColor: '#020617' }}>
          <div className="space-y-6 flex-1">
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3 px-3">Core Explorer</h2>
              <nav className="space-y-1">
                <SidebarItem label="Activity Feed" icon={Activity} active={view === "feed"} onClick={() => setView("feed")} />
                <SidebarItem label="Network Mesh" icon={Globe} active={view === "network"} onClick={() => setView("network")} />
                <SidebarItem label="Local Vault" icon={Database} active={view === "vault"} onClick={() => setView("vault")} />
              </nav>
            </section>
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3 px-3">Management</h2>
              <nav className="space-y-1">
                <SidebarItem label="Identity Hub" icon={Shield} active={view === "identity"} onClick={() => setView("identity")} />
              </nav>
            </section>
          </div>
          <div style={{ marginTop: 'auto', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-teal-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Metrics</h3>
            </div>
            <div className="space-y-2">
              {[["Peers", `${relays.length + networkStats.peers} ACTIVE`, "text-slate-200"],["Inbound",`${networkStats.inbound.toFixed(1)} KB/S`,"text-teal-500/80"],["Outbound",`${networkStats.outbound.toFixed(1)} KB/S`,"text-sky-500/80"]].map(([k,v,c]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">{k}</span>
                  <span className={`text-xs font-mono font-bold ${c}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {view === "feed" && (
              <div className="space-y-8 animate-slide-up">
                <div className="flex items-end justify-between border-b border-slate-800 pb-6">
                  <div className="space-y-1">
                    <h2 className="font-display text-5xl font-black tracking-tight uppercase text-slate-100">Activity Feed</h2>
                    <p className="text-sm text-slate-400 uppercase tracking-widest">Real-time verifiable content reconciliation stream</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFeedLayout("list")}
                      className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${feedLayout === "list" ? "border-teal-500/30 bg-teal-500/10 text-teal-400" : "border-slate-800 text-slate-500 hover:text-slate-200"}`}
                    >
                      <List size={15} />
                    </button>
                    <button
                      onClick={() => setFeedLayout("grid")}
                      className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${feedLayout === "grid" ? "border-teal-500/30 bg-teal-500/10 text-teal-400" : "border-slate-800 text-slate-500 hover:text-slate-200"}`}
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>
                </div>

                {objects.length === 0 ? (
                  <div className="py-32 text-center space-y-8">
                    <div className="w-16 h-16 border border-dashed border-slate-800 rounded-lg flex items-center justify-center mx-auto text-slate-600">
                      <Activity size={32} strokeWidth={1} />
                    </div>
                    <div className="max-w-xs mx-auto space-y-2">
                      <h3 className="font-display text-2xl font-bold text-slate-200 uppercase tracking-tight">Zero State Detected</h3>
                      <p className="text-slate-400 text-sm leading-relaxed uppercase tracking-wide">
                        No objects in local set. Establish a relay or create your first verifiable envelope.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button onClick={() => setView("network")} variant="secondary" icon={Globe}>Link Relay</Button>
                      <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Create Object</Button>
                    </div>
                  </div>
                ) : (
                  <div className={`${feedLayout === "grid" ? "grid grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"} pb-20`}>
                    {objects.filter(o => o.payloadType === VCO_TYPE_MANIFEST || o.payloadType === 0x01 && !objects.some(m => m.payloadType === VCO_TYPE_MANIFEST && JSON.parse(m.payload).content === o.headerHash)).map((obj) => (
                      <FeedItem key={obj.headerHash} obj={obj} allObjects={objects} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "network" && (
              <div className="space-y-8 animate-slide-up">
                <div className="space-y-1 border-b border-slate-800 pb-6">
                  <h2 className="font-display text-5xl font-black tracking-tight uppercase text-slate-100">Sync Network</h2>
                  <p className="text-sm text-slate-400 uppercase tracking-widest">Distributed bootstrap and discovery management</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Network Topology</h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 h-56 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute left-0 right-0 h-px bg-teal-500/10 animate-scan" />
                      </div>
                      <Network size={64} strokeWidth={0.5} className="text-teal-500/15" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-3 h-3 bg-teal-500 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                          {/* Dynamically render some dots based on relay count */}
                          {relays.map((_, i) => (
                            <div 
                              key={i} 
                              className="absolute w-1.5 h-1.5 bg-teal-500/60 rounded-full animate-pulse"
                              style={{ 
                                top: `${Math.sin(i * 2) * 50}px`, 
                                left: `${Math.cos(i * 2) * 80}px` 
                              }} 
                            />
                          ))}
                          <div className="absolute bottom-[-15px] right-[-65px] w-1.5 h-1.5 bg-slate-700 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Card className="flex-1 p-4 text-center space-y-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Peers</div>
                        <div className="font-display text-2xl font-black text-teal-400">{networkStats.peers.toLocaleString()}</div>
                      </Card>
                      <Card className="flex-1 p-4 text-center space-y-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Latency</div>
                        <div className="font-display text-2xl font-black text-teal-400">{networkStats.latency.toFixed(0)}ms</div>
                      </Card>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Active Endpoints</h3>
                    <div className="space-y-2">
                      {relays.map(relay => (
                        <Card key={relay.id} className="p-4 flex items-center justify-between group hover:border-teal-500/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-teal-500">
                              <Server size={15} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-100 uppercase tracking-tight">{relay.name}</div>
                              <div className="text-xs font-mono text-slate-400 mt-0.5 truncate max-w-[160px]">{relay.address}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={relay.status === "Online" ? "success" : "default"}>{relay.status}</Badge>
                            <button onClick={() => deleteRelay(relay.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </Card>
                      ))}
                      {showAddRelay ? (
                        <div className="bg-slate-900 border border-slate-700/60 rounded-lg p-4 space-y-3">
                          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Register New Node</div>
                          <input
                            value={newRelayName}
                            onChange={e => setNewRelayName(e.target.value)}
                            placeholder="Relay name"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-all"
                          />
                          <input
                            value={newRelayAddr}
                            onChange={e => setNewRelayAddr(e.target.value)}
                            placeholder="/ip4/0.0.0.0/udp/4001/quic-v1"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-all"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setShowAddRelay(false)} className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-slate-100 border border-slate-800 rounded transition-colors">Cancel</button>
                            <button onClick={() => { if(newRelayName && newRelayAddr) { addRelay(newRelayName, newRelayAddr); setNewRelayName(""); setNewRelayAddr(""); setShowAddRelay(false); }}} className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-white bg-orange-500 hover:bg-orange-400 border border-orange-500 rounded transition-colors">Register</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddRelay(true)}
                          className="w-full py-3 border border-dashed border-slate-800 rounded-lg text-slate-500 hover:text-teal-400 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all text-xs font-bold uppercase tracking-[0.2em]"
                        >+ Register New Node</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "identity" && (
              <div className="space-y-10 animate-slide-up">
                <div className="space-y-1 border-b border-slate-800 pb-6">
                  <h2 className="font-display text-5xl font-black tracking-tight uppercase text-slate-100">Identity Hub</h2>
                  <p className="text-sm text-slate-400 uppercase tracking-widest">Manage cryptographic root keys and protocol personas</p>
                </div>
                <IdentitySection />
              </div>
            )}

            {view === "vault" && (
              <div className="space-y-8 animate-slide-up">
                <div className="space-y-1 border-b border-slate-800 pb-6">
                  <h2 className="font-display text-5xl font-black tracking-tight uppercase text-slate-100">Local Vault</h2>
                  <p className="text-sm text-slate-400 uppercase tracking-widest">Immutable object storage persistence — <span className="text-teal-500">{objects.length} stored envelopes</span></p>
                </div>

                {objects.length === 0 ? (
                  <Card className="p-12 text-center border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Vault Storage Empty</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {objects.map(obj => {
                      const isManifest = obj.payloadType === VCO_TYPE_MANIFEST;
                      return (
                        <Card key={obj.headerHash} className="p-5 group hover:border-teal-500/30 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {isManifest ? <Layers size={18} className="text-orange-400" /> : <Database size={18} className="text-teal-500" />}
                              <div className="text-sm font-mono text-slate-300 uppercase font-bold truncate max-w-[120px]">{obj.headerHash}</div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={isManifest ? "warning" : "info"}>{isManifest ? "MANIFEST" : "LEAF"}</Badge>
                              <Badge variant="outline">{obj.payload.length} B</Badge>
                            </div>
                          </div>
                          <div className="text-xs text-slate-200 font-medium bg-slate-950 p-3 rounded border border-slate-800 truncate">
                            {obj.payload}
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{timeAgo(obj.timestamp)}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(obj.payload);
                                setCopiedVault(prev => ({ ...prev, [obj.headerHash]: true }));
                                setTimeout(() => setCopiedVault(prev => ({ ...prev, [obj.headerHash]: false })), 2000);
                              }}
                              className="text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                              style={{ color: copiedVault[obj.headerHash] ? '#2dd4bf' : '#14b8a6' }}
                            >
                              {copiedVault[obj.headerHash] ? <><CheckCircle2 size={11} /> Copied!</> : 'Copy Raw →'}
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      {isModalOpen && <NewPostModal onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />}
      {isSyncing && <SyncVisualizer onComplete={() => setIsSyncing(false)} />}

      {/* Footer / Status Bar */}
      <footer style={{ height: '36px', borderTop: '1px solid #1e293b', backgroundColor: '#020617', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }} className="text-xs text-slate-500 uppercase tracking-[0.25em] font-bold">
        <div className="flex gap-6 items-center">
          <div className="flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
            <span>TOL_ACTIVE v3.2</span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500/60" />
            <span>QUIC_UDP_PORT_4001</span>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <span className="hover:text-teal-500 transition-colors cursor-help">BLAKE3_VERIFIED</span>
          <span className="text-slate-600">BUILD_2026_02_25</span>
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
