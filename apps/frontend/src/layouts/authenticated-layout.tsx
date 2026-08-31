import { Outlet } from "@tanstack/react-router";
import { SideBar } from "../components/layout/sidebar";

export function AuthenticatedLayout() {
  return (
    <div className="flex min-h-dvh bg-page">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
