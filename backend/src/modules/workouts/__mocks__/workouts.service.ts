export class WorkoutsService {
  findAllExercises = jest.fn();
  findExerciseById = jest.fn();
  findExercisesByCategory = jest.fn();
  createWorkoutSession = jest.fn();
  findAllWorkoutSessions = jest.fn();
  findWorkoutSessionById = jest.fn();
  updateWorkoutSession = jest.fn();
  deleteWorkoutSession = jest.fn();
  addExerciseToWorkout = jest.fn();
  updateWorkoutExercise = jest.fn();
  removeExerciseFromWorkout = jest.fn();
}
