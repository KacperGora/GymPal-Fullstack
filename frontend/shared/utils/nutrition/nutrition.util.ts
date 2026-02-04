export const calculateBMR = (weight: number, height: number, age: number) => {
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
};

export const calculateTDEE = (bmr: number, activity: number) => {
  return Math.round(bmr * activity);
};

export const calculateTargetCalories = (tdee: number, goal: string) => {
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500);
    case 'gain':
      return Math.round(tdee + 300);
    default:
      return tdee;
  }
};
