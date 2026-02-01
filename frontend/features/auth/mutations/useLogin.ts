import { LoginDto } from "@gympal/shared";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { login } from "@/features/auth/api/auth.api";
import { useRouter } from "@/i18n/navigation";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) => login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
};
