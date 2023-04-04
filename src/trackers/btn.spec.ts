import { describe, expect, it } from "vitest";
import { BTNSearchResult, Query, searchBTN } from "./btn";

describe("btn", () => {
  describe("searchBTN", () => {
    it("filters results as expected", async () => {
      const results = [
        { ID: "1", GroupName: "S01E01", TvdbID: "123" },
        { ID: "2", GroupName: "S01E02", TvdbID: "123" },
        { ID: "3", GroupName: "S01E03", TvdbID: "123" },
        { ID: "4", GroupName: "Season 1", TvdbID: "123" },
        { ID: "5", GroupName: "Season 2", TvdbID: "123" },
        { ID: "6", GroupName: "Season 3", TvdbID: "123" },
        { ID: "7", GroupName: "Season 1", TvdbID: "456" },
        { ID: "8", GroupName: "Season 2", TvdbID: "456" },
        { ID: "9", GroupName: "Season 3", TvdbID: "456" },
      ] as BTNSearchResult[];

      let query = "";
      const fetcher = async (text: string) => {
        query = text;
        return { results };
      };

      const resultIds = async (query: Query) => {
        let actual = await searchBTN(query, fetcher);
        if ("error" in actual) throw new Error(actual.error);
        return actual.results.map((r) => r.ID);
      };

      const q1 = { text: "Mr. Robot", tvdbID: "123" };
      expect(await resultIds(q1)).toEqual(["1", "2", "3", "4", "5", "6"]);

      const q2 = {
        text: "Mr. Robot",
        tvdbID: "123",
        filter: "season",
        season: "1",
      };
      expect(await resultIds(q2)).toEqual(["4"]);

      const q3 = {
        text: "Mr. Robot",
        tvdbID: "123",
        filter: "episode",
        season: "1",
        episode: "2",
      };
      expect(await resultIds(q3)).toEqual(["2"]);
    });
  });
});
