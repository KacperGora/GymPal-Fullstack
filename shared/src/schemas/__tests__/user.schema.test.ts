import { describe, it, expect } from "vitest";
import { createUserSchema } from "../user.schema.js";

describe("createUserSchema", () => {
  const valid = {
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan@test.pl",
    password: "password123",
  };

  it("should accept valid data", () => {
    expect(createUserSchema.parse(valid)).toEqual(valid);
  });

  it("should reject invalid email", () => {
    expect(() =>
      createUserSchema.parse({ ...valid, email: "not-email" }),
    ).toThrow();
  });

  it("should reject password shorter than 8 characters", () => {
    expect(() =>
      createUserSchema.parse({ ...valid, password: "short" }),
    ).toThrow();
  });

  it("should reject missing firstName", () => {
    const { firstName, ...rest } = valid;
    expect(() => createUserSchema.parse(rest)).toThrow();
  });

  it("should reject missing lastName", () => {
    const { lastName, ...rest } = valid;
    expect(() => createUserSchema.parse(rest)).toThrow();
  });

  it("should accept password exactly 8 characters", () => {
    expect(
      createUserSchema.parse({ ...valid, password: "12345678" }).password,
    ).toBe("12345678");
  });
});
