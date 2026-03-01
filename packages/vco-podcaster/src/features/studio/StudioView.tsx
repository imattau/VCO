import React, { useState, useRef } from 'react';
import { usePodcast } from '@/features/player/PodcastContext';
import { 
  User, 
  Upload, 
  Save, 
  CheckCircle2, 
  FileAudio, 
  X, 
  AlertCircle,
  Loader2,
  Music
} from 'lucide-react';

export default function StudioView() {
  const { channel, updateChannel, publishEpisode } = usePodcast();
  const [activeTab, setActiveTab] = useState<'profile' | 'upload'>('upload');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: channel?.name || '',
    bio: channel?.bio || '',
    categories: channel?.categories.join(', ') || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Upload State
  const [uploadData, setUploadData] = useState({
    title: '',
    summary: '',
    showNotes: '',
    contentType: 'audio/mpeg'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!channel) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateChannel({
      name: profileData.name,
      bio: profileData.bio,
      categories: profileData.categories.split(',').map(c => c.trim()).filter(Boolean)
    });
    setIsSavingProfile(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsPublishing(true);
    
    // Simulate reading duration
    const durationMs = 300000n; // Mock 5 mins for now

    await publishEpisode({
      title: uploadData.title,
      summary: uploadData.summary,
      showNotes: uploadData.showNotes,
      contentType: selectedFile.type || uploadData.contentType,
      durationMs,
      thumbnailCid: channel.avatarCid, // Default to channel avatar
      contentCid: new Uint8Array(32) // Will be set by publishEpisode
    }, selectedFile);

    setIsPublishing(false);
    setUploadData({ title: '', summary: '', showNotes: '', contentType: 'audio/mpeg' });
    setSelectedFile(null);
    setActiveTab('profile'); // Switch after publish
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-500/20">
              <Upload className="text-white w-8 h-8" />
            </div>
            Creator Studio
          </h2>
          <p className="text-zinc-500 text-lg font-medium">Manage your decentralized feed and publish new content.</p>
        </div>

        <nav className="flex gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-center">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Publish
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Channel Profile
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSave} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-6 mb-2">
                 <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-800 shadow-inner">
                    <User className="text-zinc-500 w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">General Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Channel Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    placeholder="e.g. Beyond the Swarm"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Categories (comma separated)</label>
                  <input
                    type="text"
                    value={profileData.categories}
                    onChange={e => setProfileData({...profileData, categories: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    placeholder="Tech, Privacy, Crypto"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Channel Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={e => setProfileData({...profileData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner resize-none leading-relaxed"
                  placeholder="Tell your listeners what the show is about..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl active:translate-y-1 flex items-center justify-center gap-3 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {isSavingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSavingProfile ? 'Updating Decentralized Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePublish} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
            {/* File Selection Area */}
            <div className="space-y-4">
               <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Media Source</label>
               {!selectedFile ? (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-4 border-dashed border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group cursor-pointer"
                 >
                    <div className="bg-zinc-800 p-6 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                       <Upload size={32} className="text-zinc-500 group-hover:text-white" />
                    </div>
                    <div className="text-center">
                       <p className="text-white font-black uppercase tracking-widest text-sm mb-1">Select Media File</p>
                       <p className="text-zinc-500 text-xs font-medium italic">MP3, WAV, or MP4 (Max 50MB for simulation)</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="audio/*,video/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                 </div>
               ) : (
                 <div className="bg-zinc-950 border border-blue-500/30 p-6 rounded-3xl flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-4">
                       <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20 text-blue-400">
                          {selectedFile.type.startsWith('video') ? <Music size={24} /> : <FileAudio size={24} />}
                       </div>
                       <div className="min-w-0">
                          <p className="text-white font-bold truncate text-lg tracking-tight">{selectedFile.name}</p>
                          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • READY TO HASH</p>
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="bg-zinc-900 text-zinc-500 hover:text-red-500 p-2 rounded-xl border border-zinc-800 hover:border-red-500/20 transition-all"
                    >
                       <X size={20} />
                    </button>
                 </div>
               )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Episode Title</label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={e => setUploadData({...uploadData, title: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                      placeholder="Give your episode a name"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Short Summary</label>
                    <textarea
                      value={uploadData.summary}
                      onChange={e => setUploadData({...uploadData, summary: e.target.value})}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-inner resize-none"
                      placeholder="One-sentence hook for the feed..."
                      required
                    />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Detailed Show Notes (Markdown)</label>
                  <textarea
                    value={uploadData.showNotes}
                    onChange={e => setUploadData({...uploadData, showNotes: e.target.value})}
                    className="w-full h-[194px] bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-inner resize-none leading-relaxed"
                    placeholder="# Topics
- Introduction
- The deep dive..."
                  />
               </div>
            </div>

            <div className="pt-4 flex flex-col gap-6">
               <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-3xl flex items-start gap-4">
                  <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Protocol Tip</p>
                     <p className="text-zinc-500 text-xs font-medium italic leading-relaxed">
                        Publishing will generate a new MediaManifest object, hash your media file to generate a content CID, and link it to the previous episode in your channel history.
                     </p>
                  </div>
               </div>

               <button
                type="submit"
                disabled={isPublishing || !selectedFile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl active:translate-y-1 flex items-center justify-center gap-3 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
              >
                {isPublishing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {isPublishing ? 'Hashing & Publishing to Swarm...' : 'Publish Episode to Network'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
