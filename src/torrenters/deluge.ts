import { errorFor, makeJSONRPCRequest } from "../jsonRPC";

/** Config to connect to a Deluge server. */
type DelugeConfig = {
  host: string;
  port: number;
  password: string;
};

/**
 * Login to a Deluge server and get an auth token.
 * @param url The URL of the Deluge server
 * @param password The password to use to authenticate
 * @returns The login cookie, or an error
 */
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

/** Client for a Deluge server. */
export class DelugeClient {
  /** Auth token, set before making an RPC request. */
  private cookie: string | undefined;
  constructor(private config: DelugeConfig) {}

  /**
   * Call a JSONRPC method on the Deluge server.
   * @param method The name of the JSONRPC method to call
   * @param params The params to pass to the method
   * @returns The result of the method call, or an error
   */
  private async req(
    method: string,
    params: any
  ): Promise<{ result: any } | { error: string }> {
    const url = `http://${this.config.host}:${this.config.port}/json`;
    if (!this.cookie) {
      const loginResult = await authenticate(url, this.config.password);
      if ("error" in loginResult) return loginResult;
      this.cookie = loginResult.cookie;
    }
    const args = { url, method, params, headers: { Cookie: this.cookie } };
    const { response } = await makeJSONRPCRequest(args);
    if ("error" in response)
      return errorFor("Deluge API error", response.error);
    return { result: response.result };
  }

  /**
   * Add a torrent from a URL.
   * @param torrentURL The URL to the torrent file to add
   * @returns `added` if the torrent was added, `alreadyExists` if the torrent
   *     already existed, or `error` if there was an error
   */
  async addTorrentFromURL(
    torrentURL: string
  ): Promise<
    | { added: { name: string; torrentID: string } }
    | { alreadyExists: { name: string; torrentID: string } }
    | { error: string }
  > {
    const dl = await this.req("web.download_torrent_from_url", [torrentURL]);
    if ("error" in dl) return dl;
    const path = dl.result;

    const infor = await this.req("web.get_torrent_info", [path]);
    if ("error" in infor) return infor;
    const { name, info_hash: torrentID } = infor.result;
    const info = { name, torrentID };

    const resp1 = await this.getStatus(info.torrentID);
    if ("error" in resp1) return resp1;
    // If the torrent already exists, return early - adding a duplicate
    // torrent causes a request that hangs forever
    if ("name" in resp1) return { alreadyExists: info };

    const resp2 = await this.req("web.add_torrents", [[{ path, options: {} }]]);
    if ("error" in resp2) return resp2;
    return { added: info };
  }

  /**
   * Get the status of a torrent.
   * @param torrentID The ID (hash) of the torrent
   * @returns `notFound` if the torrent was not found, `name` if the torrent
   *     was found, or `error` if there was an error
   */
  async getStatus(
    torrentID: string
  ): Promise<{ notFound: true } | { name: string } | { error: string }> {
    const params = [torrentID, ["name"]];
    const resp = await this.req("web.get_torrent_status", params);
    if ("error" in resp) return resp;
    if (Object.keys(resp.result).length === 0) return { notFound: true };
    return { name: resp.result.name };
  }
}
