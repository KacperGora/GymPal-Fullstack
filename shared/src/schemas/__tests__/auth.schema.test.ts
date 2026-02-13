import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  registerFormSchema,
} from "../auth.schema.js";

describe("registerSchema", () => {
  it("should accept valid data with strong password", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password123!",
    };
    const result = registerSchema.parse(data);
    expect(result).toEqual(data);
  });

  it("should reject missing firstName", () => {
    const data = {
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password123!",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should reject invalid email", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "not-an-email",
      password: "Password123!",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should reject password shorter than 8 characters", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Pass1!",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should reject password without uppercase letter", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "password123!",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should reject password without lowercase letter", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "PASSWORD123!",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should reject password without digit", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password!",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should reject password without special character", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password123",
    };
    expect(() => registerSchema.parse(data)).toThrow();
  });

  it("should accept all valid special characters", () => {
    const specialChars = ["@", "$", "!", "%", "*", "?", "&"];

    specialChars.forEach((char) => {
      const data = {
        firstName: "Jan",
        lastName: "Kowalski",
        email: "jan@test.pl",
        password: `Password123${char}`,
      };
      const result = registerSchema.parse(data);
      expect(result).toEqual(data);
    });
  });
});

describe("loginSchema", () => {
  it("should accept valid data", () => {
    const data = { email: "jan@test.pl", password: "password123" };
    const result = loginSchema.parse(data);
    expect(result).toEqual(data);
  });

  it("should reject invalid email", () => {
    expect(() =>
      loginSchema.parse({ email: "bad", password: "password123" }),
    ).toThrow();
  });

  it("should reject short password", () => {
    expect(() =>
      loginSchema.parse({ email: "jan@test.pl", password: "short" }),
    ).toThrow();
  });
});

describe("registerFormSchema", () => {
  it("should accept when strong passwords match", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password123!",
      confirmPassword: "Password123!",
    };
    const result = registerFormSchema.parse(data);
    expect(result.email).toBe("jan@test.pl");
  });

  it("should reject when passwords do not match", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password123!",
      confirmPassword: "Different123!",
    };
    expect(() => registerFormSchema.parse(data)).toThrow();
  });

  it("should reject weak password in confirmPassword field", () => {
    const data = {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@test.pl",
      password: "Password123!",
      confirmPassword: "weakpassword",
    };
    expect(() => registerFormSchema.parse(data)).toThrow();
  });
});
