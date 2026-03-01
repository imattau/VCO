import React, { useState } from 'react';
import SearchBar from '@/features/search/SearchBar';
import SearchResults from '@/features/search/SearchResults';
import ReportForm from '@/features/moderation/ReportForm';
import AlertsDashboard from '@/features/moderation/AlertsDashboard';
import NodeSettings from '@/features/settings/NodeSettings';
import NetworkDocs from '@/features/docs/NetworkDocs';
import BrowseNodes from '@/features/nodes/BrowseNodes';
import { DiscoveryProvider } from '@/features/discovery/DiscoveryContext';
import { Search, ShieldAlert, Activity, LayoutGrid, Settings, HelpCircle, Bell, ChevronRight, Hash, Database, Clock, Target, Info, MessageCircle, MoreVertical, Loader2, Save, ShieldCheck, Zap, Maximize, Lock, Globe, BookOpen, Share2, Layers, Code, CheckCircle2, Server, SignalHigh, SignalMedium, SignalLow, Fingerprint, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

export type AppTab = 'search' | 'moderation' | 'settings' | 'docs' | 'browse-nodes' | 'alerts';

function Layout() {
  const [activeTab, setActiveTab] = useState<AppTab>('search');

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">VCO Discovery</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">Main Navigation</div>
          
          <button
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              activeTab === 'search' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Search size={18} className={activeTab === 'search' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
            Search Network
          </button>
          
          <button
            onClick={() => setActiveTab('moderation')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              activeTab === 'moderation' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <ShieldAlert size={18} className={activeTab === 'moderation' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
            Moderation Portal
          </button>
          
          <div className="pt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">Discovery Hub</div>
          <button 
            onClick={() => setActiveTab('browse-nodes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              activeTab === 'browse-nodes' 
                ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-800/20' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <LayoutGrid size={18} className={activeTab === 'browse-nodes' ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
            Browse Nodes
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              activeTab === 'alerts' 
                ? 'bg-zinc-800 text-white shadow-lg shadow-zinc-800/20' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Bell size={18} className={activeTab === 'alerts' ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
            Alerts & Reports
          </button>
        </nav>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-1">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
              activeTab === 'settings' 
                ? 'bg-zinc-800 text-zinc-100' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            <Settings size={14} className={activeTab === 'settings' ? 'text-blue-500' : ''} />
            Node Settings
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
              activeTab === 'docs' 
                ? 'bg-zinc-800 text-zinc-100' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            <HelpCircle size={14} className={activeTab === 'docs' ? 'text-emerald-500' : ''} />
            Network Documentation
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Strip */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-zinc-600">/</span>
            <h2 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
              {activeTab === 'search' ? 'Discovery & Search' : 
               activeTab === 'moderation' ? 'Verifiable Reporting' :
               activeTab === 'settings' ? 'Admission Policy' : 
               activeTab === 'browse-nodes' ? 'Network Topology' :
               activeTab === 'alerts' ? 'Global Alerts & Reputation' : 'Protocol Documentation'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Network Active
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full h-full">
            {activeTab === 'search' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tight">Search the Network</h3>
                  <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                    Query the decentralized keyword index to locate verifiable content objects across federated relays.
                  </p>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
                   <SearchBar />
                </div>
                
                <SearchResults />
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center py-10">
                <div className="w-full max-w-xl space-y-8 bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl shadow-2xl backdrop-blur-md">
                  <div className="text-center space-y-3">
                    <div className="inline-flex bg-red-600/10 p-4 rounded-2xl border border-red-600/20 mb-2">
                      <ShieldAlert className="text-red-500 w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Report Malicious Activity</h3>
                    <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
                      Submit a signed, verifiable report to the network to flag content for moderation.
                    </p>
                  </div>
                  <ReportForm />
                </div>
              </div>
            )}

            {activeTab === 'settings' && <NodeSettings />}
            {activeTab === 'docs' && <NetworkDocs />}
            {activeTab === 'browse-nodes' && <BrowseNodes />}
            {activeTab === 'alerts' && <AlertsDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DiscoveryProvider>
      <Layout />
    </DiscoveryProvider>
  );
}
