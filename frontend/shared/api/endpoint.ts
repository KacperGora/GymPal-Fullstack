export const endpointList = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    getMe: '/auth/me',
  },
  userProfile: {
    get: '/user-profile',
    upsert: '/user-profile',
  },
  meals: {
    list: '/meals',
    recent: '/meals/recent',
    create: '/meals',
    get: (id: string) => `/meals/${id}`,
    update: (id: string) => `/meals/${id}`,
    delete: (id: string) => `/meals/${id}`,
  },
  nutrition: {
    dailyStats: '/nutrition/daily-stats',
    weeklyStats: '/nutrition/weekly-stats',
    tdee: '/nutrition/tdee',
  },
  water: {
    get: '/water',
    add: '/water/add',
    remove: '/water/remove',
  },
  favorites: {
    list: '/favorites',
    create: '/favorites',
    delete: (id: string) => `/favorites/${id}`,
  },
  exercisesApi: {
    list: '/exercises-api',
    categories: '/exercises-api/categories',
    muscles: '/exercises-api/muscles',
    equipment: '/exercises-api/equipment',
    byCategory: (id: number) => `/exercises-api/category/${id}`,
    byMuscle: (id: number) => `/exercises-api/muscle/${id}`,
    byEquipment: (id: number) => `/exercises-api/equipment/${id}`,
    search: (term: string) => `/exercises-api/search/${term}`,
    exercise: (id: number) => `/exercises-api/exercise/${id}`,
    favorites: '/exercises-api/favorites',
    favoriteIds: '/exercises-api/favorites/ids',
    deleteFavorite: (id: string) => `/exercises-api/favorites/${id}`,
  },
};
