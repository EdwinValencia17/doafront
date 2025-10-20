import { Outlet } from "react-router-dom";
import AppShell from "../components/layout/AppShell"; // el que te pasé con el sidebar

export default function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}