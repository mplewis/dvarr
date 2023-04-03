import { describe, expect, it } from "vitest";
import { buildJSONAPIRequest } from "./jsonApi";

describe("JSONAPI", () => {
  describe("buildJSONAPIRequest", () => {
    it("builds a JSONAPI request", () => {
      expect(buildJSONAPIRequest("add", { a: 3, b: 2 })).toMatchInlineSnapshot(`
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
