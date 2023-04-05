import { errorFor, makeJSONRPCRequest } from "../jsonRPC";

type DelugeConfig = {
  host: string;
  port: number;
  password: string;
};

function delugeURL(config: DelugeConfig) {
  return `http://${config.host}:${config.port}/json`;
}

async function authenticate(
  url: string,
  password: string
): Promise<{ cookie: string } | { error: string }> {
  const args = { url, method: "auth.login", params: [password] };
  const { headers, response } = await makeJSONRPCRequest(args);
  if ("error" in response) return errorFor("Deluge API error", response.error);
  const cookie = headers.get("Set-Cookie");
  if (!cookie) return { error: "No authentication cookie in response" };
  return { cookie };
}

export class DelugeClient {
  private cookie: string | undefined;
  constructor(private config: DelugeConfig) {}

  private async req(
    method: string,
    params: any
  ): Promise<{ result: any } | { error: string }> {
    const url = delugeURL(this.config);
    if (!this.cookie) {
      const loginResult = await authenticate(url, this.config.password);
      if ("error" in loginResult) return loginResult;
      console.log("authed");
      this.cookie = loginResult.cookie;
    }
    const args = { url, method, params, headers: { Cookie: this.cookie } };
    const { response } = await makeJSONRPCRequest(args);
    if ("error" in response)
      return errorFor("Deluge API error", response.error);
    return { result: response.result };
  }

  async addTorrentFromURL(
    torrentURL: string
  ): Promise<{ torrentID: string } | { error: string }> {
    const resp = await this.req("web.download_torrent_from_url", [torrentURL]);
    if ("error" in resp) return resp;
    const path = resp.result;

    console.log("resp1");
    const resp2 = await this.req("web.add_torrents", [
      [{ path, options: { add_paused: true } }],
    ]);
    if ("error" in resp2) return resp2;
    return { torrentID: resp2.result[0][1] };
  }
}
