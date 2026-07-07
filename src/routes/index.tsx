import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

// @ts-expect-error - JSX module without types
const FuelAndFlex = lazy(() => import("@/components/FuelAndFlex.jsx"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fuel & Flex — Training & Nutrition Tracker" },
      { name: "description", content: "Track workouts, protein, water, sleep and creatine with a futuristic neon-green dashboard." },
      { property: "og:title", content: "Fuel & Flex" },
      { property: "og:description", content: "Track workouts, protein, water, sleep and creatine." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <FuelAndFlex />
    </Suspense>
  );
}
