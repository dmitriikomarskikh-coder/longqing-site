import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import type {AuthenticatorTransportFuture} from "@simplewebauthn/server";
import {authOrigin, authRpId, allowedOrigins} from "@/lib/private/config";
import {readAuthState, writeAuthState, type StoredCredential} from "@/lib/private/auth-store";

function credentialToWebAuthn(credential: StoredCredential) {
  return {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey, "base64url"),
    counter: credential.counter,
    transports: credential.transports as AuthenticatorTransportFuture[] | undefined
  };
}

function assertAllowedOrigin(origin: string) {
  if (!allowedOrigins().has(origin)) {
    throw new Error("Origin is not allowed for passkey authentication");
  }
}

export async function registrationOptions() {
  const state = readAuthState();
  const options = await generateRegistrationOptions({
    rpName: "LONGQING private outreach",
    rpID: authRpId(),
    userName: "longqing-owner",
    userID: Buffer.from("longqing-owner"),
    attestationType: "none",
    excludeCredentials: state.credential ? [{id: state.credential.id}] : undefined
  });
  writeAuthState({...state, registrationChallenge: options.challenge});
  return options;
}

export async function verifyRegistration(response: unknown, origin = authOrigin()) {
  assertAllowedOrigin(origin);
  const state = readAuthState();
  if (!state.registrationChallenge) {
    throw new Error("Registration challenge is missing");
  }
  const verification = await verifyRegistrationResponse({
    response: response as Parameters<typeof verifyRegistrationResponse>[0]["response"],
    expectedChallenge: state.registrationChallenge,
    expectedOrigin: origin,
    expectedRPID: authRpId()
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Passkey registration failed");
  }

  const {credential} = verification.registrationInfo;
  writeAuthState({
    credential: {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports
    }
  });
}

export async function loginOptions() {
  const state = readAuthState();
  if (!state.credential) {
    throw new Error("Passkey is not registered");
  }
  const options = await generateAuthenticationOptions({
    rpID: authRpId(),
    allowCredentials: [{id: state.credential.id, transports: state.credential.transports as AuthenticatorTransportFuture[] | undefined}]
  });
  writeAuthState({...state, loginChallenge: options.challenge});
  return options;
}

export async function verifyLogin(response: unknown, origin = authOrigin()) {
  assertAllowedOrigin(origin);
  const state = readAuthState();
  if (!state.credential || !state.loginChallenge) {
    throw new Error("Login challenge is missing");
  }
  const verification = await verifyAuthenticationResponse({
    response: response as Parameters<typeof verifyAuthenticationResponse>[0]["response"],
    expectedChallenge: state.loginChallenge,
    expectedOrigin: origin,
    expectedRPID: authRpId(),
    credential: credentialToWebAuthn(state.credential)
  });
  if (!verification.verified) {
    throw new Error("Passkey login failed");
  }
  writeAuthState({
    credential: {
      ...state.credential,
      counter: verification.authenticationInfo.newCounter
    }
  });
}
