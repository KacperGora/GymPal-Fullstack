import { describe, it, expect } from "vitest";
import { waterQuerySchema } from "../water.schema.js";
describe("waterQuerySchema", () => {
    it("should accept valid date in YYYY-MM-DD format", () => {
        const data = { date: "2026-02-13" };
        const result = waterQuerySchema.parse(data);
        expect(result).toEqual(data);
    });
    it("should reject invalid date format", () => {
        const data = { date: "13-02-2026" };
        expect(() => waterQuerySchema.parse(data)).toThrow("Date must be in YYYY-MM-DD format");
    });
    it("should reject date with wrong separators", () => {
        const data = { date: "2026/02/13" };
        expect(() => waterQuerySchema.parse(data)).toThrow("Date must be in YYYY-MM-DD format");
    });
    it("should reject invalid date value", () => {
        const data = { date: "2026-13-45" };
        expect(() => waterQuerySchema.parse(data)).toThrow("Invalid date");
    });
    it("should reject missing date", () => {
        const data = {};
        expect(() => waterQuerySchema.parse(data)).toThrow();
    });
    it("should reject non-string date", () => {
        const data = { date: 20260213 };
        expect(() => waterQuerySchema.parse(data)).toThrow();
    });
    it("should accept leap year date", () => {
        const data = { date: "2024-02-29" };
        const result = waterQuerySchema.parse(data);
        expect(result).toEqual(data);
    });
});
