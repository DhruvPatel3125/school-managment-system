import React from 'react';

/**
 * StatusBadge — Colored status indicator badge
 * Used in SchoolsView, HealthView tables
 */
const StatusBadge = ({ status }) => {
  const map = {
    active:    { cls: 'badge-green', dot: '#16A34A', label: 'Active' },
    suspended: { cls: 'badge-red',   dot: '#DC2626', label: 'Suspended' },
    trial:     { cls: 'badge-amber', dot: '#D97706', label: 'Trial' },
    new:       { cls: 'badge-amber', dot: '#D97706', label: 'New' },
    contacted: { cls: 'badge-blue',  dot: '#2563EB', label: 'Contacted' },
    closed:    { cls: 'badge-gray',  dot: '#6B7280', label: 'Closed' },
    healthy:   { cls: 'badge-green', dot: '#16A34A', label: 'Healthy' },
    degraded:  { cls: 'badge-amber', dot: '#D97706', label: 'Degraded' },
    down:      { cls: 'badge-red',   dot: '#DC2626', label: 'Down' },
  };
  const s = map[status?.toLowerCase()] || map.active;

  return (
    <span className={`badge ${s.cls}`}>
      <span className="badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

export default StatusBadge;
