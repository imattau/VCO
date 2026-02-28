import { describe, it, expect } from "vitest";
import { encodePoll, decodePoll, POLL_SCHEMA_URI } from "../coordination/poll.js";
import { encodeVote, decodeVote, VOTE_SCHEMA_URI } from "../coordination/vote.js";
import { encodeEvent, decodeEvent, EVENT_SCHEMA_URI } from "../coordination/event.js";
import { encodeRsvp, decodeRsvp, RSVP_SCHEMA_URI } from "../coordination/rsvp.js";
import { encodeAnnouncement, decodeAnnouncement, ANNOUNCEMENT_SCHEMA_URI } from "../coordination/announcement.js";

const cid = () => new Uint8Array(34).fill(0x77);

describe("Poll roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodePoll({ schema: POLL_SCHEMA_URI, question: "Best option?", options: ["A", "B", "C"], closesAtMs: 9_999_999_999_999n, timestampMs: 0n });
    const d = decodePoll(bytes);
    expect(d.question).toBe("Best option?");
    expect(d.options).toEqual(["A", "B", "C"]);
    expect(d.closesAtMs).toBe(9_999_999_999_999n);
  });
});

describe("Vote roundtrip", () => {
  it("roundtrips option index", () => {
    const bytes = encodeVote({ schema: VOTE_SCHEMA_URI, pollCid: cid(), optionIndex: 2, timestampMs: 0n });
    const d = decodeVote(bytes);
    expect(d.optionIndex).toBe(2);
    expect(d.pollCid).toEqual(cid());
  });
});

describe("Event roundtrip", () => {
  it("roundtrips all fields", () => {
    const bytes = encodeEvent({ schema: EVENT_SCHEMA_URI, title: "Hackathon", description: "Build stuff", startMs: 1_700_000_000_000n, endMs: 1_700_086_400_000n, location: "Online", previousCid: new Uint8Array(0) });
    const d = decodeEvent(bytes);
    expect(d.title).toBe("Hackathon");
    expect(d.startMs).toBe(1_700_000_000_000n);
    expect(d.endMs).toBe(1_700_086_400_000n);
    expect(d.location).toBe("Online");
  });
});

describe("Rsvp roundtrip", () => {
  it("roundtrips status", () => {
    const bytes = encodeRsvp({ schema: RSVP_SCHEMA_URI, eventCid: cid(), status: "yes", timestampMs: 0n });
    const d = decodeRsvp(bytes);
    expect(d.status).toBe("yes");
    expect(d.eventCid).toEqual(cid());
  });
});

describe("Announcement roundtrip", () => {
  it("roundtrips content and priority", () => {
    const bytes = encodeAnnouncement({ schema: ANNOUNCEMENT_SCHEMA_URI, content: "Heads up!", priority: "high", mediaCids: [cid()], timestampMs: 0n });
    const d = decodeAnnouncement(bytes);
    expect(d.content).toBe("Heads up!");
    expect(d.priority).toBe("high");
    expect(d.mediaCids).toHaveLength(1);
    expect(d.mediaCids[0]).toEqual(cid());
  });
});
