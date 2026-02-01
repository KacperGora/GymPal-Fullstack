import { RegisterDto } from "@gympal/shared";
import { useMutation } from "@tanstack/react-query";

import { register } from "@/features/auth/api/auth.api";
import { useRouter } from "@/i18n/navigation";

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterDto) => register(data),
    onSuccess: () => {
      router.push("/login");
    },
  });
};
