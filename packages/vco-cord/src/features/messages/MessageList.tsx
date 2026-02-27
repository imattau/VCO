// packages/vco-cord/src/features/messages/MessageList.tsx
import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Avatar } from "../../components/ui/Avatar.js";
import { Badge } from "../../components/ui/Badge.js";
import { Tooltip } from "../../components/ui/Tooltip.js";
import { ShieldCheck, ShieldX, Zap } from "lucide-react";
import type { VcoMessage } from "../../types/index.js";

interface Props {
  messages: VcoMessage[];
  onSelectMessage: (msg: VcoMessage) => void;
  selectedMessageId: string | null;
}

export function MessageList({ messages, onSelectMessage, selectedMessageId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        No messages yet. Send one to see VCO envelopes in action.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
      {messages.map((msg) => (
        <div
          key={msg.id}
          onClick={() => onSelectMessage(msg)}
          className={clsx(
            "flex gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            selectedMessageId === msg.id ? "bg-zinc-700" : "hover:bg-zinc-800",
          )}
        >
          <Avatar name={msg.authorName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-white text-sm">{msg.authorName}</span>
              <span className="text-zinc-500 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              <Tooltip text={msg.tampered ? "Signature invalid" : "Signature verified"}>
                {msg.tampered
                  ? <ShieldX size={12} className="text-red-400" />
                  : <ShieldCheck size={12} className="text-emerald-400" />}
              </Tooltip>
              <Tooltip text={`PoW score: ${msg.powScore}`}>
                <span className="flex items-center gap-0.5 text-yellow-500 text-xs">
                  <Zap size={10} />{msg.powScore}
                </span>
              </Tooltip>
              {msg.tampered && <Badge variant="danger">TAMPERED</Badge>}
            </div>
            <p className="text-zinc-200 text-sm break-words">{msg.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
