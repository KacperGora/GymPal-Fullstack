import { describe, it, expect } from "vitest";
import { createMealSchema, updateMealSchema } from "../meals.schema.js";
describe("createMealSchema", () => {
    it("should accept valid meal with all fields", () => {
        const data = {
            name: "Chicken Breast",
            calories: 300,
            proteins: 31,
            carbs: 2,
            fats: 3.6,
            category: "LUNCH",
            date: "2025-01-15T12:00:00Z",
        };
        const result = createMealSchema.parse(data);
        expect(result.name).toBe("Chicken Breast");
        expect(result.category).toBe("LUNCH");
    });
    it("should default category to SNACK", () => {
        const data = {
            name: "Apple",
            calories: 95,
            proteins: 0.5,
            carbs: 25,
            fats: 0.3,
        };
        const result = createMealSchema.parse(data);
        expect(result.category).toBe("SNACK");
    });
    it("should reject empty name", () => {
        const data = {
            name: "",
            calories: 100,
            proteins: 5,
            carbs: 10,
            fats: 2,
        };
        expect(() => createMealSchema.parse(data)).toThrow();
    });
    it("should reject negative calories", () => {
        const data = {
            name: "Bad Meal",
            calories: -100,
            proteins: 5,
            carbs: 10,
            fats: 2,
        };
        expect(() => createMealSchema.parse(data)).toThrow();
    });
    it("should reject non-integer calories", () => {
        const data = {
            name: "Meal",
            calories: 100.5,
            proteins: 5,
            carbs: 10,
            fats: 2,
        };
        expect(() => createMealSchema.parse(data)).toThrow();
    });
    it("should reject invalid category", () => {
        const data = {
            name: "Meal",
            calories: 100,
            proteins: 5,
            carbs: 10,
            fats: 2,
            category: "INVALID",
        };
        expect(() => createMealSchema.parse(data)).toThrow();
    });
});
describe("updateMealSchema", () => {
    it("should accept empty object", () => {
        const result = updateMealSchema.parse({});
        expect(result).toEqual({});
    });
    it("should accept partial update", () => {
        const data = { name: "Updated Meal", calories: 200 };
        const result = updateMealSchema.parse(data);
        expect(result.name).toBe("Updated Meal");
        expect(result.calories).toBe(200);
    });
});
