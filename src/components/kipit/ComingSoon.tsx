import { AppShell } from "./AppShell";

export function ComingSoon({ screen, title }: { screen: string; title: string }) {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-foreground">
          {screen}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We're building the prototype screen by screen. This screen comes next.
        </p>
      </div>
    </AppShell>
  );
}
