// packages/vco-marketplace/src/components/ui/VcoImage.tsx
import { useState, useEffect } from "react";
import { reassembleVcoFile } from "../../lib/files.js";
import { useMarketplace } from "../../features/listings/MarketplaceContext.js";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  cid: string;
  className?: string;
}

export function VcoImage({ cid, className }: Props) {
  const { envelopes } = useMarketplace();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    const load = async () => {
      setLoading(true);
      try {
        const blob = await reassembleVcoFile(cid, async (targetCid) => {
          return envelopes.get(targetCid);
        });
        if (active) setBlobUrl(URL.createObjectURL(blob));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [cid, envelopes]);

  if (loading) {
    return (
      <div className={`bg-zinc-900 flex items-center justify-center ${className}`}>
        <Loader2 size={24} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className={`bg-zinc-900 flex flex-col items-center justify-center p-4 text-center ${className}`}>
        <AlertCircle size={20} className="text-red-500 mb-2" />
        <span className="text-[10px] text-zinc-600 font-mono break-all">{cid}</span>
      </div>
    );
  }

  return (
    <img 
      src={blobUrl} 
      alt="VCO Attachment" 
      className={`object-cover ${className}`} 
    />
  );
}
