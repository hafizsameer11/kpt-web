import { useEffect, useState } from "react";

/** Time-of-day greeting used across every home concept. Hydration-safe. */
export function useGreeting() {
  const [greeting, setGreeting] = useState("Good day");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return greeting;
}

/** Inline time-aware greeting text, e.g. "Good afternoon". */
export function GreetingText() {
  return <>{useGreeting()}</>;
}
