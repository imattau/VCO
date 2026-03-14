import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  LayoutDashboard, 
  Settings,
  Shield,
  Search,
  Plus
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SocialProvider, useSocial } from './features/SocialContext';
import { FeedView } from './features/feed/FeedView';
import { MessageView } from './features/messaging/MessageView';
import { NotificationView } from './features/notifications/NotificationView';
import { ProfileView } from './features/profile/ProfileView';
import { SettingsView } from './features/settings/SettingsView';
import { AuthView } from './features/auth/AuthView';
import { MobileNav } from './components/MobileNav';
import { SearchOverlay } from './features/search/SearchOverlay';
import { NavItem } from '@vco/vco-ui';
import { ToastProvider } from './components/ToastProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

import { SwarmPulse } from './components/SwarmPulse';

export type SocialTab = 'feed' | 'messaging' | 'notifications' | 'profile' | 'settings';

function MainContent() {
  const { 
    profile, 
    identity, 
    isLoading, 
    activeTab, 
    setActiveTab, 
    isNodeReady, 
    peerId, 
    notifications, 
    conversations,
    unlock,
    createIdentity,
    hasExistingIdentity
  } = useSocial();

  const [hasExisting, setHasExisting] = useState<boolean | null>(null);

  React.useEffect(() => {
    hasExistingIdentity().then(setHasExisting);
  }, [hasExistingIdentity]);

  if (isLoading || hasExisting === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center animate-pulse">
        <Shield className="text-zinc-800 w-16 h-16 mb-4" />
        <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] italic">Accessing Secure Vault...</p>
      </div>
    );
  }

  if (!identity) {
    return (
      <AuthView 
        onUnlock={unlock} 
        onCreate={createIdentity} 
        hasExisting={hasExisting} 
      />
    );
  }

  if (!profile) return null;

  const unreadMessages = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans text-sm md:text-base">
      {/* Sidebar Navigation - Hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0 z-10">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white hidden md:block italic uppercase">VCO Social</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Feed" 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')} 
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Messages" 
            active={activeTab === 'messaging'} 
            onClick={() => setActiveTab('messaging')} 
            badge={unreadMessages > 0 ? unreadMessages : undefined}
          />
          <NavItem 
            icon={<Bell size={20} />} 
            label="Notifications" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
            badge={notifications.length > 0 ? notifications.length : undefined}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-6">
          <button 
            onClick={() => setActiveTab('settings')}
            className={twMerge(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === 'settings' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            )}
          >
            <Settings size={16} />
            <span className="hidden md:inline">Settings</span>
          </button>

          <div className="hidden md:block">
             <SwarmPulse />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-24 md:pb-0">
         {/* Top Header Strip */}
         <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 md:px-8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
             <SearchOverlay />
             {/* Mobile Logo */}
             <div className="md:hidden flex items-center gap-3">
               <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                 <Shield className="text-white w-5 h-5" />
               </div>
               <h1 className="text-lg font-black tracking-tight text-white italic uppercase">VCO</h1>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={twMerge(
               "hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
               isNodeReady ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
             )} title={peerId || "Connecting..."}>
                <div className={twMerge("w-1.5 h-1.5 rounded-full", isNodeReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                {isNodeReady ? "Swarm Connected" : "Connecting..."}
             </div>
             
             <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 md:px-4 md:py-1.5 rounded-full md:rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:translate-y-0.5">
                <Plus size={18} />
                <span className="hidden md:inline">New Post</span>
             </button>
             <div 
               onClick={() => setActiveTab('profile')}
               className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-white italic shadow-lg shadow-blue-600/10 cursor-pointer hover:scale-105 transition-all active:scale-95"
             >
                {profile.displayName.slice(0, 1)}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <div className="max-w-4xl mx-auto w-full p-4 md:p-10">
              {activeTab === 'feed' && <FeedView />}
              {activeTab === 'messaging' && <MessageView />}
              {activeTab === 'notifications' && <NotificationView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'settings' && <SettingsView />}
           </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SocialProvider>
           <MainContent />
        </SocialProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
