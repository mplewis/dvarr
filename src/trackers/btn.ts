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
  TorrentID: string;
  TvdbID: string;
  TvrageID: string;
  YoutubeTrailer: string;
};

export function padTwoDigits(n: string): string {
  return n.padStart(2, "0");
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

export async function searchBTN(
  query: Query
): Promise<{ results: BTNSearchResult[] } | { error: string }> {
  const { text, tvdbID } = query;
  const resp = await makeJSONRPCRequest(btnAPIURL, "getTorrentsSearch", {
    searchstr: text,
    results: 999999999,
    key: process.env.BTN_API_KEY,
  });
  if ("error" in resp) {
    const { code, message, data } = resp.error;
    return { error: `BTN API Error ${code}: ${message}: ${data}` };
  }

  let results = resp.result as BTNSearchResult[];
  results = results.filter((r) => r.TvdbID === tvdbID);
  const groupName = groupNameFor(query);
  if (groupName) results = results.filter((r) => r.GroupName === groupName);
  return { results };
}
