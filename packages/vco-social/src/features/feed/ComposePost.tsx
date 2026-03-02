import React, { useState } from 'react';
import { useSocial } from '../SocialContext';
import { useToast } from '../../components/ToastProvider';
import { Send, Image, Smile, MapPin, Hash, Loader2 } from 'lucide-react';

export function ComposePost() {
  const { createPost } = useSocial();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files).slice(0, 4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsPublishing(true);
    await createPost(content, mediaFiles);
    setContent('');
    setMediaFiles([]);
    setIsPublishing(false);
    toast("Post published to the decentralized swarm", "success");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black shadow-inner flex-shrink-0">
          JD
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
                  <div key={i} className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                     <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                       className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-all"
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
                <ToolButton icon={<Smile size={18} />} label="Emoji" />
                <ToolButton icon={<MapPin size={18} />} label="Location" />
                <ToolButton icon={<Hash size={18} />} label="Tags" />
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

import { X } from 'lucide-react';
import { useRef } from 'react';

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="p-2.5 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
      {icon}
    </button>
  );
}
