import { describe, expect, it } from "vitest";
import { add } from "./foo";

describe("foo", () => {
  describe("add", () => {
    it("adds", async () => {
      expect(await add(3, 2)).toEqual(5);
    });
  });
});
