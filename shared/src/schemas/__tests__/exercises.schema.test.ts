import { describe, it, expect } from "vitest";
import {
  wgerExerciseSchema,
  wgerCategorySchema,
  wgerMuscleSchema,
  wgerEquipmentSchema,
  wgerPaginatedSchema,
  createFavoriteExerciseSchema,
} from "../exercises.schema.js";

describe("wgerExerciseSchema", () => {
  const valid = {
    id: 1,
    name: "Bench Press",
    description: "Chest exercise",
    category: "Chest",
    categoryId: 11,
    muscles: ["Pectoralis major"],
    musclesSecondary: ["Triceps"],
    equipment: ["Barbell"],
    images: ["https://example.com/img.jpg"],
  };

  it("should accept valid exercise data", () => {
    expect(wgerExerciseSchema.parse(valid)).toEqual(valid);
  });

  it("should accept empty arrays", () => {
    const data = {
      ...valid,
      muscles: [],
      musclesSecondary: [],
      equipment: [],
      images: [],
    };
    expect(wgerExerciseSchema.parse(data)).toEqual(data);
  });

  it("should reject missing name", () => {
    const { name, ...rest } = valid;
    expect(() => wgerExerciseSchema.parse(rest)).toThrow();
  });

  it("should reject non-number id", () => {
    expect(() => wgerExerciseSchema.parse({ ...valid, id: "abc" })).toThrow();
  });
});

describe("wgerCategorySchema", () => {
  it("should accept valid category", () => {
    expect(wgerCategorySchema.parse({ id: 1, name: "Arms" })).toEqual({
      id: 1,
      name: "Arms",
    });
  });

  it("should reject missing id", () => {
    expect(() => wgerCategorySchema.parse({ name: "Arms" })).toThrow();
  });
});

describe("wgerMuscleSchema", () => {
  it("should accept valid muscle", () => {
    const data = {
      id: 1,
      name: "Biceps",
      nameEn: "Biceps brachii",
      isFront: true,
    };
    expect(wgerMuscleSchema.parse(data)).toEqual(data);
  });

  it("should reject non-boolean isFront", () => {
    expect(() =>
      wgerMuscleSchema.parse({
        id: 1,
        name: "Biceps",
        nameEn: "Biceps",
        isFront: "yes",
      }),
    ).toThrow();
  });
});

describe("wgerEquipmentSchema", () => {
  it("should accept valid equipment", () => {
    expect(wgerEquipmentSchema.parse({ id: 1, name: "Barbell" })).toEqual({
      id: 1,
      name: "Barbell",
    });
  });
});

describe("wgerPaginatedSchema", () => {
  it("should accept valid paginated response", () => {
    const data = {
      count: 1,
      next: "https://api.example.com?page=2",
      previous: null,
      results: [
        {
          id: 1,
          name: "Squat",
          description: "",
          category: "Legs",
          categoryId: 9,
          muscles: [],
          musclesSecondary: [],
          equipment: [],
          images: [],
        },
      ],
    };
    expect(wgerPaginatedSchema.parse(data)).toEqual(data);
  });

  it("should accept null next and previous", () => {
    const data = { count: 0, next: null, previous: null, results: [] };
    expect(wgerPaginatedSchema.parse(data)).toEqual(data);
  });
});

describe("createFavoriteExerciseSchema", () => {
  const valid = {
    wgerExerciseId: 42,
    name: "Bench Press",
    category: "Chest",
    muscles: "Pectoralis major",
    equipment: "Barbell",
  };

  it("should accept valid data", () => {
    expect(createFavoriteExerciseSchema.parse(valid)).toEqual(valid);
  });

  it("should accept optional imageUrl", () => {
    const data = { ...valid, imageUrl: "https://example.com/img.jpg" };
    expect(createFavoriteExerciseSchema.parse(data)).toEqual(data);
  });

  it("should reject non-positive wgerExerciseId", () => {
    expect(() =>
      createFavoriteExerciseSchema.parse({ ...valid, wgerExerciseId: -1 }),
    ).toThrow();
  });

  it("should reject empty name", () => {
    expect(() =>
      createFavoriteExerciseSchema.parse({ ...valid, name: "" }),
    ).toThrow();
  });

  it("should reject empty category", () => {
    expect(() =>
      createFavoriteExerciseSchema.parse({ ...valid, category: "" }),
    ).toThrow();
  });

  it("should reject empty muscles", () => {
    expect(() =>
      createFavoriteExerciseSchema.parse({ ...valid, muscles: "" }),
    ).toThrow();
  });

  it("should accept empty equipment string", () => {
    const data = { ...valid, equipment: "" };
    expect(createFavoriteExerciseSchema.parse(data)).toEqual(data);
  });
});
