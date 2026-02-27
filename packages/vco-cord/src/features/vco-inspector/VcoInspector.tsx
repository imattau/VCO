// packages/vco-cord/src/features/vco-inspector/VcoInspector.tsx
import { decodeEnvelopeProto, getPowScore } from "@vco/vco-core";
import { ShieldCheck, ShieldX, Zap, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge.js";
import type { VcoMessage } from "../../types/index.js";

interface Props {
  message: VcoMessage | null;
  onClose: () => void;
}

function hex(arr: Uint8Array) {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function row(label: string, value: string, mono = true) {
  return (
    <div key={label} className="py-1.5 border-b border-zinc-700 last:border-0">
      <div className="text-zinc-500 text-xs mb-0.5">{label}</div>
      <div className={mono ? "font-mono text-xs text-zinc-300 break-all" : "text-sm text-zinc-200"}>
        {value}
      </div>
    </div>
  );
}

export function VcoInspector({ message, onClose }: Props) {
  if (!message) {
    return (
      <div className="w-80 bg-zinc-900 border-l border-zinc-700 flex items-center justify-center text-zinc-600 text-sm shrink-0">
        Click a message to inspect its VCO envelope
      </div>
    );
  }

  const envelope = decodeEnvelopeProto(message.rawEnvelope);
  const { header } = envelope;

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-700 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <span className="font-semibold text-white text-sm">VCO Inspector</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={14} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex gap-2 mb-3">
          {message.verified
            ? <Badge variant="success"><ShieldCheck size={10} className="inline mr-1" />Verified</Badge>
            : <Badge variant="danger"><ShieldX size={10} className="inline mr-1" />Invalid</Badge>}
          <Badge variant="warning"><Zap size={10} className="inline mr-1" />PoW {message.powScore}</Badge>
        </div>

        {row("Header Hash", hex(envelope.headerHash))}
        {row("Creator ID", hex(header.creatorId))}
        {row("Signature", hex(header.signature))}
        {row("Version", String(header.version), false)}
        {row("Flags", `0x${header.flags.toString(16).padStart(2, "0")} (${header.flags.toString(2).padStart(8, "0")})`)}
        {row("PoW Nonce", String(header.nonce), false)}
        {row("PoW Score", String(getPowScore(envelope.headerHash)), false)}
        {row("Payload Type", `0x${header.payloadType.toString(16)}`)}
        {row("Payload (UTF-8)", new TextDecoder().decode(envelope.payload), false)}
        {row("Raw bytes", message.rawEnvelope.length + " bytes", false)}
      </div>
    </div>
  );
}
