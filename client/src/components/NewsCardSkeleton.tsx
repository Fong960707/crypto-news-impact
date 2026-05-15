export default function NewsCardSkeleton() {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.18 0.015 265)" }}
    >
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-16 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton w-1.5 h-1.5 rounded-full" />)}
        </div>
      </div>
    </div>
  );
}
