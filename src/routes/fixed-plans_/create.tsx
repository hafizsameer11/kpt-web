import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/fixed-plans_/create")({
  component: CreatePlanLayout,
});

function CreatePlanLayout() {
  return <Outlet />;
}
