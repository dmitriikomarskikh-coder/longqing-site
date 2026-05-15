import fs from "node:fs";
import path from "node:path";
import {privateAuthDataDir} from "@/lib/private/config";

export type StoredCredential = {
  id: string;
  publicKey: string;
  counter: number;
  transports?: string[];
};

type AuthState = {
  credential?: StoredCredential;
  registrationChallenge?: string;
  loginChallenge?: string;
};

const authFile = () => path.join(privateAuthDataDir(), "owner-passkey.json");

function ensureDir() {
  fs.mkdirSync(privateAuthDataDir(), {recursive: true});
}

export function readAuthState(): AuthState {
  const file = authFile();
  if (!fs.existsSync(file)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as AuthState;
}

export function writeAuthState(state: AuthState) {
  ensureDir();
  fs.writeFileSync(authFile(), `${JSON.stringify(state, null, 2)}\n`);
}

export function hasRegisteredCredential() {
  return Boolean(readAuthState().credential);
}

export function setupTokenMatches(token?: string | null) {
  const expected = process.env.LONGQING_ADMIN_SETUP_TOKEN;
  return Boolean(expected && token && token === expected);
}
