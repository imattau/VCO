// packages/vco-cord/src/features/messages/MessageInput.tsx
import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Props {
  channelName: string;
  onSend: (content: string) => Promise<void>;
  disabled: boolean;
}

export function MessageInput({ channelName, onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSend = async () => {
    if (!value.trim() || disabled) return;
    const content = value;
    setValue("");
    await onSend(content);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 bg-zinc-700 rounded-lg px-4 py-2">
        <input
          className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-500 text-sm outline-none"
          placeholder={disabled ? "Solving PoW…" : `Message #${channelName}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={() => void handleSend()}
          disabled={disabled || !value.trim()}
          className="text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-zinc-600 text-xs mt-1 px-1">Every message is a signed VCO envelope with PoW difficulty 4</p>
    </div>
  );
}
