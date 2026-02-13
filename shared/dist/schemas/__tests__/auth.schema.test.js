import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, registerFormSchema, } from "../auth.schema.js";
describe("registerSchema", () => {
    it("should accept valid data", () => {
        const data = {
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan@test.pl",
            password: "password123",
        };
        const result = registerSchema.parse(data);
        expect(result).toEqual(data);
    });
    it("should reject missing firstName", () => {
        const data = {
            lastName: "Kowalski",
            email: "jan@test.pl",
            password: "password123",
        };
        expect(() => registerSchema.parse(data)).toThrow();
    });
    it("should reject invalid email", () => {
        const data = {
            firstName: "Jan",
            lastName: "Kowalski",
            email: "not-an-email",
            password: "password123",
        };
        expect(() => registerSchema.parse(data)).toThrow();
    });
    it("should reject password shorter than 8 characters", () => {
        const data = {
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan@test.pl",
            password: "short",
        };
        expect(() => registerSchema.parse(data)).toThrow();
    });
});
describe("loginSchema", () => {
    it("should accept valid data", () => {
        const data = { email: "jan@test.pl", password: "password123" };
        const result = loginSchema.parse(data);
        expect(result).toEqual(data);
    });
    it("should reject invalid email", () => {
        expect(() => loginSchema.parse({ email: "bad", password: "password123" })).toThrow();
    });
    it("should reject short password", () => {
        expect(() => loginSchema.parse({ email: "jan@test.pl", password: "short" })).toThrow();
    });
});
describe("registerFormSchema", () => {
    it("should accept when passwords match", () => {
        const data = {
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan@test.pl",
            password: "password123",
            confirmPassword: "password123",
        };
        const result = registerFormSchema.parse(data);
        expect(result.email).toBe("jan@test.pl");
    });
    it("should reject when passwords do not match", () => {
        const data = {
            firstName: "Jan",
            lastName: "Kowalski",
            email: "jan@test.pl",
            password: "password123",
            confirmPassword: "different123",
        };
        expect(() => registerFormSchema.parse(data)).toThrow();
    });
});
