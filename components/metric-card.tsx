export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-brand-700">{value}</p>
    </div>
  );
}

