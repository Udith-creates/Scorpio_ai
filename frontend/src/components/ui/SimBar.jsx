export function SimBar({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  const color =
    score > 0.9  ? 'bg-red-500' :
    score > 0.75 ? 'bg-yellow-500' :
                   'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-white/10 rounded-full h-1.5">
        <div
          className={`progress-bar ${color} h-1.5 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs mono text-slate-400 w-10 text-right">{pct}%</span>
    </div>
  );
}
