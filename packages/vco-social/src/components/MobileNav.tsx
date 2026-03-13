import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  LayoutDashboard
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SocialTab } from '../App';

interface MobileNavProps {
  activeTab: SocialTab;
  onTabChange: (tab: SocialTab) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-6 py-4 flex items-center justify-between z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <MobileNavItem 
        icon={<LayoutDashboard size={24} />} 
        active={activeTab === 'feed'} 
        onClick={() => onTabChange('feed')} 
      />
      <MobileNavItem 
        icon={<MessageSquare size={24} />} 
        active={activeTab === 'messaging'} 
        onClick={() => onTabChange('messaging')} 
      />
      <MobileNavItem 
        icon={<Bell size={24} />} 
        active={activeTab === 'notifications'} 
        onClick={() => onTabChange('notifications')} 
      />
      <MobileNavItem 
        icon={<Users size={24} />} 
        active={activeTab === 'profile'} 
        onClick={() => onTabChange('profile')} 
      />
    </div>
  );
}

interface MobileNavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

function MobileNavItem({ icon, active, onClick, badge }: MobileNavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={twMerge(
        "relative p-3 rounded-2xl transition-all active:scale-90",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-black animate-pulse border-2 border-zinc-900">
          {badge}
        </span>
      )}
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
      )}
    </button>
  );
}
