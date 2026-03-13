import React, { useState, useRef } from 'react';
import { useSocial } from '../SocialContext';
import { useToast } from '../../components/ToastProvider';
import { Send, Image, Smile, MapPin, Hash, Loader2, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function ComposePost() {
  const { createPost, profile } = useSocial();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['❤️', '🔥', '🚀', '✨', '👀', '🤖', '🔐', '🌐', '📡', '⚡'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(prev => [...prev, ...Array.from(e.target.files!).slice(0, 4 - prev.length)]);
    }
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation not supported by your browser", "error");
      return;
    }

    toast("Fetching swarm coordinates...", "info");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // In a real app we might reverse geocode, here we just append coordinates or a tag
        setContent(prev => prev + ` 📍 [${latitude.toFixed(2)}, ${longitude.toFixed(2)}]`);
        toast("Location coordinates attached", "success");
      },
      (err) => {
        toast("Failed to access location", "error");
      }
    );
  };

  const addHashtag = () => {
    if (!content.endsWith('#') && !content.endsWith(' ')) {
      setContent(prev => prev + ' #');
    } else if (!content.endsWith('#')) {
      setContent(prev => prev + '#');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsPublishing(true);
    try {
      await createPost(content, mediaFiles);
      setContent('');
      setMediaFiles([]);
      toast("Post published to the decentralized swarm", "success");
    } catch (err) {
      toast("Failed to publish post", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-white shadow-lg flex-shrink-0 italic uppercase">
          {profile?.displayName[0] || 'V'}
        </div>
        <div className="flex-1 space-y-4">
           <textarea
             value={content}
             onChange={e => setContent(e.target.value)}
             placeholder="What's happening in the swarm?"
             rows={3}
             className="w-full bg-transparent border-none text-xl font-medium text-white placeholder:text-zinc-600 focus:ring-0 resize-none leading-relaxed p-0 outline-none"
           />

           {mediaFiles.length > 0 && (
             <div className="grid grid-cols-2 gap-2 mt-2">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 group">
                     <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                       className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                     >
                        <X size={14} />
                     </button>
                  </div>
                ))}
             </div>
           )}
           
           <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
             <div className="flex items-center gap-1">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*" />
                <ToolButton onClick={() => fileInputRef.current?.click()} icon={<Image size={18} />} label="Add Image" />
                
                <div className="relative">
                  <ToolButton 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    icon={<Smile size={18} />} 
                    label="Emoji" 
                    active={showEmojiPicker}
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-20 flex gap-1 animate-in slide-in-from-bottom-2 duration-200">
                      {emojis.map(e => (
                        <button key={e} onClick={() => addEmoji(e)} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-lg">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <ToolButton onClick={addLocation} icon={<MapPin size={18} />} label="Location" />
                <ToolButton onClick={addHashtag} icon={<Hash size={18} />} label="Tags" />
             </div>

             <button
               onClick={handleSubmit}
               disabled={(!content.trim() && mediaFiles.length === 0) || isPublishing}
               className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:translate-y-0.5 flex items-center gap-2"
             >
               {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
               {isPublishing ? 'Publishing...' : 'Post'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick} 
      title={label} 
      aria-label={label} 
      className={twMerge(
        "p-2.5 rounded-xl transition-all",
        active ? "text-blue-500 bg-blue-500/10" : "text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10"
      )}
    >
      {icon}
    </button>
  );
}
