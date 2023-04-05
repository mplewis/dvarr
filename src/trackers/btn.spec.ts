import { describe, expect, it } from "vitest";
import { BTNSearchResult, Query, searchBTN, searchResultsFor } from "./btn";

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
      expect(query).toEqual("Mr. Robot");

      const q2 = {
        text: "Mr. Robot",
        tvdbID: "123",
        season: "1",
      };
      expect(await resultIds(q2)).toEqual(["4"]);

      const q3 = {
        text: "Mr. Robot",
        tvdbID: "123",
        season: "1",
        episode: "2",
      };
      expect(await resultIds(q3)).toEqual(["2"]);
    });
  });

  describe("searchResultsFor", () => {
    it("converts results as expected", async () => {
      const fixture = {
        jsonrpc: "2.0",
        id: "id",
        result: {
          torrents: {
            "1": { GroupName: "S01E01", TvdbID: "123" },
            "4": { GroupName: "Season 1", TvdbID: "123" },
            "5": { GroupName: "Season 2", TvdbID: "123" },
          },
        },
      } as const;

      let url = "";
      let method = "";
      let params: Record<string, any> = {};
      process.env.BTN_API_KEY = "SOME_API_KEY";
      const fetcher = async (xurl: string, xmethod: string, xparams: Record<string, any>) => {
        url = xurl;
        method = xmethod;
        params = xparams;
        return fixture;
      };

      const resp = await searchResultsFor("Mr. Robot", fetcher);
      expect(url).toEqual("https://api.broadcasthe.net");
      expect(method).toEqual("getTorrentsSearch");
      expect(params).toEqual({
        searchstr: "Mr. Robot",
        results: 999999999,
        key: "SOME_API_KEY",
      });
      expect(resp).toEqual({
        results: [
          { ID: "1", GroupName: "S01E01", TvdbID: "123" },
          { ID: "4", GroupName: "Season 1", TvdbID: "123" },
          { ID: "5", GroupName: "Season 2", TvdbID: "123" },
        ],
      });
    });
  });
});
