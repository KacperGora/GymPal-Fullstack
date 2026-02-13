import { describe, it, expect } from "vitest";
import { CreateUserProfileSchema, UpdateUserProfileSchema, } from "../user-profile.schema.js";
describe("CreateUserProfileSchema", () => {
    const valid = {
        height: 180,
        weight: 80,
        age: 25,
        activity: 1.5,
        goal: "maintain",
    };
    it("should accept valid data", () => {
        expect(CreateUserProfileSchema.parse(valid)).toEqual(valid);
    });
    it("should accept all goal types", () => {
        for (const goal of ["lose", "maintain", "gain"]) {
            expect(CreateUserProfileSchema.parse({ ...valid, goal })).toEqual({
                ...valid,
                goal,
            });
        }
    });
    it("should reject invalid goal", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, goal: "bulk" })).toThrow();
    });
    it("should reject non-positive height", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, height: 0 })).toThrow();
        expect(() => CreateUserProfileSchema.parse({ ...valid, height: -10 })).toThrow();
    });
    it("should reject non-positive weight", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, weight: 0 })).toThrow();
        expect(() => CreateUserProfileSchema.parse({ ...valid, weight: -10 })).toThrow();
    });
    it("should reject non-integer age", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, age: 25.5 })).toThrow();
    });
    it("should reject non-positive age", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, age: 0 })).toThrow();
    });
    it("should reject activity below 1.2", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, activity: 1.0 })).toThrow();
    });
    it("should reject activity above 2.5", () => {
        expect(() => CreateUserProfileSchema.parse({ ...valid, activity: 3.0 })).toThrow();
    });
    it("should accept activity at boundaries", () => {
        expect(CreateUserProfileSchema.parse({ ...valid, activity: 1.2 }).activity).toBe(1.2);
        expect(CreateUserProfileSchema.parse({ ...valid, activity: 2.5 }).activity).toBe(2.5);
    });
});
describe("UpdateUserProfileSchema", () => {
    it("should accept partial data", () => {
        expect(UpdateUserProfileSchema.parse({ weight: 85 })).toEqual({
            weight: 85,
        });
    });
    it("should accept empty object", () => {
        expect(UpdateUserProfileSchema.parse({})).toEqual({});
    });
    it("should still validate field constraints", () => {
        expect(() => UpdateUserProfileSchema.parse({ height: -5 })).toThrow();
    });
});
