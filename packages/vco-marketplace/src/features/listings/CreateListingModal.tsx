// packages/vco-marketplace/src/features/listings/CreateListingModal.tsx
import { useState } from "react";
import { Modal } from "../../components/ui/Modal.js";
import { Package, AlignLeft, DollarSign, Clock, Send } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; priceSats: bigint }) => Promise<void>;
}

export function CreateListingModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1000");
  const [busy, setBusy] = useState(false);

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({ 
        title, 
        description, 
        priceSats: BigInt(price) 
      });
      setTitle("");
      setDescription("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Listing">
      <form onSubmit={handleSub} className="space-y-5 py-2">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Item Title</label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you selling?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Description</label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-zinc-600" size={16} />
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Price (SATS)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Expiry (Days)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white appearance-none">
                <option>7 Days</option>
                <option>30 Days</option>
                <option>Never</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/50 mt-2">
          <button 
            disabled={busy}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            {busy ? "Signing Envelope..." : <><Send size={16} /> Publish Listing</>}
          </button>
          <p className="text-[10px] text-center text-zinc-600 mt-3 italic">This will generate a signed VCO object with Proof-of-Work.</p>
        </div>
      </form>
    </Modal>
  );
}
