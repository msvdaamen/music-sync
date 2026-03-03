import { describe, it, expect } from "vitest";

describe("Simple truthy test", () => {
  it("should expect true to equal true", () => {
    expect(true).toEqual(true);
  });
});
