import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/pages/App";
import LoginPage from "@/pages/Home/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import HomeDashboard from "@/pages/Home/HomeDashboard";

const ReglasPage = lazy(() => import("@/pages/Doa/ReglasPage"));

const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    path: "/",
    Component: App,
    children: [
      {
        Component: ProtectedRoute,
        children: [
          { index: true, Component: HomeDashboard },
          { path: "doa/reglas", Component: ReglasPage },
        ],
      },
    ],
  },
]);

export default router;
