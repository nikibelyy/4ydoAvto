export default function Loading() {
  return <main className="min-h-screen bg-[var(--canvas)] p-5 md:p-8">
    <div className="mx-auto max-w-7xl animate-pulse space-y-5">
      <div className="h-12 w-64 rounded-xl bg-[var(--panel-muted)]" />
      <div className="h-10 rounded-xl bg-[var(--panel-muted)]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 28 }, (_, i) => <div key={i} className="h-24 rounded-xl bg-[var(--panel-muted)]" />)}
      </div>
    </div>
  </main>;
}
