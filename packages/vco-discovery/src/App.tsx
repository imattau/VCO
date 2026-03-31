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
import { NavItem, Card } from '@vco/vco-ui';

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
          <h1 className="text-lg font-bold tracking-tight text-white italic uppercase">VCO Discovery</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">Main Navigation</div>
          
          <NavItem
            onClick={() => setActiveTab('search')}
            active={activeTab === 'search'}
            label="Search Network"
            icon={<Search size={18} />}
            className={activeTab === 'search' ? 'bg-blue-600 shadow-blue-600/20 text-white' : ''}
            iconClassName={activeTab === 'search' ? 'text-white' : ''}
          />
          
          <NavItem
            onClick={() => setActiveTab('moderation')}
            active={activeTab === 'moderation'}
            label="Moderation Portal"
            icon={<ShieldAlert size={18} />}
            className={activeTab === 'moderation' ? 'bg-red-600 shadow-red-600/20 text-white' : ''}
            iconClassName={activeTab === 'moderation' ? 'text-white' : ''}
          />
          
          <div className="pt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">Discovery Hub</div>
          <NavItem 
            onClick={() => setActiveTab('browse-nodes')}
            active={activeTab === 'browse-nodes'}
            label="Browse Nodes"
            icon={<LayoutGrid size={18} />}
          />
          <NavItem 
            onClick={() => setActiveTab('alerts')}
            active={activeTab === 'alerts'}
            label="Alerts & Reports"
            icon={<Bell size={18} />}
            iconClassName={activeTab === 'alerts' ? 'text-red-500' : ''}
          />
        </nav>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-1">
          <NavItem 
            onClick={() => setActiveTab('settings')}
            active={activeTab === 'settings'}
            label="Node Settings"
            icon={<Settings size={14} />}
            className="py-2.5 text-xs"
          />
          <NavItem 
            onClick={() => setActiveTab('docs')}
            active={activeTab === 'docs'}
            label="Documentation"
            icon={<HelpCircle size={14} />}
            className="py-2.5 text-xs"
            iconClassName={activeTab === 'docs' ? 'text-emerald-500' : ''}
          />
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
                
                <Card className="p-8 backdrop-blur-md">
                   <SearchBar />
                </Card>
                
                <SearchResults />
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center py-10">
                <Card className="w-full max-w-xl p-10 backdrop-blur-md">
                  <div className="text-center space-y-3">
                    <div className="inline-flex bg-red-600/10 p-4 rounded-2xl border border-red-600/20 mb-2">
                      <ShieldAlert className="text-red-500 w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Report Malicious Activity</h3>
                    <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed mb-6">
                      Submit a signed, verifiable report to the network to flag content for moderation.
                    </p>
                  </div>
                  <ReportForm />
                </Card>
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
