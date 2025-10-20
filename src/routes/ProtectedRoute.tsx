// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";

export default function ProtectedRoute() {
  const { hydrated, isAuth } = useAuthGuard(); // 👈 sin roles
  if (!hydrated) return null;
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
