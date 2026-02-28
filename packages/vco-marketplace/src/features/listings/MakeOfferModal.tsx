// packages/vco-marketplace/src/features/listings/MakeOfferModal.tsx
import { useState } from "react";
import { Modal } from "../../components/ui/Modal.js";
import { DollarSign, MessageSquare, Send } from "lucide-react";
import type { ListingWithMetadata } from "./MarketplaceContext.js";

interface Props {
  listing: ListingWithMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { listingId: string; offerSats: bigint; message: string }) => Promise<void>;
}

export function MakeOfferModal({ listing, isOpen, onClose, onSubmit }: Props) {
  const [offerPrice, setOfferPrice] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!listing) return null;

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({ 
        listingId: listing.id, 
        offerSats: BigInt(offerPrice), 
        message 
      });
      setOfferPrice("");
      setMessage("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Make Offer for ${listing.title}`}>
      <form onSubmit={handleSub} className="space-y-5 py-2">
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center justify-between mb-4">
           <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Asking Price</span>
           <span className="font-mono text-white">{listing.priceSats.toLocaleString()} SATS</span>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Your Offer (SATS)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              required
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder={listing.priceSats.toString()}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Message to Seller</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-zinc-600" size={16} />
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in this item..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/50 mt-2">
          <button 
            disabled={busy}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            {busy ? "Signing Offer..." : <><Send size={16} /> Send Offer</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
