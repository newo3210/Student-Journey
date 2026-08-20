//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from "vitest";
import { withTimeout } from "../lib/withTimeout";

// withTimeout tests - deadline rejects slow promises; fast ones resolve.
describe("withTimeout", () => {
  it("resolves when the promise finishes before the deadline", async () => {
    await expect(
      withTimeout(Promise.resolve("ok"), 1000, "fast"),
    ).resolves.toBe("ok");
  });

  it("rejects when the deadline elapses first", async () => {
    const slow = new Promise<string>((resolve) => {
      setTimeout(() => resolve("late"), 200);
    });
    await expect(withTimeout(slow, 20, "slow op")).rejects.toThrow(
      /slow op timed out after 20ms/,
    );
  });
});
