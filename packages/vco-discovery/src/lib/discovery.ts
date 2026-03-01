import { 
  encodeKeywordIndex, 
  decodeKeywordIndex, 
  KEYWORD_INDEX_SCHEMA_URI,
  KeywordIndexData,
  KeywordIndexEntry,
  encodeReport,
  decodeReport,
  REPORT_SCHEMA_URI,
  ReportReason,
  ReportData
} from "@vco/vco-schemas";

/**
 * VCO Discovery Service
 * 
 * Simulated service that handles keyword indexing and content reporting using VCO schemas.
 */

// Mock database for indices and reports
const mockIndices = new Map<string, Uint8Array>();
const mockReports: Uint8Array[] = [];

// Helper to simulate a 32-byte CID (e.g., multihash part)
const mockCid = (seed: string) => {
  const bytes = new Uint8Array(32);
  const seedBytes = new TextEncoder().encode(seed);
  bytes.set(seedBytes.slice(0, 32));
  return bytes;
};

// Seed initial data for multiple keywords
const seedData = async () => {
  const keywords = [
    {
      kw: "vco-protocol",
      entries: [
        { cid: mockCid("vco-core-spec-v3"), weight: 1.0, indexedAtMs: BigInt(Date.now()) },
        { cid: mockCid("vco-schemas-docs"), weight: 0.85, indexedAtMs: BigInt(Date.now() - 3600000) }
      ]
    },
    {
      kw: "core-spec",
      entries: [
        { cid: mockCid("vco-core-spec-v3"), weight: 0.95, indexedAtMs: BigInt(Date.now() - 86400000) }
      ]
    },
    {
      kw: "manifest-v3",
      entries: [
        { cid: mockCid("vco-manifest-v3-root"), weight: 1.0, indexedAtMs: BigInt(Date.now() - 172800000) }
      ]
    }
  ];

  for (const item of keywords) {
    const data: KeywordIndexData = {
      schema: KEYWORD_INDEX_SCHEMA_URI,
      keyword: item.kw,
      entries: item.entries
    };
    mockIndices.set(item.kw, encodeKeywordIndex(data));
  }
};

seedData();

export const DiscoveryService = {
  /**
   * Searches for a keyword and returns decoded results.
   */
  async search(keyword: string): Promise<KeywordIndexData | null> {
    const term = keyword.toLowerCase().trim();
    console.log(`DiscoveryService: Searching for "${term}"`);
    
    const encoded = mockIndices.get(term);
    if (!encoded) {
      console.warn(`DiscoveryService: No index found for "${term}"`);
      return null;
    }
    
    try {
      const decoded = decodeKeywordIndex(encoded);
      console.log(`DiscoveryService: Found ${decoded.entries.length} entries for "${term}"`);
      return decoded;
    } catch (err) {
      console.error("DiscoveryService: Search decoding failed:", err);
      return null;
    }
  },

  /**
   * Submits a report for a piece of content.
   */
  async submitReport(data: Omit<ReportData, 'schema' | 'timestampMs'>): Promise<void> {
    const report: ReportData = {
      ...data,
      schema: REPORT_SCHEMA_URI,
      timestampMs: BigInt(Date.now())
    };
    
    const encoded = encodeReport(report);
    mockReports.push(encoded);
    
    // Also save to localStorage for persistence
    const saved = localStorage.getItem('vco-submitted-reports') || '[]';
    try {
      const parsed = JSON.parse(saved);
      parsed.push({
        ...data,
        targetCid: Array.from(data.targetCid), // Convert to array for JSON
        timestampMs: Date.now()
      });
      localStorage.setItem('vco-submitted-reports', JSON.stringify(parsed));
    } catch (e) {
      console.error('Failed to save report to local storage', e);
    }

    console.log(`Submitted report for target CID: ${Array.from(data.targetCid).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)}...`);
  },

  /**
   * Returns all submitted reports.
   */
  async getReports(): Promise<ReportData[]> {
    const saved = localStorage.getItem('vco-submitted-reports') || '[]';
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        schema: REPORT_SCHEMA_URI,
        targetCid: new Uint8Array(p.targetCid),
        timestampMs: BigInt(p.timestampMs)
      }));
    } catch (e) {
      return [];
    }
  },

  /**
   * Returns a list of mock nodes for the Browse Nodes view.
   */
  async getNodes() {
     return [
       { id: 'relay-01.vco.network', region: 'US-East', latency: 42, policy: { minPowDifficulty: 24, maxEnvelopeSize: 4194304, supportsBlindRouting: true } },
       { id: 'relay-02.vco.network', region: 'EU-West', latency: 120, policy: { minPowDifficulty: 20, maxEnvelopeSize: 10485760, supportsBlindRouting: false } },
       { id: 'relay-03.vco.network', region: 'AS-South', latency: 280, policy: { minPowDifficulty: 28, maxEnvelopeSize: 2097152, supportsBlindRouting: true } },
     ];
  },

  /**
   * Helper to format a CID for display
   */
  formatCid(cid: Uint8Array): string {
    return Array.from(cid)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16) + '...';
  },

  /**
   * Basic validation for CID strings (simulation)
   */
  isValidCid(cid: string): boolean {
    // Check if it's a valid hex string or base32-ish (simulated)
    return cid.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(cid);
  }
};
