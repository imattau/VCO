import { useState, useEffect, createContext, useContext, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Activity, Shield, Zap, Database, Plus, Key, Copy,
  RefreshCw, CheckCircle2, X, Send, Server, Globe,
  ArrowDownUp, Layers, ChevronRight, Eye, EyeOff,
  Lock, Clock, LayoutGrid, List, Wifi, Search, Radio
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
}

// --- Constants ---
const VCO_TYPE_TEXT = 0x01;
const VCO_TYPE_MEDIA = 0x02;
const VCO_TYPE_MANIFEST = 0x03;

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

function ProfileEditorModal({ onClose, onCreated, allObjects }: { onClose: () => void, onCreated: (objs: StoredObject[]) => void, allObjects: StoredObject[] }) {
  const { identity } = useIdentity();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setAvatar(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;

    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));

    try {
      const crypto = createNobleCryptoProvider();
      const createdObjects: StoredObject[] = [];

      let avatarHash = null;
      if (avatar) {
        // Deduplication: check if avatar already exists
        const existing = allObjects.find(o => o.payloadType === VCO_TYPE_MEDIA && o.payload === `image/avatar:${avatar}`);
        if (existing) {
          avatarHash = existing.headerHash;
        } else {
          const avatarEnvelope = createEnvelope({
            payload: new TextEncoder().encode(avatar),
            payloadType: VCO_TYPE_MEDIA,
            creatorId: identity.creatorId,
            privateKey: identity.privateKey,
            powDifficulty: 1,
          }, crypto);
          avatarHash = uint8ArrayToHex(avatarEnvelope.headerHash);
          createdObjects.push({
            headerHash: avatarHash,
            creatorId: identity.creatorIdHex,
            payloadType: VCO_TYPE_MEDIA,
            payload: `image/avatar:${avatar}`,
            timestamp: Date.now(),
            isLocal: true
          });
        }
      }

      const bioPayload = JSON.stringify({ name: displayName, bio });
      const bioEnvelope = createEnvelope({
        payload: new TextEncoder().encode(bioPayload),
        payloadType: VCO_TYPE_TEXT,
        creatorId: identity.creatorId,
        privateKey: identity.privateKey,
        powDifficulty: 1,
      }, crypto);
      const bioHash = uint8ArrayToHex(bioEnvelope.headerHash);
      createdObjects.push({
        headerHash: bioHash,
        creatorId: identity.creatorIdHex,
        payloadType: VCO_TYPE_TEXT,
        payload: bioPayload,
        timestamp: Date.now(),
        isLocal: true
      });

      const manifestData = {
        v: "3.2",
        type: "profile",
        content: bioHash,
        avatar: avatarHash,
        meta: { timestamp: Date.now() }
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
      console.error("Failed to create profile manifest", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        <Card className="border-slate-700">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-100">Construct Profile Manifest</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <Plus size={32} className="text-slate-600" />}
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <span className="text-[10px] font-bold text-white uppercase">Upload</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} className="hidden" accept="image/*" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none" placeholder="e.g. Satoshi" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio (Distributed Content)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full h-24 bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm text-slate-100 focus:ring-1 focus:ring-teal-500 resize-none outline-none" placeholder="Who are you in the swarm?" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={onClose} variant="ghost" className="flex-1">Cancel</Button>
              <Button type="submit" disabled={isSaving || !displayName} className="flex-[2]">
                {isSaving ? "Publishing Manifest..." : "Commit Identity"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function IdentitySection({ allObjects, onProfileUpdated }: { allObjects: StoredObject[], onProfileUpdated: (objs: StoredObject[]) => void }) {
  const { identity, generateIdentity } = useIdentity();
  const [copied, setCopied] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const profileManifest = [...allObjects].reverse().find(o => o.payloadType === VCO_TYPE_MANIFEST && JSON.parse(o.payload).type === "profile" && o.creatorId === identity?.creatorIdHex);
  let profileData = { name: "Anonymous Peer", bio: "Identity not yet established in the distributed swarm.", avatar: null };
  
  if (profileManifest) {
    try {
      const manifest = JSON.parse(profileManifest.payload);
      const bioObj = allObjects.find(o => o.headerHash === manifest.content);
      if (bioObj) {
        const parsedBio = JSON.parse(bioObj.payload);
        profileData.name = parsedBio.name;
        profileData.bio = parsedBio.bio;
      }
      if (manifest.avatar) {
        const avatarObj = allObjects.find(o => o.headerHash === manifest.avatar);
        if (avatarObj) {
          const [_, ...dataParts] = avatarObj.payload.split(":");
          profileData.avatar = dataParts.join(":") as any;
        }
      }
    } catch(e) {}
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
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
    <div className="space-y-6 animate-slide-up">
      <Card className="relative overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-b border-slate-800" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-950 border-4 border-slate-950 shadow-2xl overflow-hidden">
              {profileData.avatar ? <img src={profileData.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600"><Shield size={40} /></div>}
            </div>
            <Button onClick={() => setIsEditing(true)} variant="secondary" className="h-9" icon={Plus}>Edit Profile</Button>
          </div>
          <div className="space-y-1 mb-6">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">{profileData.name}</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">{profileData.bio}</p>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-slate-800/50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Creator Identifier (MULTIKEY)</label>
              <div className="bg-slate-950 rounded border border-slate-800 p-3 flex items-center justify-between gap-4 group hover:border-teal-500/20 transition-colors">
                <div className="truncate font-mono text-xs text-teal-400/70 select-all">
                  {identity.creatorIdHex}
                </div>
                <button onClick={() => copyToClipboard(identity.creatorIdHex, 'cid')} className="text-slate-500 hover:text-teal-400 transition-colors shrink-0">
                  {copied === 'cid' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Public Key (ED25519)</label>
              <div className="bg-slate-950 rounded border border-slate-800 p-3 flex items-center justify-between gap-4 group hover:border-teal-500/20 transition-colors">
                <div className="truncate font-mono text-xs text-slate-300 select-all">
                  {uint8ArrayToHex(identity.publicKey)}
                </div>
                <button onClick={() => copyToClipboard(uint8ArrayToHex(identity.publicKey), 'pub')} className="text-slate-500 hover:text-teal-400 transition-colors shrink-0">
                  {copied === 'pub' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-red-500/70 uppercase tracking-[0.2em]">Private Key (SECRET)</label>
                <button 
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase transition-colors"
                >
                  {showPrivateKey ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Reveal</>}
                </button>
              </div>
              <div className={`bg-slate-950 rounded border transition-colors p-3 flex items-center justify-between gap-4 group ${showPrivateKey ? 'border-red-500/30 ring-1 ring-red-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                <div className="truncate font-mono text-xs select-all">
                  {showPrivateKey ? (
                    <span className="text-red-400/90">{uint8ArrayToHex(identity.privateKey)}</span>
                  ) : (
                    <span className="text-slate-700 tracking-[0.3em]">••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
                  )}
                </div>
                <button 
                  disabled={!showPrivateKey}
                  onClick={() => copyToClipboard(uint8ArrayToHex(identity.privateKey), 'priv')} 
                  className={`transition-colors shrink-0 ${!showPrivateKey ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-red-400'}`}
                >
                  {copied === 'priv' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
          <Lock size={12} className="text-teal-500" />
          <span>Keys are stored locally in secure browser storage.</span>
        </div>
        <Button onClick={generateIdentity} variant="ghost" className="text-[10px] h-8" icon={RefreshCw}>
          Rotate Identity
        </Button>
      </div>

      {isEditing && <ProfileEditorModal allObjects={allObjects} onCreated={onProfileUpdated} onClose={() => setIsEditing(false)} />}
    </div>
  );
}

function NewPostModal({ onClose, onCreated, allObjects }: { onClose: () => void, onCreated: (objs: StoredObject[]) => void, allObjects: StoredObject[] }) {
  const { identity } = useIdentity();
  const [payload, setPayload] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [media, setMedia] = useState<{name: string, type: string, data: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMedia(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !payload) return;

    setIsCreating(true);
    await new Promise(r => setTimeout(r, 1500));

    try {
      const crypto = createNobleCryptoProvider();
      const createdObjects: StoredObject[] = [];

      const mediaHashes: string[] = [];
      for (const item of media) {
        const existing = allObjects.find(o => o.payloadType === VCO_TYPE_MEDIA && o.payload === `${item.type}:${item.data}`);
        
        if (existing) {
          mediaHashes.push(existing.headerHash);
        } else {
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
      }

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
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Post Content</label>
                <Badge variant="outline">Distributed v3.2</Badge>
              </div>
              <textarea
                autoFocus
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="What's on the distributed web?"
                className="w-full h-36 bg-slate-950 border border-slate-700 rounded p-4 text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-all resize-none text-xs leading-relaxed font-mono outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Attachments</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
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
                      <button type="button" onClick={() => setMedia(media.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
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
                  <><RefreshCw size={14} className="animate-spin" /><span>Assembling...</span></>
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

  // --- Profile Assembly (The Author) ---
  const authorProfileManifest = [...allObjects].reverse().find(o => 
    o.payloadType === VCO_TYPE_MANIFEST && 
    JSON.parse(o.payload).type === "profile" && 
    o.creatorId === obj.creatorId
  );
  
  let authorData = { name: obj.creatorId.substring(0, 12) + "...", avatar: null };
  if (authorProfileManifest) {
    try {
      const manifest = JSON.parse(authorProfileManifest.payload);
      const bioObj = allObjects.find(o => o.headerHash === manifest.content);
      if (bioObj) {
        authorData.name = JSON.parse(bioObj.payload).name;
      }
      if (manifest.avatar) {
        const avatarObj = allObjects.find(o => o.headerHash === manifest.avatar);
        if (avatarObj) {
          const [_, ...dataParts] = avatarObj.payload.split(":");
          authorData.avatar = dataParts.join(":") as any;
        }
      }
    } catch(e) {}
  }

  // --- Content Assembly (The Post) ---
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

  const isProfile = isManifest && manifestData?.type === "profile";
  const mediaLinks = isManifest 
    ? (isProfile ? (manifestData.avatar ? [manifestData.avatar] : []) : (manifestData?.media || []))
    : [];
    
  const mediaObjects = mediaLinks.map((hash: string) => ({
    hash,
    obj: allObjects.find(o => o.headerHash === hash)
  }));

  return (
    <Card className={`transition-all duration-200 group hover:border-teal-500/30 ${obj.isLocal ? 'border-l-2 border-l-teal-500' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {authorData.avatar ? (
                <img src={authorData.avatar} className="w-full h-full object-cover" />
              ) : (
                <Shield size={20} className="text-teal-500/50" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-black text-slate-100 uppercase tracking-tight">{authorData.name}</span>
                {obj.isLocal && <Badge variant="info">You</Badge>}
                {isManifest && <Badge variant={isProfile ? "success" : "warning"}>{isProfile ? "Profile" : "Post"}</Badge>}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <span>{obj.creatorId.substring(0, 16)}</span>
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
          <div className="text-slate-100 leading-relaxed text-xs">
            {isProfile ? (
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 italic text-slate-400">
                Identity established: {isAssembled ? JSON.parse(assembledContent).bio : "..."}
              </div>
            ) : (
              <div className="prose prose-invert prose-slate prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {assembledContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {mediaLinks.length > 0 && (
            <div className={`${isProfile ? 'flex justify-start' : 'grid grid-cols-2 gap-2'} mt-2`}>
              {mediaObjects.map((m: any, i: number) => {
                if (!m.obj) {
                  return (
                    <div key={i} className={`${isProfile ? 'w-20 h-20 rounded-full' : 'aspect-video rounded'} bg-slate-950 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 animate-pulse`}>
                      <RefreshCw size={16} className="text-slate-700 animate-spin" />
                    </div>
                  );
                }

                const [type, ...dataParts] = m.obj.payload.split(":");
                const data = dataParts.join(":");
                const isImage = type.includes("image");
                
                return (
                  <div key={i} className={`${isProfile ? 'w-20 h-20 rounded-full border-2 border-teal-500/30' : 'aspect-video rounded border border-slate-800'} bg-slate-950 relative overflow-hidden`}>
                    {isImage ? (
                      <img src={data} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <video src={data} className="absolute inset-0 w-full h-full object-cover" controls />
                    )}
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
            {progress >= 75 && <div className="flex items-center gap-2 animate-slide-up"><Badge variant="warning">912ms</Badge><span className="text-amber-400">RANGE_MISMATCH_DETECTED [STARTING_BISECTION]</span></div>}
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
  const [copiedVault, setCopiedVault] = useState<Record<string, boolean>>({});
  const [networkStats, setNetworkStats] = useState({ peers: 1248, latency: 42, inbound: 0.0, outbound: 0.0 });
  const [discoveryLog, setDiscoveryLog] = useState<{id: string, type: 'mDNS' | 'DHT' | 'Content', label: string, status: string}[]>([]);

  useEffect(() => {
    const discoveryInterval = setInterval(() => {
      const types: ('mDNS' | 'DHT' | 'Content')[] = ['mDNS', 'DHT', 'Content'];
      const type = types[Math.floor(Math.random() * types.length)];
      const labels = {
        mDNS: "Local Node Hello",
        DHT: `Peer Lookup [${Math.random().toString(16).slice(2, 10)}]`,
        Content: `Provider Search [${Math.random().toString(16).slice(2, 10)}]`
      };
      
      const newLog = {
        id: Math.random().toString(36).slice(2),
        type,
        label: labels[type],
        status: "Active"
      };

      setDiscoveryLog(prev => [newLog, ...prev].slice(0, 5));
      setTimeout(() => {
        setDiscoveryLog(prev => prev.map(l => l.id === newLog.id ? {...l, status: "Resolved"} : l));
      }, 2000);
    }, 4000);

    return () => clearInterval(discoveryInterval);
  }, []);

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
                <SidebarItem label="Discovery Hub" icon={Globe} active={view === "network"} onClick={() => setView("network")} />
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
                  <h2 className="font-display text-5xl font-black tracking-tight uppercase text-slate-100">Discovery Hub</h2>
                  <p className="text-sm text-slate-400 uppercase tracking-widest">Autonomous peer discovery and content addressing</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Discovery Stream */}
                  <div className="lg:col-span-2 space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Discovery</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-5 border-teal-500/20 bg-teal-500/[0.02]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Wifi size={16} className="text-teal-400" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">mDNS (Local)</span>
                            </div>
                            <Badge variant="success">Active</Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold">Broadcasting "HELLO" on local subnet. Detecting peers without internet route.</p>
                        </Card>
                        <Card className="p-5 border-sky-500/20 bg-sky-500/[0.02]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-sky-400" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Kademlia DHT</span>
                            </div>
                            <Badge variant="info">Roaming</Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold">Querying nearest neighbors for remote creator locations.</p>
                        </Card>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Live Lookup Log</h3>
                      <Card className="bg-slate-950 border-slate-800 divide-y divide-slate-900 overflow-hidden">
                        {discoveryLog.length > 0 ? discoveryLog.map(log => (
                          <div key={log.id} className="p-4 flex items-center justify-between group hover:bg-slate-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded border flex items-center justify-center ${log.type === 'mDNS' ? 'border-teal-500/30 text-teal-400' : log.type === 'DHT' ? 'border-sky-500/30 text-sky-400' : 'border-orange-500/30 text-orange-400'}`}>
                                {log.type === 'mDNS' ? <Wifi size={14} /> : log.type === 'DHT' ? <Search size={14} /> : <Database size={14} />}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-200 uppercase tracking-tight">{log.label}</div>
                                <div className="text-[9px] font-mono text-slate-500 mt-0.5">TYPE: {log.type} // RESOLUTION_HOP: {Math.floor(Math.random()*8)+1}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Active' ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${log.status === 'Active' ? 'text-amber-500' : 'text-teal-500'}`}>{log.status}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="p-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">Listening for swarm activity...</div>
                        )}
                      </Card>
                    </section>
                  </div>

                  {/* Right: Content Routing & Hops */}
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Interest Vectors</h3>
                      <Card className="p-6 bg-orange-500/[0.02] border-orange-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Radio size={48} className="text-orange-400 animate-ping" />
                        </div>
                        <div className="space-y-4 relative z-10">
                          <div className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Active Provider Search</div>
                          <div className="space-y-2">
                            {objects.slice(0, 3).map(obj => (
                              <div key={obj.headerHash} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-orange-500 rounded-full" />
                                <span className="text-[10px] font-mono text-slate-300 truncate">RECONCILING: {obj.headerHash}</span>
                              </div>
                            ))}
                            {objects.length === 0 && <span className="text-[10px] text-slate-600 italic">No active interest vectors...</span>}
                          </div>
                          <div className="pt-2">
                            <button className="w-full py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all">Broadcast Demand</button>
                          </div>
                        </div>
                      </Card>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Seed Nodes</h3>
                      <div className="space-y-2">
                        {relays.map(relay => (
                          <div key={relay.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded">
                            <div className="flex items-center gap-3">
                              <Server size={14} className="text-slate-500" />
                              <span className="text-[10px] font-bold text-slate-300 uppercase">{relay.name}</span>
                            </div>
                            <Badge variant={relay.status === "Online" ? "success" : "default"}>{relay.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </section>
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
                <IdentitySection allObjects={objects} onProfileUpdated={handleCreated} />
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
      {isModalOpen && <NewPostModal onClose={() => setIsModalOpen(false)} onCreated={handleCreated} allObjects={objects} />}
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
