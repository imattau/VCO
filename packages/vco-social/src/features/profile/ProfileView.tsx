import React, { useState, useMemo, useRef } from 'react';
import { useSocial } from '../SocialContext';
import { Edit2, Shield, Fingerprint, ShieldAlert, Key, Zap, CheckCircle2, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { FollowButton } from './FollowButton';
import { mockCid, toHex } from '@vco/vco-testing';
import { socialBlobStore } from '../../lib/MockSocialService';

export function ProfileView() {
  const { profile, updateProfile, feed, conversations, notifications } = useSocial();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    avatarCid: profile?.avatarCid || new Uint8Array(32)
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const cid = mockCid(`avatar-${file.name}-${Date.now()}`);
      socialBlobStore.set(toHex(cid), file);
      setFormData({ ...formData, avatarCid: cid });
      toast("New avatar hashed and staged", "info");
    }
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const avatarUrl = useMemo(() => {
    const hex = toHex(formData.avatarCid);
    const blob = socialBlobStore.get(hex);
    if (blob) return URL.createObjectURL(blob);
    return `https://api.dicebear.com/9.x/identicon/svg?seed=${profile.displayName}`;
  }, [formData.avatarCid, profile.displayName]);

  const handleRotateKeys = () => {
    toast("Rotating identity keys... Broadcasting new manifest to swarm.", "info");
    setTimeout(() => {
      toast("Identity rotated successfully. Previous keys revoked.", "success");
    }, 1500);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="space-y-2 mb-10">
        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Identity Center</h2>
        <p className="text-zinc-500 text-xl font-medium">Verifiable social profile and E2EE key management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Main Profile Info */}
         <div className="md:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8">
                  <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shadow-xl"
                    aria-label={isEditing ? "Save profile" : "Edit profile"}
                  >
                    {isEditing ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Edit2 size={24} />}
                  </button>
               </div>

               <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div 
                    onClick={() => isEditing && fileInputRef.current?.click()}
                    className={twMerge(
                      "w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 border-4 border-zinc-800 shadow-2xl shadow-blue-600/20 flex items-center justify-center overflow-hidden transition-all",
                      isEditing && "cursor-pointer hover:scale-105 active:scale-95"
                    )}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-white italic">{profile.displayName.slice(0, 1)}</span>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                     {isEditing ? (
                       <div className="space-y-4">
                          <input 
                            type="text" 
                            value={formData.displayName} 
                            onChange={e => setFormData({...formData, displayName: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-3 text-xl font-black text-white w-full focus:ring-2 focus:ring-blue-500/50 outline-none shadow-inner"
                          />
                          <textarea 
                            value={formData.bio} 
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-3 text-sm font-medium text-zinc-300 w-full focus:ring-2 focus:ring-blue-500/50 outline-none shadow-inner resize-none h-32 leading-relaxed"
                          />
                       </div>
                     ) : (
                       <div className="space-y-2">
                          <h3 className="text-4xl font-black text-white tracking-tighter italic">{profile.displayName}</h3>
                          <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-lg">{profile.bio}</p>
                       </div>
                     )}
                     
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                        <Badge icon={<Shield size={14} />} label="VERIFIED DID" color="text-emerald-500 bg-emerald-500/10 border-emerald-500/20" />
                        <Badge icon={<Fingerprint size={14} />} label="VCO CORE MEMBER" color="text-blue-500 bg-blue-500/10 border-blue-500/20" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Peer Graph */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
               <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-black text-white tracking-tighter italic flex items-center gap-3 uppercase">
                     <Users size={24} className="text-blue-500" />
                     Swarm Graph
                  </h4>
               </div>
               <div className="space-y-4">
                  {[
                    { name: 'Crypto Charlie', did: 'did:vco:char...991', following: true },
                    { name: 'Decentralized Dave', did: 'did:vco:dave...456', following: false },
                  ].map(peer => (
                    <div key={peer.did} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-zinc-700 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs text-white shrink-0">
                             {peer.name[0]}
                          </div>
                          <div>
                             <div className="font-bold text-white text-sm">{peer.name}</div>
                             <div className="text-[10px] text-zinc-500 font-mono">{peer.did}</div>
                          </div>
                       </div>
                       <FollowButton did={peer.did} initialState={peer.following} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
               <h4 className="text-2xl font-black text-white tracking-tighter italic flex items-center gap-3 uppercase">
                  <Zap size={24} className="text-amber-500" />
                  Swarm Activity
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <StatCard label="Followers" value="1,242" subValue="+12 today" />
                  <StatCard label="Posts Published" value={feed.length.toString()} subValue="Verifiable objects" />
                  <StatCard label="Inbound Syncs" value={notifications.length.toString()} subValue="Recent events" />
                  <StatCard label="E2EE Sessions" value={conversations.length.toString()} subValue="Active secure channels" />
               </div>
            </div>
         </div>

         {/* Sidebar Security Info */}
         <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert size={20} className="text-blue-500" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Encryption Profile</h4>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 shadow-inner group">
                     <div className="flex items-center gap-2 mb-1">
                        <Key size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Signing Key (Ed25519)</span>
                     </div>
                     <code className="text-[10px] text-zinc-300 font-mono break-all line-clamp-2 uppercase">
                        ed25519:did:vco:7X9hJ2p5N...m4LqR8sW
                     </code>
                  </div>

                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 shadow-inner group">
                     <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Encryption Key (X25519)</span>
                     </div>
                     <code className="text-[10px] text-zinc-300 font-mono break-all line-clamp-2 uppercase">
                        x25519:0x8f2d...e1c4b9
                     </code>
                  </div>
               </div>
               <p className="text-[10px] text-zinc-600 font-medium italic leading-relaxed">
                  These keys are derived from your local seed and never leave your device. They are used to verify your identity and secure your private conversations across the swarm.
               </p>
            </div>

            <button 
              onClick={handleRotateKeys}
              className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 p-6 rounded-[2rem] text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl active:translate-y-1"
            >
               Revoke & Rotate Keys
            </button>
         </div>
      </div>
    </div>
  );
}

import { useToast } from '../../components/ToastProvider';

function Badge({ icon, label, color }: any) {
  return (
    <div className={twMerge("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border transition-all", color)}>
       {icon}
       {label}
    </div>
  );
}

function StatCard({ label, value, subValue }: any) {
  return (
    <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-3xl p-6 space-y-1 shadow-inner group hover:border-zinc-700 transition-all">
       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
       <div className="text-3xl font-black text-white tracking-tighter italic">{value}</div>
       <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{subValue}</div>
    </div>
  );
}
