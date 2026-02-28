// packages/vco-marketplace/src/features/listings/ListingDetail.tsx
import { Modal } from "../../components/ui/Modal.js";
import { Avatar } from "../../components/ui/Avatar.js";
import type { ListingWithMetadata } from "./MarketplaceContext.js";
import { ShoppingCart, MessageSquare, Shield, ExternalLink } from "lucide-react";

interface Props {
  listing: ListingWithMetadata | null;
  onClose: () => void;
  onMakeOffer: (listing: ListingWithMetadata) => void;
}

export function ListingDetail({ listing, onClose, onMakeOffer }: Props) {
  if (!listing) return null;

  return (
    <Modal isOpen={!!listing} onClose={onClose} title="Item Details">
      <div className="space-y-6">
        <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
           <span className="text-zinc-700 text-sm font-mono uppercase tracking-[0.2em]">VCO Verifiable Object</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-black text-white">{listing.title}</h2>
            <div className="text-2xl font-black text-indigo-400">{listing.priceSats.toLocaleString()} <span className="text-xs uppercase">Sats</span></div>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Shield size={12} className="text-emerald-500" />
            <span>Valid VCO Protocol v3 Object</span>
            <span>•</span>
            <span>CID: {listing.id.slice(0, 16)}...</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
          <Avatar name={listing.authorName} size="md" />
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{listing.authorName}</div>
            <div className="text-[10px] text-zinc-500 font-mono">ID: {listing.authorId}</div>
          </div>
          <button className="text-zinc-500 hover:text-zinc-300"><ExternalLink size={16} /></button>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={() => onMakeOffer(listing)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <ShoppingCart size={18} /> Make Offer
          </button>
          <button className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700">
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
