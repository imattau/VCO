import React, { useState, useRef } from 'react';
import { useSocial } from '../SocialContext';
import { MessageSquare, ShieldCheck, Search, Users, Send, Image, Smile, ArrowLeft, X } from 'lucide-react';
import { ProfileData } from '@vco/vco-schemas';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MediaGallery } from '../feed/MediaGallery';

export function MessageView() {
  const { conversations, profile, sendDM, selectedConversationIndex, setSelectedConversationIndex } = useSocial();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const activeConversation = selectedConversationIndex !== null ? conversations[selectedConversationIndex] : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 4));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || !activeConversation) return;

    await sendDM(activeConversation.peerProfile, inputText, attachments);
    setInputText('');
    setAttachments([]);
  };

  return (
    <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-144px)] bg-zinc-900 border border-zinc-800 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 relative">
      {/* Conversation List */}
      <aside className={twMerge(
        "w-full md:w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/50 transition-all duration-300",
        selectedConversationIndex !== null ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 md:p-6 border-b border-zinc-800 space-y-4">
           <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter italic uppercase">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Find a secure peer..." 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-2 pl-10 pr-4 text-[10px] md:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
           {conversations.map((conv, idx) => (
             <ConversationItem 
               key={conv.peerProfile.displayName}
               name={conv.peerProfile.displayName} 
               did={conv.peerProfile.bio.substring(0, 30) + "..."} 
               lastMsg={conv.lastMessage.payload.content} 
               active={selectedConversationIndex === idx}
               onClick={() => setSelectedConversationIndex(idx)}
               badge={conv.unread || undefined}
             />
           ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main className={twMerge(
        "flex-1 flex flex-col bg-zinc-950/20 absolute inset-0 md:relative md:flex transition-transform duration-300",
        selectedConversationIndex === null ? "translate-x-full md:translate-x-0 hidden" : "translate-x-0"
      )}>
        {activeConversation ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Chat Header */}
             <header className="h-16 md:h-20 border-b border-zinc-800 px-4 md:px-6 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3 md:gap-4">
                   <button onClick={() => setSelectedConversationIndex(null)} className="md:hidden p-2 text-zinc-400 active:scale-90 transition-transform" aria-label="Back to conversations">
                      <ArrowLeft size={20} />
                   </button>
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400 shadow-inner flex-shrink-0">
                      {activeConversation.peerProfile.displayName[0]}
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-xs md:text-sm font-black text-white tracking-tight italic truncate">{activeConversation.peerProfile.displayName}</h3>
                      <div className="flex items-center gap-1.5 md:gap-2">
                         <ShieldCheck size={10} className="text-blue-500" />
                         <span className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest truncate">E2EE SECURE</span>
                      </div>
                   </div>
                </div>
                <button className="p-2 text-zinc-500 hover:text-white transition-colors" aria-label="View group members">
                   <Users size={18} />
                </button>
             </header>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar bg-zinc-950/40">
                {activeConversation.messages.map((msg) => (
                  <MessageBubble 
                    key={msg.cid.toString()}
                    content={msg.payload.content} 
                    mediaCids={msg.payload.mediaCids}
                    isOwn={msg.isOwn} 
                    timestamp={new Date(Number(msg.data.timestampMs)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  />
                ))}
             </div>

             {/* Input Area */}
             <form onSubmit={handleSend} className="p-4 md:p-6 border-t border-zinc-800 bg-zinc-900/40 space-y-4">
                {attachments.length > 0 && (
                  <div className="flex gap-2 animate-in slide-in-from-bottom-2 duration-200 overflow-x-auto pb-2">
                     {attachments.map((file, i) => (
                       <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
                          <img src={URL.createObjectURL(file)} alt="Attachment" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                          >
                             <X size={10} />
                          </button>
                       </div>
                     ))}
                  </div>
                )}

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-[2rem] p-3 md:p-4 flex items-center gap-2 md:gap-4 shadow-xl">
                   <div className="flex items-center gap-0.5 md:gap-1">
                      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
                      <ToolButton onClick={() => fileInputRef.current?.click()} icon={<Image size={18} />} label="Add Image" />
                      <ToolButton icon={<Smile size={18} />} label="Add Emoji" />
                   </div>
                   <input 
                     type="text" 
                     value={inputText}
                     onChange={e => setInputText(e.target.value)}
                     placeholder="Type a secure message..."
                     className="flex-1 bg-transparent border-none text-[11px] md:text-sm font-medium text-white focus:ring-0 placeholder:text-zinc-600 outline-none"
                   />
                   <button 
                     type="submit"
                     disabled={(!inputText.trim() && attachments.length === 0)}
                     className="bg-blue-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl text-white shadow-lg shadow-blue-600/20 active:translate-y-0.5 transition-all flex-shrink-0 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none" 
                     aria-label="Send secure message"
                   >
                      <Send size={16} />
                   </button>
                </div>
             </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-1000 p-8 text-center">
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500 shadow-2xl mb-4">
                <MessageSquare size={32} />
             </div>
             <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-black text-white tracking-tighter italic uppercase">Secure Swarm Room</h3>
                <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed">Select a peer to start an End-to-End Encrypted conversation.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ConversationItem({ name, did, lastMsg, active, onClick, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={twMerge(
        "w-full p-4 rounded-3xl flex items-center gap-4 transition-all group",
        active ? "bg-zinc-800 text-white shadow-lg" : "hover:bg-zinc-800/30 text-zinc-400"
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xs font-black shadow-inner flex-shrink-0">
        {name.slice(0, 1)}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-0.5">
           <span className="font-black text-white text-sm tracking-tight truncate italic">{name}</span>
           {badge && <span className="bg-blue-600 text-[9px] text-white px-1.5 py-0.5 rounded-full font-black">{badge}</span>}
        </div>
        <p className="text-[10px] text-zinc-500 font-mono truncate mb-1">{did}</p>
        <p className="text-[11px] text-zinc-600 font-medium truncate italic line-clamp-1">{lastMsg}</p>
      </div>
    </button>
  );
}

function MessageBubble({ content, mediaCids, isOwn, timestamp }: any) {
  return (
    <div className={twMerge(
      "flex flex-col gap-1 max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
      isOwn ? "self-end items-end" : "self-start items-start"
    )}>
      <div className={twMerge(
        "p-4 text-sm font-medium rounded-3xl leading-relaxed shadow-lg flex flex-col gap-3",
        isOwn ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-800 text-zinc-100 rounded-tl-none"
      )}>
        {mediaCids && mediaCids.length > 0 && (
          <div className="w-48">
             <MediaGallery mediaCids={mediaCids} />
          </div>
        )}
        {content && <span>{content}</span>}
      </div>
      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{timestamp}</span>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
      {icon}
    </button>
  );
}
