import { DelugeClient } from "./torrenters/deluge";

export type Clients = {
  deluge: DelugeClient;
};

// TODO: look into node-convict
export function envMust(key: string): string {
  const value = process.env[key];
  if (value === undefined) throw new Error(`Missing env var ${key}`);
  return value;
}

export function envMustInt(key: string): number {
  const value = envMust(key);
  const parsed = parseInt(value);
  if (isNaN(parsed)) throw new Error(`Env var ${key} is not a number`);
  return parsed;
}
