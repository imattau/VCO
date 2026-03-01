# Brainstorm: Extended VCO Schema Types (v3.2)

This document explores the implementation strategy for the additional VCO types proposed to expand the network's capabilities.

## 1. Search & Discovery: `KeywordIndex`

**Goal**: Enable decentralized indexing where nodes can broadcast their "knowledge" of what CIDs relate to specific keywords.

**Draft Schema (`proto/vco/schemas/index.proto`)**:
```proto
syntax = "proto3";
package vco.schemas;

message KeywordIndex {
  string schema = 1; // vco://schemas/index/keyword/v1
  string keyword = 2; // The normalized keyword (e.g., "p2p", "vco")
  
  message Entry {
    bytes cid = 1; // Multihash of the target object
    uint32 weight = 2; // Optional weight/relevance score
    int64 discovered_at = 3; // Timestamp when first indexed
  }
  
  repeated Entry entries = 3;
  bytes next_page_cid = 4; // Pointer to another KeywordIndex for the same keyword
}
```

**Implementation Considerations**:
- **Spam**: High PoW difficulty should be required for `KeywordIndex` payloads to prevent index flooding.
- **Aggregation**: Clients merge multiple `KeywordIndex` objects from different creators to build a local search index.

---

## 2. Moderation: `Report` / `Flag`

**Goal**: Provide a verifiable signal that content is problematic, allowing indexers to filter it.

**Draft Schema (`proto/vco/schemas/social/report.proto`)**:
```proto
syntax = "proto3";
package vco.schemas;

enum ReportReason {
  OTHER = 0;
  SPAM = 1;
  VIOLENCE = 2;
  HARASSMENT = 3;
  MALWARE = 4;
}

message Report {
  string schema = 1; // vco://schemas/social/report/v1
  bytes target_cid = 2; // CID of the object being reported
  ReportReason reason = 3;
  string detail = 4; // Optional textual description
  bytes proof_of_harm = 5; // Optional CID to supporting evidence
}
```

**Implementation Considerations**:
- **Privacy**: Reports could be sent to a specific `context_id` monitored by moderators.
- **Reputation**: The weight of a report depends on the `creator_id`'s reputation (Web-of-Trust).

---

## 3. Monetization: `SubscriptionManifest`

**Goal**: Link to content that requires specific authorization or payment, often resolved via ZKP.

**Draft Schema (`proto/vco/schemas/marketplace/subscription.proto`)**:
```proto
syntax = "proto3";
package vco.schemas;

message SubscriptionManifest {
  string schema = 1; // vco://schemas/marketplace/subscription/v1
  bytes content_cid = 2; // Root CID of the restricted content
  string tier_name = 3; // e.g., "Gold", "Supporter"
  
  message Requirement {
    uint32 type = 1; // 1 = ZKP Proof, 2 = Payment Receipt
    bytes contract_id = 2; // Optional: reference to a smart contract or policy
    bytes circuit_id = 3; // For ZKP: which circuit must be satisfied
  }
  
  repeated Requirement requirements = 4;
}
```

**Implementation Considerations**:
- **ZKP Integration**: Ties into the `VcoZkpExtension` in the envelope header.
- **Gateways**: Relays might only serve the `content_cid` if the requesting node provides a valid proof.

---

## 4. Network Health: `RelayAdmissionPolicy`

**Goal**: Allow relays to broadcast their rules so clients can choose the right relay for their traffic.

**Draft Schema (`proto/vco/schemas/network/policy.proto`)**:
```proto
syntax = "proto3";
package vco.schemas;

message RelayAdmissionPolicy {
  string schema = 1; // vco://schemas/network/policy/v1
  uint32 min_pow_difficulty = 2;
  repeated uint32 accepted_payload_types = 3;
  uint32 max_envelope_size = 4;
  uint32 storage_ttl_seconds = 5;
  bool requires_zkp_auth = 6;
}
```

---

## Next Steps

1. **Select Priority**: `KeywordIndex` and `Report` are highest priority for "healthy swarm" growth.
2. **Refine Protos**: Finalize the Protobuf definitions.
3. **Generate & Export**: Run `npm run generate:proto` and update `packages/vco-schemas/src/index.ts`.
4. **Integration**: Update `vco-relay` or `vco-desktop` to handle these new types.
