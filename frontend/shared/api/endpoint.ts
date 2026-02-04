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
};
