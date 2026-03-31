import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Database, ArrowRightLeft, Shield, Globe } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { NodeClient, NodeEvent } from '@/lib/NodeClient';

interface PulseEvent {
  id: string;
  type: 'SYNC' | 'DISCOVERY' | 'PROTOCOL' | 'SECURITY';
  message: string;
}

export function SwarmPulse() {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  useEffect(() => {
    const client = NodeClient.getInstance();

    const pushEvent = (type: PulseEvent['type'], message: string) => {
      const newEvent: PulseEvent = {
        id: Math.random().toString(36).slice(2, 9),
        type,
        message
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    };

    if (client.isReady) {
      pushEvent('PROTOCOL', 'Swarm connection active');
    }

    const cleanup = client.onEvent((event: NodeEvent) => {
      switch (event.type) {
        case 'ready':
          pushEvent('PROTOCOL', 'Swarm peer initialized');
          break;
        case 'envelope':
          pushEvent('SYNC', `Envelope verified on ${event.channelId.split('/').pop()}`);
          break;
        case 'stats':
          if (event.peers.length > 0) {
            pushEvent('DISCOVERY', `Connected to ${event.peers.length} peers`);
          }
          break;
        case 'resolving':
          pushEvent('DISCOVERY', `Querying DHT for ${event.cid.substring(0, 8)}`);
          break;
        case 'dial_success':
          pushEvent('PROTOCOL', `Connected to ${event.addr}`);
          break;
        case 'error':
          pushEvent('SECURITY', `Error: ${event.message}`);
          break;
      }
    });

    return () => { cleanup(); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-2">
            <Zap size={12} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Swarm Pulse</span>
         </div>
         <span className="text-[8px] font-mono text-zinc-600">VCO/3.2</span>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 h-32 overflow-hidden relative">
         <div className="space-y-2">
            <AnimatePresence initial={false}>
               {events.map((e) => (
                 <motion.div
                   key={e.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 10 }}
                   className="flex items-center gap-2"
                 >
                    <div className={twMerge(
                      "shrink-0",
                      e.type === 'SYNC' && "text-emerald-500",
                      e.type === 'DISCOVERY' && "text-blue-500",
                      e.type === 'PROTOCOL' && "text-amber-500",
                      e.type === 'SECURITY' && "text-purple-500"
                    )}>
                       {e.type === 'SYNC' && <Database size={10} />}
                       {e.type === 'DISCOVERY' && <Globe size={10} />}
                       {e.type === 'PROTOCOL' && <ArrowRightLeft size={10} />}
                       {e.type === 'SECURITY' && <Shield size={10} />}
                    </div>
                    <span className="text-[9px] font-medium text-zinc-400 truncate tracking-tight">{e.message}</span>
                 </motion.div>
               ))}
            </AnimatePresence>
         </div>
         
         <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
