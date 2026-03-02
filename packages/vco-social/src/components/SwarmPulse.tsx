import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Database, ArrowRightLeft, Shield, Globe } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface PulseEvent {
  id: string;
  type: 'SYNC' | 'DISCOVERY' | 'PROTOCOL' | 'SECURITY';
  message: string;
}

export function SwarmPulse() {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  useEffect(() => {
    const eventTypes = [
      { type: 'SYNC', icon: <Database size={10} />, color: 'text-emerald-500' },
      { type: 'DISCOVERY', icon: <Globe size={10} />, color: 'text-blue-500' },
      { type: 'PROTOCOL', icon: <ArrowRightLeft size={10} />, color: 'text-amber-500' },
      { type: 'SECURITY', icon: <Shield size={10} />, color: 'text-purple-500' },
    ];

    const messages = [
      "Range bisection complete (depth 4)",
      "New peer joined via DHT",
      "Envelope #42 verified",
      "TOL handshake successful",
      "Merkle proof generated",
      "Reconciled 3 new objects",
      "QUIC stream established",
      "Identity manifest synced"
    ];

    const interval = setInterval(() => {
      const typeInfo = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const newEvent: PulseEvent = {
        id: Math.random().toString(36).slice(2, 9),
        type: typeInfo.type as any,
        message
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    }, 3000);

    return () => clearInterval(interval);
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
