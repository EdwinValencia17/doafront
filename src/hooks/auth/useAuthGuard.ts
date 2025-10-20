import { useAuth } from "./useAuth";

/** Guard básico con soporte opcional de roles */
export function useAuthGuard(requiredRoles?: string[]) {
  const { accessToken, user, hydrated } = useAuth();

  const isAuth = !!accessToken && !!user;

  // Roles opcionales: si no se pasan, no se valida
  let hasRole = true;
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user?.roles ?? (user?.role ? [user.role] : []);
    hasRole = requiredRoles.some((r) => userRoles.includes(r));
  }

  return { hydrated, isAuth, hasRole, user };
}
