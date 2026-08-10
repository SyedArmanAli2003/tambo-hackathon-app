import { useState } from "react";

export const ANONYMOUS_USER_STORAGE_KEY =
  "dashboard-builder.anonymous-user-key";
export const ANONYMOUS_USER_PREFIX = "dashboard-builder-anonymous-";

type UserKeyStorage = Pick<Storage, "getItem" | "setItem">;

function createUuid(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createAnonymousUserKey(
  uuidFactory: () => string = createUuid
): string {
  return `${ANONYMOUS_USER_PREFIX}${uuidFactory()}`;
}

export function getOrCreateAnonymousUserKey(
  storage: UserKeyStorage,
  uuidFactory: () => string = createUuid
): string {
  try {
    const existing = storage.getItem(ANONYMOUS_USER_STORAGE_KEY);
    if (
      existing?.startsWith(ANONYMOUS_USER_PREFIX) &&
      existing.length > ANONYMOUS_USER_PREFIX.length
    ) {
      return existing;
    }

    const created = createAnonymousUserKey(uuidFactory);
    storage.setItem(ANONYMOUS_USER_STORAGE_KEY, created);
    return created;
  } catch {
    return createAnonymousUserKey(uuidFactory);
  }
}

export function useAnonymousUserKey(): string {
  const [userKey] = useState(() =>
    getOrCreateAnonymousUserKey(window.localStorage)
  );
  return userKey;
}
