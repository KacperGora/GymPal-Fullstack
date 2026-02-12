import { describe, it, expect } from "vitest";
import {
  exerciseCategoryEnum,
  createWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  createWorkoutSessionSchema,
  updateWorkoutSessionSchema,
  workoutQuerySchema,
} from "../workouts.schema.js";

describe("exerciseCategoryEnum", () => {
  it("should accept valid categories", () => {
    for (const cat of ["STRENGTH", "CARDIO", "FLEXIBILITY", "HIIT"]) {
      expect(exerciseCategoryEnum.parse(cat)).toBe(cat);
    }
  });

  it("should reject invalid category", () => {
    expect(() => exerciseCategoryEnum.parse("YOGA")).toThrow();
  });
});

describe("createWorkoutExerciseSchema", () => {
  const valid = {
    wgerExerciseId: 1,
    exerciseName: "Squat",
    sets: 3,
    reps: 10,
    weight: 60,
    restTime: 90,
  };

  it("should accept valid data", () => {
    expect(createWorkoutExerciseSchema.parse(valid)).toEqual(valid);
  });

  it("should accept optional fields", () => {
    const data = { ...valid, exerciseCategory: "STRENGTH", notes: "Go deep" };
    expect(createWorkoutExerciseSchema.parse(data)).toEqual(data);
  });

  it("should reject non-positive sets", () => {
    expect(() =>
      createWorkoutExerciseSchema.parse({ ...valid, sets: 0 }),
    ).toThrow();
  });

  it("should reject non-positive reps", () => {
    expect(() =>
      createWorkoutExerciseSchema.parse({ ...valid, reps: -1 }),
    ).toThrow();
  });

  it("should reject negative weight", () => {
    expect(() =>
      createWorkoutExerciseSchema.parse({ ...valid, weight: -5 }),
    ).toThrow();
  });

  it("should accept zero weight (bodyweight)", () => {
    expect(
      createWorkoutExerciseSchema.parse({ ...valid, weight: 0 }).weight,
    ).toBe(0);
  });

  it("should reject negative restTime", () => {
    expect(() =>
      createWorkoutExerciseSchema.parse({ ...valid, restTime: -10 }),
    ).toThrow();
  });

  it("should accept zero restTime", () => {
    expect(
      createWorkoutExerciseSchema.parse({ ...valid, restTime: 0 }).restTime,
    ).toBe(0);
  });

  it("should reject empty exerciseName", () => {
    expect(() =>
      createWorkoutExerciseSchema.parse({ ...valid, exerciseName: "" }),
    ).toThrow();
  });
});

describe("updateWorkoutExerciseSchema", () => {
  it("should accept partial data", () => {
    expect(updateWorkoutExerciseSchema.parse({ sets: 5 })).toEqual({ sets: 5 });
  });

  it("should accept empty object", () => {
    expect(updateWorkoutExerciseSchema.parse({})).toEqual({});
  });

  it("should validate constraints on provided fields", () => {
    expect(() => updateWorkoutExerciseSchema.parse({ reps: -1 })).toThrow();
  });
});

describe("createWorkoutSessionSchema", () => {
  const valid = {
    name: "Push Day",
    duration: 60,
    caloriesBurned: 350,
  };

  it("should accept valid data", () => {
    expect(createWorkoutSessionSchema.parse(valid)).toEqual(valid);
  });

  it("should accept optional exercises array", () => {
    const data = {
      ...valid,
      exercises: [
        {
          wgerExerciseId: 1,
          exerciseName: "Bench Press",
          sets: 3,
          reps: 10,
          weight: 80,
          restTime: 90,
        },
      ],
    };
    expect(createWorkoutSessionSchema.parse(data).exercises).toHaveLength(1);
  });

  it("should accept optional date", () => {
    const data = { ...valid, date: "2025-01-15T10:00:00.000Z" };
    expect(createWorkoutSessionSchema.parse(data).date).toBe(data.date);
  });

  it("should reject non-positive duration", () => {
    expect(() =>
      createWorkoutSessionSchema.parse({ ...valid, duration: 0 }),
    ).toThrow();
  });

  it("should reject negative caloriesBurned", () => {
    expect(() =>
      createWorkoutSessionSchema.parse({ ...valid, caloriesBurned: -10 }),
    ).toThrow();
  });

  it("should reject empty name", () => {
    expect(() =>
      createWorkoutSessionSchema.parse({ ...valid, name: "" }),
    ).toThrow();
  });
});

describe("updateWorkoutSessionSchema", () => {
  it("should accept partial data", () => {
    expect(updateWorkoutSessionSchema.parse({ name: "Pull Day" })).toEqual({
      name: "Pull Day",
    });
  });

  it("should accept empty object", () => {
    expect(updateWorkoutSessionSchema.parse({})).toEqual({});
  });
});

describe("workoutQuerySchema", () => {
  it("should accept empty query", () => {
    expect(workoutQuerySchema.parse({})).toEqual({});
  });

  it("should accept valid date range", () => {
    const data = {
      startDate: "2025-01-01T00:00:00.000Z",
      endDate: "2025-01-31T23:59:59.000Z",
    };
    expect(workoutQuerySchema.parse(data)).toEqual(data);
  });

  it("should coerce limit from string to number", () => {
    expect(workoutQuerySchema.parse({ limit: "10" }).limit).toBe(10);
  });

  it("should reject non-positive limit", () => {
    expect(() => workoutQuerySchema.parse({ limit: 0 })).toThrow();
  });

  it("should reject invalid datetime format", () => {
    expect(() =>
      workoutQuerySchema.parse({ startDate: "not-a-date" }),
    ).toThrow();
  });
});
