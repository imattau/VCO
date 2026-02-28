import { useState } from "react";
import { IdentityProvider, useIdentity } from "./features/identity/IdentityContext.js";
import { MarketplaceProvider, useMarketplace } from "./features/listings/MarketplaceContext.js";
import { ListingCard } from "./features/listings/ListingCard.js";
import { CreateListingModal } from "./features/listings/CreateListingModal.js";
import { ListingDetail } from "./features/listings/ListingDetail.js";
import { MakeOfferModal } from "./features/listings/MakeOfferModal.js";
import { OffersList } from "./features/listings/OffersList.js";
import type { ListingWithMetadata, OfferWithMetadata } from "./features/listings/MarketplaceContext.js";
import { uint8ArrayToHex, buildListing, buildOffer, buildReceipt, decodeOfferEnvelope } from "./lib/vco.js";
import { publish } from "./lib/transport.js";

function Layout() {
  const { identity } = useIdentity();
  const { listings, offers, addListing, addOffer } = useMarketplace();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingWithMetadata | null>(null);
  const [offerListing, setOfferListing] = useState<ListingWithMetadata | null>(null);
  const [tab, setTab] = useState<"browse" | "my-listings" | "offers">("browse");
  const [offerType, setOfferType] = useState<"buying" | "selling">("selling");

  const userId = identity ? uint8ArrayToHex(identity.creatorId) : "";

  const incomingOffers = offers.filter(o => 
    listings.some(l => l.id === o.listingId && l.authorId === userId)
  );
  
  const outgoingOffers = offers.filter(o => o.authorId === userId);

  const handleCreateListing = async (data: { title: string; description: string; priceSats: bigint }) => {
    if (!identity) return;
    const listing = await buildListing(data, identity);
    addListing(listing);
  };

  const handleMakeOffer = async (data: { listingId: string; offerSats: bigint; message: string }) => {
    if (!identity) return;
    const encoded = await buildOffer(data, identity);
    publish(`offers:${data.listingId}`, encoded);
    
    const knownAuthors = new Map([[uint8ArrayToHex(identity.creatorId), identity.displayName]]);
    addOffer(decodeOfferEnvelope(encoded, knownAuthors));
    
    alert("Offer published to the network!");
  };

  const handleBuyNow = async (listing: ListingWithMetadata) => {
    if (!identity) return;
    const data = {
      listingId: listing.id,
      offerSats: listing.priceSats,
      message: "I would like to buy this item at the listed price."
    };
    const encoded = await buildOffer(data, identity);
    publish(`offers:${listing.id}`, encoded);
    
    const knownAuthors = new Map([[uint8ArrayToHex(identity.creatorId), identity.displayName]]);
    addOffer(decodeOfferEnvelope(encoded, knownAuthors));

    setSelectedListing(null);
    alert("Purchase intent sent! Check your offers for updates.");
  };

  const handleAcceptOffer = async (offer: OfferWithMetadata) => {
    if (!identity) return;
    // In a real app, txId would come from a payment provider or on-chain tx
    const txId = `vco_tx_${Math.random().toString(36).slice(2, 10)}`;
    const encoded = await buildReceipt({
      listingId: offer.listingId,
      offerId: offer.id,
      txId
    }, identity);
    publish(`receipts:${offer.listingId}`, encoded);
    
    // We'd decode it back to add to state if we don't have decodeReceipt here
    // For now just alert or mock add
    alert("Offer accepted! Receipt published.");
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 font-sans">
      <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">V</div>
          <h1 className="text-xl font-bold tracking-tight">Marketplace</h1>
        </div>
        
        {identity && (
          <div className="flex items-center gap-3 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-zinc-100 leading-none">{identity.displayName}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{uint8ArrayToHex(identity.creatorId).slice(0, 8)}</span>
            </div>
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">
              {identity.displayName[0]}
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 p-4 space-y-1 bg-zinc-900/20">
          <button 
            onClick={() => setTab("browse")}
            className={`w-full text-left px-3 py-2 rounded font-medium text-sm transition-all ${tab === "browse" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            Browse Listings
          </button>
          <button 
            onClick={() => setTab("my-listings")}
            className={`w-full text-left px-3 py-2 rounded font-medium text-sm transition-all ${tab === "my-listings" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            My Listings
          </button>
          <button 
            onClick={() => setTab("offers")}
            className={`w-full text-left px-3 py-2 rounded font-medium text-sm transition-all ${tab === "offers" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}`}
          >
            Offers
          </button>
          <div className="pt-4 mt-4 border-t border-zinc-800/50">
             <button 
               onClick={() => setShowCreate(true)}
               className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-2 px-4 rounded text-sm transition-all shadow-sm active:scale-95"
             >
               Create Listing
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,transparent_50%)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {tab === "browse" ? "Recent Listings" : tab === "my-listings" ? "My Active Listings" : "Manage Offers"}
              </h2>
              
              {tab === "offers" && (
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button 
                    onClick={() => setOfferType("selling")}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${offerType === "selling" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Incoming (Selling)
                  </button>
                  <button 
                    onClick={() => setOfferType("buying")}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${offerType === "buying" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Outgoing (Buying)
                  </button>
                </div>
              )}
            </div>

            {tab === "offers" ? (
              <OffersList 
                mode={offerType}
                offers={offerType === "selling" ? incomingOffers : outgoingOffers} 
                listings={listings} 
                onAccept={handleAcceptOffer} 
              />
            ) : listings.filter(l => tab === "browse" || (identity && l.authorId === userId)).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700 border border-zinc-800">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M2 7v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7"/><path d="M12 18V9"/><path d="m9 15 3 3 3-3"/></svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-400">No active listings</h3>
                <p className="text-sm text-zinc-600 mt-1 mb-6">Be the first to publish a verifiable item to the network.</p>
                <button 
                  onClick={() => setShowCreate(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full text-sm transition-all"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {listings
                  .filter(l => tab === "browse" || (identity && l.authorId === uint8ArrayToHex(identity.creatorId)))
                  .map((l) => (
                    <ListingCard key={l.id} listing={l} onDetail={setSelectedListing} />
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateListingModal 
        isOpen={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSubmit={handleCreateListing} 
      />

      <ListingDetail 
        listing={selectedListing} 
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onMakeOffer={(l) => {
          setSelectedListing(null);
          setOfferListing(l);
        }}
        onBuyNow={handleBuyNow}
      />

      <MakeOfferModal 
        listing={offerListing} 
        isOpen={!!offerListing} 
        onClose={() => setOfferListing(null)} 
        onSubmit={handleMakeOffer} 
      />
    </div>
  );
}

export function App() {
  return (
    <IdentityProvider>
      <MarketplaceProvider>
        <Layout />
      </MarketplaceProvider>
    </IdentityProvider>
  );
}
