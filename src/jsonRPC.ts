import { z } from "zod";

const jsonRPCResponseSchema = z.union([
  z.object({
    id: z.string(),
    error: z.object({
      code: z.number(),
      message: z.string(),
      data: z.any().optional(),
    }),
  }),
  z.object({
    id: z.string(),
    result: z.any(),
  }),
]);

export type JSONRPCResponse = z.infer<typeof jsonRPCResponseSchema>;

export function buildJSONRPCRequest(
  method: string,
  params: Record<string, any>
): { headers: Record<string, string>; body: string } {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "id", method, params }),
  };
}

export async function makeJSONRPCRequest(args: {
  url: string;
  method: string;
  params: any;
  headers?: Record<string, string>;
}) {
  const { url, method, params } = args;
  const { headers: rpcHeaders, body } = buildJSONRPCRequest(method, params);
  const headers = { ...rpcHeaders, ...(args.headers ?? {}) };
  const resp = await fetch(url, { method: "POST", headers, body });
  const json = await resp.json();
  return { headers: resp.headers, response: jsonRPCResponseSchema.parse(json) };
}

export function errorFor(prefix: string, error: { code: number; message: string; data?: any }) {
  let msg = [prefix, error.code, error.message, error.data].filter(Boolean).join(": ");
  return { error: msg };
}
