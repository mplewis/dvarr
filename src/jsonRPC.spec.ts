import { describe, expect, it } from "vitest";
import { buildJSONRPCRequest } from "./jsonRPC";

describe("JSONRPC", () => {
  describe("buildJSONRPCRequest", () => {
    it("builds a JSONRPC request", () => {
      expect(buildJSONRPCRequest("add", { a: 3, b: 2 })).toMatchInlineSnapshot(`
        {
          "body": "{\\"jsonrpc\\":\\"2.0\\",\\"id\\":\\"id\\",\\"method\\":\\"add\\",\\"params\\":{\\"a\\":3,\\"b\\":2}}",
          "headers": {
            "Content-Type": "application/json",
          },
        }
      `);
    });
  });
});
