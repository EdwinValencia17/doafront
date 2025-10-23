// src/routes/router.tsx
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/pages/App";
import LoginPage from "@/pages/Home/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import HomeDashboard from "@/pages/Home/HomeDashboard";

// privadas (lazy)
const ReglasPage = lazy(() => import("@/pages/Gestiones/DoaReglas/ReglasPage"));
// pública (lazy o directa, como prefieras)
const SolicitanteExternoPage = lazy(() => import("@/pages/Gestiones/Solicitante/SolicitanteExterno"));
const NivelCeroPage = lazy(() => import("@/pages/OrdenesDeCompra/NivelCeroPage"));

const router = createBrowserRouter([
  // 🔓 RUTAS PÚBLICAS
  { path: "/login", Component: LoginPage },
  { path: "/solicitante", Component: SolicitanteExternoPage },

  // 🔒 RUTAS PRIVADAS
  {
    path: "/",
    Component: App,
    children: [
      {
        Component: ProtectedRoute,
        children: [
          { index: true, Component: HomeDashboard },
          { path: "doa/reglas", Component: ReglasPage },
          { path: "doa/nivelcero", Component: NivelCeroPage },
        ],
      },
    ],
  },
]);

export default router;
