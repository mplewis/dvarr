import { errorFor, makeJSONRPCRequest } from "../jsonRPC";
import { encode } from "base64-arraybuffer";

type DelugeConfig = {
  host: string;
  port: number;
  password: string;
};

let globalAuth = ""; // HACK

function delugeURL(config: DelugeConfig) {
  return `http://${config.host}:${config.port}/json`;
}

function errorFrom(e: any): { error: string } {
  const msg: string = e.stack?.toString() ?? e.toString();
  return { error: msg };
}

export async function login(
  config: DelugeConfig
): Promise<{ cookie: string } | { error: string }> {
  const { headers, response } = await makeJSONRPCRequest({
    url: delugeURL(config),
    method: "auth.login",
    params: [config.password],
  });
  if ("error" in response) return errorFor("Deluge API error", response.error);
  const cookie = headers.get("Set-Cookie");
  if (!cookie) return { error: "No authentication cookie in response" };
  globalAuth = cookie;
  return { cookie };
}

export async function addTorrentFromURL(
  config: DelugeConfig,
  torrentURL: string
): Promise<{ torrentID: string } | { error: string }> {
  const url = delugeURL(config);
  const { response } = await makeJSONRPCRequest({
    url,
    headers: { Cookie: globalAuth },
    method: "web.download_torrent_from_url",
    params: [torrentURL],
  });
  if ("error" in response) return errorFor("Deluge API error", response.error);
  const path = response.result;

  const { response: response2 } = await makeJSONRPCRequest({
    url,
    headers: { Cookie: globalAuth },
    method: "web.add_torrents",
    params: [[{ path, options: { add_paused: true } }]],
  });
  if ("error" in response2)
    return errorFor("Deluge API error", response2.error);
  return { torrentID: response2.result };
}
