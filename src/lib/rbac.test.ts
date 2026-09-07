import { describe, expect, it } from "vitest";

import { hasPermission, resolveRolesFromClaims } from "./rbac";

describe("RBAC", () => {
  it("grants wildcard permissions to administrators", () => {
    expect(hasPermission(["admin"], "routing.manage")).toBe(true);
  });

  it("does not grant access management to a host", () => {
    expect(hasPermission(["host"], "access.manage")).toBe(false);
  });

  it("maps identity provider groups to application roles", () => {
    expect(resolveRolesFromClaims({ groups: ["revenue-managers"] })).toEqual(["manager"]);
  });
});
