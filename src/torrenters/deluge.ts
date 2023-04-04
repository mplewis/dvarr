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

async function downloadFile(
  url: string
): Promise<{ filename: string; data: ArrayBuffer } | { error: string }> {
  try {
    const resp = await fetch(url);
    console.log({ headers: resp.headers });
    const filename =
      resp.headers.get("Content-Disposition")?.split("=")[1] ??
      "MISSING_FILENAME.torrent";
    return { filename, data: await resp.arrayBuffer() };
  } catch (e: any) {
    return errorFrom(e);
  }
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
  const file = await downloadFile(torrentURL);
  if ("error" in file) return file;
  const { filename, data } = file;
  const filedump = encode(data);
  console.log(filedump);
  const options = { add_paused: false, remove_at_ratio: false };
  const params = { filename, filedump, options };
  const { response } = await makeJSONRPCRequest({
    url: delugeURL(config),
    method: "core.add_torrent_file",
    params,
    headers: { Cookie: globalAuth },
  });
  if ("error" in response) return errorFor("Deluge API error", response.error);
  return { torrentID: response.result };
}
