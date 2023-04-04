import { match } from "ts-pattern";

import { makeJSONRPCRequest } from "../jsonAPI";

const btnAPIURL = "https://api.broadcasthe.net";

export type Query = {
  text: string;
  tvdbID: string;
} & (
  | {}
  | { filter: "season"; season: string }
  | { filter: "episode"; season: string; episode: string }
);

export type BTNSearchResult = {
  ID: string; // we populate this
  Category: "Season" | "Episode";
  Codec: string;
  Container: string;
  DownloadURL: string;
  GroupID: string;
  GroupName: string;
  ImdbID: string;
  InfoHash: string;
  Leechers: string;
  Origin: string;
  ReleaseName: string;
  Resolution: string;
  Seeders: string;
  Series: string;
  SeriesBanner: string;
  SeriesID: string;
  SeriesPoster: string;
  Size: string;
  Snatched: string;
  Source: string;
  Time: string;
  TvdbID: string;
  TvrageID: string;
  YoutubeTrailer: string;
};

export function padTwoDigits(n: string): string {
  return n.toString().length === 1 ? `0${n}` : n;
}

function groupNameFor(query: Query): string | null {
  return match(query)
    .with({ filter: "season" }, (q) => `Season ${q.season}`)
    .with(
      { filter: "episode" },
      (q) => `S${padTwoDigits(q.season)}E${padTwoDigits(q.episode)}`
    )
    .otherwise(() => null);
}

async function searchResultsFor(
  text: string,
  fetcher = makeJSONRPCRequest
): Promise<{ results: BTNSearchResult[] } | { error: string }> {
  const params = {
    searchstr: text,
    results: 999999999,
    key: process.env.BTN_API_KEY,
  };
  const resp = await fetcher(btnAPIURL, "getTorrentsSearch", params);
  if ("error" in resp) {
    const { code, message, data } = resp.error;
    return { error: `BTN API Error ${code}: ${message}: ${data}` };
  }
  const items = resp.result.torrents as Record<string, BTNSearchResult>;
  const results = Object.entries(items).map(([k, v]) => ({ ...v, ID: k }));
  return { results };
}

export async function searchBTN(
  query: Query,
  fetcher = searchResultsFor
): Promise<{ results: BTNSearchResult[] } | { error: string }> {
  const { text, tvdbID } = query;
  let res = await fetcher(text);
  if ("error" in res) return res;
  let { results } = res;

  results = results.filter((r) => r.TvdbID === tvdbID);
  const groupName = groupNameFor(query);
  if (groupName) results = results.filter((r) => r.GroupName === groupName);
  return { results };
}
