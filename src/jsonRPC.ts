import { z } from "zod";

const jsonRPCResponseSchema = z.union([
  z.object({
    id: z.string(),
    result: z.any(),
  }),
  z.object({
    id: z.string(),
    error: z.object({
      code: z.number(),
      message: z.string(),
      data: z.any().optional(),
    }),
  }),
]);

export type JSONRPCResponse = z.infer<typeof jsonRPCResponseSchema>;

export function buildJSONRPCRequest(
  method: string,
  params: Record<string, any>
) {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "id", method, params }),
  };
}

export async function makeJSONRPCRequest(
  url: string,
  method: string,
  params: Record<string, any>
) {
  const { headers, body } = buildJSONRPCRequest(method, params);
  const resp = await fetch(url, { method: "POST", headers, body });
  const json = await resp.json();
  return jsonRPCResponseSchema.parse(json);
}
