// packages/vco-cord/src/App.tsx
import { useState } from "react";
import { IdentityProvider, useIdentity } from "./features/identity/IdentityContext.js";
import { ServerProvider, useServers } from "./features/servers/ServerContext.js";
import { ServerList } from "./features/servers/ServerList.js";
import { ChannelList } from "./features/channels/ChannelList.js";
import { MessageList } from "./features/messages/MessageList.js";
import { MessageInput } from "./features/messages/MessageInput.js";
import { VcoInspector } from "./features/vco-inspector/VcoInspector.js";
import { useMessages } from "./features/messages/useMessages.js";
import type { VcoMessage } from "./types/index.js";

function MessageArea() {
  const { activeChannel } = useServers();
  const { identity } = useIdentity();
  const { messages, send, sending } = useMessages(activeChannel.id, identity);
  const [selectedMessage, setSelectedMessage] = useState<VcoMessage | null>(null);

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-750">
        {/* Channel header */}
        <div className="px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
          <span className="text-zinc-400">#</span>
          <span className="font-semibold text-white">{activeChannel.name}</span>
          <span className="text-zinc-500 text-sm">— {activeChannel.description}</span>
        </div>
        <MessageList
          messages={messages}
          onSelectMessage={setSelectedMessage}
          selectedMessageId={selectedMessage?.id ?? null}
        />
        <MessageInput
          channelName={activeChannel.name}
          onSend={send}
          disabled={!identity || sending}
        />
      </div>
      <VcoInspector
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </>
  );
}

function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ServerList />
      <ChannelList />
      <MessageArea />
    </div>
  );
}

export function App() {
  return (
    <IdentityProvider>
      <ServerProvider>
        <Layout />
      </ServerProvider>
    </IdentityProvider>
  );
}
