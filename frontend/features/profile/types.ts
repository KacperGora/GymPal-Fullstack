export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  activity: number;
  goal: 'lose' | 'maintain' | 'gain';
}
