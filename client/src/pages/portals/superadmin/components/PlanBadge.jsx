import React from 'react';

/**
 * PlanBadge — Subscription plan badge indicator
 * Used in SchoolsView and BillingView tables
 */
const PlanBadge = ({ plan }) => {
  const map = {
    starter:      'badge-gray',
    professional: 'badge-blue',
    enterprise:   'badge-amber',
  };

  return (
    <span className={`badge ${map[plan] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
      {plan || 'Starter'}
    </span>
  );
};

export default PlanBadge;
