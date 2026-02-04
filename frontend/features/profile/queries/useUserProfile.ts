import { useQuery } from "@tanstack/react-query";

import { getUserProfile } from "../api/profile.api";

export const useUserProfile = (enabled: boolean) =>
  useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled,
  });
