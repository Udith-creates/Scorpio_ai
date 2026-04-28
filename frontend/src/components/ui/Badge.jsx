export function VerdictBadge({ verdict }) {
  const label = (verdict || 'pending').replace(/_/g, ' ').toUpperCase();
  return (
    <span className={`verdict-badge verdict-${verdict || 'pending'}`}>{label}</span>
  );
}

export function StatusBadge({ status }) {
  const label = (status || '').replace(/_/g, ' ').toUpperCase();
  return (
    <span className={`text-xs font-medium status-${status}`}>{label}</span>
  );
}
