export interface WgerExercise {
  id: number;
  name: string;
  description: string;
  category: string;
  categoryId: number;
  muscles: string[];
  musclesSecondary: string[];
  equipment: string[];
  images: string[];
}

export interface WgerCategory {
  id: number;
  name: string;
}

export interface WgerMuscle {
  id: number;
  name: string;
  nameEn: string;
  isFront: boolean;
}

export interface WgerEquipment {
  id: number;
  name: string;
}

export interface WgerPaginated {
  count: number;
  next: string | null;
  previous: string | null;
  results: WgerExercise[];
}

export interface FavoriteExercise {
  id: string;
  wgerExerciseId: number;
  name: string;
  category: string;
  muscles: string;
  equipment: string;
  imageUrl: string | null;
  userId: number;
  createdAt: string;
}
