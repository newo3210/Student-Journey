//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from "vitest";
import {
  extractChallengeJwtFromMessage,
  parseTokenEnv,
  truncateAddress,
  walletFromPayload,
} from "../contracts/web3Auth";

// Truncate address tests - short display for UI fallback.
describe("truncateAddress", () => {
  it("shortens a full address", () => {
    expect(truncateAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234…5678",
    );
  });

  it("returns empty for empty input", () => {
    expect(truncateAddress("")).toBe("");
  });
});

// Token env parse tests - optional ERC-20 configuration.
describe("parseTokenEnv", () => {
  it("returns native-only when address absent", () => {
    const cfg = parseTokenEnv({});
    expect(cfg.address).toBeUndefined();
    expect(cfg.decimals).toBe(18);
  });

  it("parses ERC-20 fields", () => {
    const cfg = parseTokenEnv({
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      decimals: "6",
    });
    expect(cfg.address).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    expect(cfg.symbol).toBe("USDC");
    expect(cfg.decimals).toBe(6);
  });
});

// Challenge JWT extraction tests - SIWE message line parsing.
describe("extractChallengeJwtFromMessage", () => {
  it("extracts eyJ token from Challenge line", () => {
    const msg = ["Hello", "Challenge: eyJhbGciOiJIUzI1NiJ9.abc.def", ""].join(
      "\n",
    );
    expect(extractChallengeJwtFromMessage(msg)).toBe(
      "eyJhbGciOiJIUzI1NiJ9.abc.def",
    );
  });

  it("returns null when missing", () => {
    expect(extractChallengeJwtFromMessage("no challenge here")).toBeNull();
  });

  it("returns null for Challenge line without eyJ token", () => {
    expect(
      extractChallengeJwtFromMessage("Challenge: not-a-jwt\n"),
    ).toBeNull();
  });
});

// Wallet claim from payload tests - session JWT shapes.
describe("walletFromPayload", () => {
  it("reads app_metadata.wallet", () => {
    expect(
      walletFromPayload({
        app_metadata: { wallet: "0xABCDEF0123456789012345678901234567890ABC" },
      }),
    ).toBe("0xabcdef0123456789012345678901234567890abc");
  });

  it("reads root wallet claim", () => {
    expect(
      walletFromPayload({
        wallet: "0x1111111111111111111111111111111111111111",
      }),
    ).toBe("0x1111111111111111111111111111111111111111");
  });

  it("reads sub when it is an address", () => {
    expect(
      walletFromPayload({
        sub: "0x2222222222222222222222222222222222222222",
      }),
    ).toBe("0x2222222222222222222222222222222222222222");
  });

  it("returns null for invalid payload", () => {
    expect(walletFromPayload({ sub: "not-an-address" })).toBeNull();
  });

  it("returns null for truncated address", () => {
    expect(walletFromPayload({ wallet: "0xabc" })).toBeNull();
  });
});
