import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/axios";
import { endpointList } from "@/shared/api/endpoint";
import { useAuthStore } from "@/shared/stores/auth.store";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrated, clearUser } = useAuthStore();

  const logout = async () => {
    try {
      await api.post(endpointList.auth.logout);
    } finally {
      clearUser();
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["userProfile"] });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: !isHydrated,
    logout,
  };
};
