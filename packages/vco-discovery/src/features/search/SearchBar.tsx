import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDiscovery } from '@/features/discovery/DiscoveryContext';

export default function SearchBar() {
  const [keyword, setKeyword] = useState('');
  const { search, isSearching } = useDiscovery();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    
    await search(keyword);
  };

  return (
    <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
      <div className="relative">
        <input
          id="network-search"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter a keyword (e.g. vco-protocol)..."
          className="w-full px-6 py-5 pl-14 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xl text-white placeholder-zinc-600 shadow-inner group-hover:border-zinc-700 font-medium"
        />
        <label htmlFor="network-search" className="sr-only">Search the VCO Network</label>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-6 h-6 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
      </div>
      
      <button
        type="submit"
        disabled={isSearching}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-blue-600/20 active:translate-y-0.5 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
      >
        {isSearching ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4" />
            Querying...
          </div>
        ) : 'Search Network'}
      </button>
    </form>
  );
}
