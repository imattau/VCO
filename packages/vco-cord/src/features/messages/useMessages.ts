// packages/vco-cord/src/features/messages/useMessages.ts
import { useState, useEffect, useCallback } from "react";
import { subscribe, publish } from "../../lib/transport.js";
import { buildMessage, decodeMessage, uint8ArrayToHex } from "../../lib/vco.js";
import type { VcoMessage, Identity } from "../../types/index.js";

export function useMessages(channelId: string, identity: Identity | null) {
  const [messages, setMessages] = useState<VcoMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [knownAuthors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setMessages([]);
    const unsub = subscribe(channelId, (encoded) => {
      const msg = decodeMessage(channelId, encoded, knownAuthors);
      setMessages((prev) => [...prev, msg]);
    });
    return unsub;
  }, [channelId]);

  const send = useCallback(async (content: string) => {
    if (!identity || !content.trim()) return;
    setSending(true);
    try {
      knownAuthors.set(uint8ArrayToHex(identity.creatorId), identity.displayName);
      const msg = await buildMessage(channelId, content, identity);
      publish(channelId, msg.rawEnvelope);
    } finally {
      setSending(false);
    }
  }, [channelId, identity]);

  return { messages, send, sending };
}
