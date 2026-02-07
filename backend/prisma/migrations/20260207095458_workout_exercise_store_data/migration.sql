-- Step 1: Add new columns as NULLABLE first
ALTER TABLE "WorkoutExercise"
ADD COLUMN "exerciseCategory" TEXT,
ADD COLUMN "exerciseName" TEXT,
ADD COLUMN "wgerExerciseId" INTEGER;

-- Step 2: Backfill data from Exercise table via existing FK
UPDATE "WorkoutExercise" we
SET
  "exerciseName" = e."name",
  "exerciseCategory" = e."category"::TEXT,
  "wgerExerciseId" = 0
FROM "Exercise" e
WHERE we."exerciseId" = e."id";

-- Step 3: Set default for any remaining NULL values (orphaned records)
UPDATE "WorkoutExercise"
SET
  "exerciseName" = 'Unknown Exercise',
  "wgerExerciseId" = 0
WHERE "exerciseName" IS NULL OR "wgerExerciseId" IS NULL;

-- Step 4: Now add NOT NULL constraints
ALTER TABLE "WorkoutExercise"
ALTER COLUMN "exerciseName" SET NOT NULL,
ALTER COLUMN "wgerExerciseId" SET NOT NULL;

-- Step 5: Drop FK constraint
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_exerciseId_fkey";

-- Step 6: Drop old column
ALTER TABLE "WorkoutExercise" DROP COLUMN "exerciseId";
