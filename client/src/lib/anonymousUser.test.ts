import { describe, expect, it } from "vitest";
import {
  ANONYMOUS_USER_STORAGE_KEY,
  getOrCreateAnonymousUserKey,
} from "./anonymousUser";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("anonymous user identity", () => {
  it("creates, stores, and reuses one anonymous user key", () => {
    const storage = new MemoryStorage();
    const first = getOrCreateAnonymousUserKey(storage, () => "first-id");
    const second = getOrCreateAnonymousUserKey(storage, () => "second-id");

    expect(first).toBe("dashboard-builder-anonymous-first-id");
    expect(second).toBe(first);
    expect(storage.getItem(ANONYMOUS_USER_STORAGE_KEY)).toBe(first);
  });

  it("does not reuse malformed persisted values", () => {
    const storage = new MemoryStorage();
    storage.setItem(ANONYMOUS_USER_STORAGE_KEY, "shared-user");

    expect(getOrCreateAnonymousUserKey(storage, () => "replacement")).toBe(
      "dashboard-builder-anonymous-replacement"
    );
  });
});
