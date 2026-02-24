import { describe, expect, it } from "vitest";
import { PowChallengePolicy } from "../src/index.js";

describe("PowChallengePolicy", () => {
  it("builds outbound challenge from local difficulty provider", () => {
    const policy = new PowChallengePolicy({
      minDifficultyProvider: () => 19,
      defaultTtlSeconds: 75,
      reasonProvider: () => "busy",
    });

    expect(policy.createOutboundChallenge()).toEqual({
      minDifficulty: 19,
      ttlSeconds: 75,
      reason: "busy",
    });
  });

  it("returns zero required difficulty when challenge expires", () => {
    let nowMs = 1_000;
    const policy = new PowChallengePolicy({
      now: () => nowMs,
    });

    policy.applyInboundChallenge({
      minDifficulty: 24,
      ttlSeconds: 2,
      reason: "load",
    });

    expect(policy.getRequiredDifficulty()).toBe(24);
    nowMs = 3_100;
    expect(policy.getRequiredDifficulty()).toBe(0);
    expect(policy.getActiveChallenge()).toBeUndefined();
  });
});
