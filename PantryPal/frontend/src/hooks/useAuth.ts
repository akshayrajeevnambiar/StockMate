import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth";

export function useAuth() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: authService.logout,
  };
}
