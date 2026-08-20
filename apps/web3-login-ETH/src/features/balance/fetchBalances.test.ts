//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from "vitest";
import { snapshotWithErc20Failure } from "./fetchBalances";

// ERC-20 partial failure - native ETH retained when token read fails.
describe("snapshotWithErc20Failure", () => {
  it("keeps native ETH and nulls token with ERC-20-only error", () => {
    const snap = snapshotWithErc20Failure("1.25", "contract reverted");
    expect(snap.nativeEth).toBe("1.25");
    expect(snap.token).toBeNull();
    expect(snap.tokenConfigured).toBe(true);
    expect(snap.error).toBe("ERC-20 balance failed: contract reverted");
  });
});
